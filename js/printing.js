/**
 * 打印模块 - 负责处理打印和PDF导出功能
 */

/**
 * 设置打印功能
 */
export function setupPrinting() {
    const printButton = document.getElementById('print-btn');
    
    if (printButton) {
        printButton.addEventListener('click', handlePrint);
    }
}

/**
 * 处理打印请求
 */
function handlePrint() {
    // 在打印前准备文档
    preparePrintView();
    
    // 调用浏览器打印功能
    window.print();
    
    // 打印完成后恢复视图
    setTimeout(restoreView, 1000);
}

/**
 * 准备打印视图
 */
function preparePrintView() {
    // 保存当前滚动位置
    window.printScrollPos = window.scrollY;
    
    // 添加打印样式类
    document.body.classList.add('printing');
    
    // 隐藏非打印元素
    const nonPrintableElements = document.querySelectorAll('.toc-panel, .controls');
    nonPrintableElements.forEach(element => {
        element.dataset.originalDisplay = element.style.display;
        element.style.display = 'none';
    });
    
    // 调整页面容器样式
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        pagesContainer.dataset.originalStyle = pagesContainer.getAttribute('style') || '';
        pagesContainer.style.gap = '0';
        pagesContainer.style.paddingBottom = '0';
        pagesContainer.style.overflow = 'visible';
    }
    
    // 调整页面样式
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => {
        page.dataset.originalStyle = page.getAttribute('style') || '';
        page.style.margin = '0';
        page.style.boxShadow = 'none';
        page.style.overflow = 'visible';
        page.style.height = 'auto';
    });
    
    // 确保所有内容元素可见
    document.querySelectorAll('ol, ul, li, p, div').forEach(element => {
        element.style.pageBreakInside = 'avoid';
        element.style.breakInside = 'avoid';
        element.style.overflow = 'visible';
    });
    
    // 强制应用打印样式
    const style = document.createElement('style');
    style.id = 'print-force-styles';
    style.innerHTML = `
        @media print {
            body, html {
                height: auto !important;
                overflow: visible !important;
            }
            .document-container, .paper-container, #pages-container, .scrollable-content {
                height: auto !important;
                overflow: visible !important;
                display: block !important;
            }
            .content-page {
                height: auto !important;
                min-height: 0 !important;
                page-break-after: always;
                page-break-inside: avoid;
            }
            ol, ul, li {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 恢复正常视图
 */
function restoreView() {
    // 移除打印样式类
    document.body.classList.remove('printing');
    
    // 移除强制打印样式
    const printStyle = document.getElementById('print-force-styles');
    if (printStyle) {
        printStyle.parentNode.removeChild(printStyle);
    }
    
    // 恢复非打印元素
    const nonPrintableElements = document.querySelectorAll('.toc-panel, .controls');
    nonPrintableElements.forEach(element => {
        if (element.dataset.originalDisplay) {
            element.style.display = element.dataset.originalDisplay;
            delete element.dataset.originalDisplay;
        } else {
            element.style.display = '';
        }
    });
    
    // 恢复页面容器样式
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer && pagesContainer.dataset.originalStyle) {
        pagesContainer.setAttribute('style', pagesContainer.dataset.originalStyle);
        delete pagesContainer.dataset.originalStyle;
    }
    
    // 恢复页面样式
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => {
        if (page.dataset.originalStyle) {
            page.setAttribute('style', page.dataset.originalStyle);
            delete page.dataset.originalStyle;
        } else {
            page.style = '';
        }
    });
    
    // 恢复内容元素样式
    document.querySelectorAll('ol, ul, li, p, div').forEach(element => {
        element.style.pageBreakInside = '';
        element.style.breakInside = '';
        element.style.overflow = '';
    });
    
    // 恢复滚动位置
    if (window.printScrollPos !== undefined) {
        window.scrollTo(0, window.printScrollPos);
        delete window.printScrollPos;
    }
}
