/**
 * 分页模块 - 负责将论文内容分割成A4页面
 * 优化版本：更精确的分页算法和更好的内容流动
 */

// A4页面内容区域高度（减去页边距）
const PAGE_CONTENT_HEIGHT = 247; // 单位: mm，297mm - 25mm*2

// 像素到毫米的转换比例（取决于浏览器的DPI设置）
const PX_TO_MM_RATIO = 3.78; // 配合CSS中的aspect-ratio属性使用

// 元素类型权重，用于决定是否应该在新页面开始
const ELEMENT_WEIGHTS = {
    'H1': 100,  // 一级标题（章节标题）总是新页开始
    'H2': 90,   // 二级标题尽量新页开始
    'H3': 70,   // 三级标题如果当前页已经过半则新页开始
    'H4': 40,   // 四级标题不强制新页，但有一定权重
    'FIGURE': 85, // 图片尽量新页开始
    'TABLE': 85,  // 表格尽量新页开始
    'DIV.math-formula': 60, // 数学公式如果较大则考虑新页
    'BLOCKQUOTE': 65, // 引用块如果较大则考虑新页
    'UL': 50,   // 列表如果较长则考虑新页
    'OL': 50    // 有序列表如果较长则考虑新页
};

/**
 * 生成内容（支持分页和滚动）
 * @param {Node} contentNode - 论文内容节点
 * @param {HTMLElement} container - 内容容器
 * @returns {number} - 生成的页面数量
 */
export function generatePages(contentNode, container) {
    console.log('开始生成内容', contentNode);
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建内容容器（支持滚动）
    const scrollableContainer = document.createElement('div');
    scrollableContainer.className = 'scrollable-content';
    container.appendChild(scrollableContainer);
    
    // 初始化页面计数和容器
    let pageCount = 0;
    let currentPage;
    let usedHeight = 0;
    const maxPageHeight = PAGE_CONTENT_HEIGHT; // 页面最大高度（毫米）
    
    // 创建第一页
    pageCount++;
    currentPage = createPageElement(pageCount);
    scrollableContainer.appendChild(currentPage);
    
    // 克隆内容
    const content = contentNode.cloneNode(true);
    const children = Array.from(content.childNodes);
    
    // 处理每个子节点
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        
        // 跳过空文本节点
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '') {
            continue;
        }
        
        // 处理元素节点
        if (child.nodeType === Node.ELEMENT_NODE) {
            // 给标题元素添加ID，便于目录跳转
            if (['H1', 'H2', 'H3', 'H4'].includes(child.tagName) && !child.id) {
                child.id = 'heading-' + Math.random().toString(36).substr(2, 9);
            }
            
            // 克隆当前节点
            const clonedNode = child.cloneNode(true);
            const elementHeight = getEstimatedHeight(clonedNode);
            
            // 检查是否需要创建新页面
            if (shouldStartNewPage(child.tagName, usedHeight, elementHeight, maxPageHeight)) {
                // 创建新页面
                pageCount++;
                currentPage = createPageElement(pageCount);
                scrollableContainer.appendChild(currentPage);
                usedHeight = 0;
            }
            
            // 添加元素到当前页面
            currentPage.appendChild(clonedNode);
            usedHeight += elementHeight;
        }
    }
    
    // 添加页码到每个页面
    addPageNumbers(scrollableContainer);
    
    // 添加页眉（封面页除外）
    addHeaders(scrollableContainer);
    
    console.log(`内容生成完成，共 ${pageCount} 页`);
    
    // 更新总页数显示
    const totalPagesElement = document.getElementById('total-pages');
    if (totalPagesElement) {
        totalPagesElement.textContent = pageCount;
    }
    
    return pageCount;
}

/**
 * 估算内容高度
 * @param {HTMLElement} element - 要估算高度的元素
 * @returns {number} - 估算的高度（毫米）
 */
function estimateContentHeight(element) {
    if (!element || !element.offsetHeight) return 0;
    return element.offsetHeight / PX_TO_MM_RATIO;
}

/**
 * 获取元素的估算高度
 * @param {HTMLElement} element - 要估算高度的元素
 * @returns {number} - 估算的高度（毫米）
 */
function getEstimatedHeight(element) {
    // 尝试使用DOM测量获取实际高度
    const actualHeight = getMeasuredHeight(element);
    if (actualHeight > 0) {
        // 添加小量的额外空间以确保元素不会被裁剪
        return actualHeight + 2;
    }
    
    // 如果无法获取实际高度，则使用基于元素类型的预估高度
    switch (element.tagName) {
        case 'H1':
            // 一级标题（章节标题），包括上下间距
            return 18 + Math.ceil(element.textContent.length / 30) * 2; 
        case 'H2':
            // 二级标题，包括上下间距
            return 15 + Math.ceil(element.textContent.length / 40) * 2;
        case 'H3':
            // 三级标题，包括上下间距
            return 12 + Math.ceil(element.textContent.length / 50) * 1.5;
        case 'H4':
        case 'H5':
        case 'H6':
            // 其他标题，包括上下间距
            return 10 + Math.ceil(element.textContent.length / 60) * 1.5;
        case 'P':
            // 段落高度估算：基础高度 + 根据文本长度计算行数
            const fontSize = getFontSize(element) || 12; // 默认字体大小为12px
            const lineHeight = getLineHeight(element) || 1.5; // 默认行高为1.5倍字体大小
            const charsPerLine = Math.floor(170 / (fontSize / 16 * 1.2)); // 每行字符数，基于字体大小调整
            const lines = Math.ceil(element.textContent.length / charsPerLine);
            return (fontSize * lineHeight * lines) / PX_TO_MM_RATIO + 4; // 添加4mm的间距
        case 'UL':
        case 'OL':
            // 列表高度估算：基于列表项数量和内容
            const listItems = element.querySelectorAll('li');
            const itemFontSize = getFontSize(element) || 12;
            const itemLineHeight = getLineHeight(element) || 1.5;
            let totalHeight = 4; // 基础高度
            
            for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i];
                const itemCharsPerLine = Math.floor(160 / (itemFontSize / 16 * 1.2));
                const itemLines = Math.ceil(item.textContent.length / itemCharsPerLine);
                const itemHeight = (itemFontSize * itemLineHeight * itemLines) / PX_TO_MM_RATIO + 2;
                totalHeight += itemHeight;
                
                // 检查是否有嵌套列表
                if (item.querySelector('ul, ol')) {
                    totalHeight += 4;
                }
            }
            
            return totalHeight;
        case 'TABLE':
            // 表格高度估算：表头 + 每行高度 + 表格边框和间距
            const rows = element.querySelectorAll('tr');
            const tableFontSize = getFontSize(element) || 12;
            const tableLineHeight = getLineHeight(element) || 1.3;
            const headerHeight = element.querySelector('thead') ? (tableFontSize * tableLineHeight * 1.2) / PX_TO_MM_RATIO : 0;
            let rowsHeight = 0;
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                let maxCellHeight = 0;
                
                cells.forEach(cell => {
                    const cellCharsPerLine = Math.floor(140 / (tableFontSize / 16 * 1.2) / cells.length);
                    const cellLines = Math.ceil(cell.textContent.length / cellCharsPerLine);
                    const cellHeight = (tableFontSize * tableLineHeight * Math.max(1, cellLines)) / PX_TO_MM_RATIO;
                    maxCellHeight = Math.max(maxCellHeight, cellHeight);
                });
                
                rowsHeight += maxCellHeight + 1; // 添加1mm的单元格间距
            });
            
            return 8 + headerHeight + rowsHeight; // 8mm为表格边框和间距
        case 'FIGURE':
            // 图片高度估算：图片本身 + 图注
            const caption = element.querySelector('figcaption');
            const captionFontSize = caption ? getFontSize(caption) || 11 : 0;
            const captionLineHeight = caption ? getLineHeight(caption) || 1.3 : 0;
            const captionCharsPerLine = Math.floor(170 / (captionFontSize / 16 * 1.2));
            const captionLines = caption ? Math.ceil(caption.textContent.length / captionCharsPerLine) : 0;
            const captionHeight = caption ? (captionFontSize * captionLineHeight * captionLines) / PX_TO_MM_RATIO + 2 : 0;
            
            const img = element.querySelector('img');
            let imgHeight = 30; // 默认图片高度
            
            if (img) {
                if (img.naturalHeight && img.naturalWidth) {
                    // 如果图片已加载，使用实际尺寸
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    const maxWidth = 160; // 最大宽度（毫米）
                    const calculatedHeight = maxWidth / aspectRatio;
                    imgHeight = Math.min(calculatedHeight, 120); // 限制最大高度为120mm
                } else if (img.style.height) {
                    // 尝试从样式中获取高度
                    const styleHeight = parseFloat(img.style.height);
                    if (!isNaN(styleHeight)) {
                        imgHeight = styleHeight / PX_TO_MM_RATIO;
                    }
                }
            }
            
            return imgHeight + captionHeight + 10; // 10mm为图片边距
        case 'BLOCKQUOTE':
            // 引用块高度估算
            const quoteFontSize = getFontSize(element) || 12;
            const quoteLineHeight = getLineHeight(element) || 1.5;
            const quoteCharsPerLine = Math.floor(150 / (quoteFontSize / 16 * 1.2)); // 引用块通常有缩进
            const quoteLines = Math.ceil(element.textContent.length / quoteCharsPerLine);
            return (quoteFontSize * quoteLineHeight * quoteLines) / PX_TO_MM_RATIO + 8; // 添加8mm的间距
        case 'PRE':
            // 代码块高度估算
            const codeFontSize = getFontSize(element) || 12;
            const codeLineHeight = getLineHeight(element) || 1.4;
            const codeLines = (element.textContent.match(/\n/g) || []).length + 1;
            return (codeFontSize * codeLineHeight * codeLines) / PX_TO_MM_RATIO + 10; // 添加10mm的间距
        case 'DIV':
            // 特殊处理数学公式
            if (element.classList.contains('math-formula')) {
                return 20; // 数学公式默认高度
            }
            // 普通div，根据内容估算
            const divFontSize = getFontSize(element) || 12;
            const divLineHeight = getLineHeight(element) || 1.5;
            const divCharsPerLine = Math.floor(170 / (divFontSize / 16 * 1.2));
            const divLines = Math.ceil(element.textContent.length / divCharsPerLine);
            return (divFontSize * divLineHeight * divLines) / PX_TO_MM_RATIO + 6;
        default:
            // 其他元素默认高度
            const defaultFontSize = getFontSize(element) || 12;
            const defaultLineHeight = getLineHeight(element) || 1.5;
            const defaultCharsPerLine = Math.floor(170 / (defaultFontSize / 16 * 1.2));
            const defaultLines = Math.max(1, Math.ceil(element.textContent.length / defaultCharsPerLine));
            return (defaultFontSize * defaultLineHeight * defaultLines) / PX_TO_MM_RATIO + 4;
    }
}

/**
 * 获取元素的实际测量高度
 * @param {HTMLElement} element - 要测量的元素
 * @returns {number} - 测量的高度（毫米），如果无法测量则返回0
 */
function getMeasuredHeight(element) {
    try {
        // 创建一个临时容器来测量元素
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '210mm'; // A4纸宽度
        document.body.appendChild(tempContainer);
        
        // 克隆元素并添加到临时容器
        const clone = element.cloneNode(true);
        tempContainer.appendChild(clone);
        
        // 测量高度
        const height = clone.offsetHeight / PX_TO_MM_RATIO;
        
        // 清理
        document.body.removeChild(tempContainer);
        
        return height;
    } catch (e) {
        console.error('测量元素高度时出错:', e);
        return 0;
    }
}

/**
 * 获取元素的字体大小（像素）
 * @param {HTMLElement} element - 要获取字体大小的元素
 * @returns {number} - 字体大小（像素）
 */
function getFontSize(element) {
    if (!element) return null;
    
    const style = window.getComputedStyle(element);
    const fontSize = style.fontSize;
    
    if (fontSize) {
        // 将字体大小转换为像素数值
        return parseFloat(fontSize);
    }
    
    return null;
}

/**
 * 获取元素的行高倍数
 * @param {HTMLElement} element - 要获取行高的元素
 * @returns {number} - 行高倍数
 */
function getLineHeight(element) {
    if (!element) return null;
    
    const style = window.getComputedStyle(element);
    const lineHeight = style.lineHeight;
    const fontSize = parseFloat(style.fontSize);
    
    if (lineHeight === 'normal') {
        // 浏览器默认的normal行高通常在1.0-1.2之间
        return 1.2;
    }
    
    if (lineHeight && fontSize) {
        // 如果行高是像素值，则转换为相对于字体大小的倍数
        if (lineHeight.includes('px')) {
            return parseFloat(lineHeight) / fontSize;
        }
        // 如果行高已经是数字或百分比
        return parseFloat(lineHeight);
    }
    
    return null;
}

/**
 * 判断是否应该开始新页面
 * @param {string} tagName - 元素标签名
 * @param {number} usedHeight - 当前页面已使用高度
 * @param {number} elementHeight - 元素高度
 * @param {number} maxPageHeight - 页面最大高度
 * @returns {boolean} - 是否应该开始新页面
 */
function shouldStartNewPage(tagName, usedHeight, elementHeight, maxPageHeight) {
    // 如果当前页面已经没有足够空间，创建新页面
    if (usedHeight + elementHeight > maxPageHeight) {
        return true;
    }
    
    // 章节标题（H1）总是新页开始
    if (tagName === 'H1' && usedHeight > 0) {
        return true;
    }
    
    // 二级标题（H2）处理：
    // 1. 如果当前页面剩余空间不足20%，新页开始，避免标题下内容过少
    if (tagName === 'H2') {
        if ((maxPageHeight - usedHeight) < maxPageHeight * 0.2) {
            return true;
        }
    }
    
    // 三级标题（H3）处理：
    // 如果当前页面剩余空间不足20%，新页开始，避免标题下内容过少
    if (tagName === 'H3' && (maxPageHeight - usedHeight) < maxPageHeight * 0.2) {
        return true;
    }
    
    // 图片和表格处理：
    // 1. 如果是大型图表（预估高度超过页面30%），且当前页已用超过30%，则新页开始
    // 2. 如果当前页剩余空间不足以容纳图表加上至少20%的额外内容，也新页开始
    if (tagName === 'FIGURE' || tagName === 'TABLE') {
        const isLargeElement = elementHeight > maxPageHeight * 0.3;
        const notEnoughSpaceForMore = (maxPageHeight - usedHeight - elementHeight) < maxPageHeight * 0.2;
        
        if ((isLargeElement && usedHeight > maxPageHeight * 0.3) || notEnoughSpaceForMore) {
            return true;
        }
    }
    
    // 避免页面末尾只有少量内容：
    // 如果当前页面已使用超过85%，且即将添加的元素很小（小于页面高度的10%），
    // 并且不是段落结尾，则考虑新页开始
    if (usedHeight > maxPageHeight * 0.85 && 
        elementHeight < maxPageHeight * 0.1 && 
        !['P', 'LI', 'DIV'].includes(tagName)) {
        return true;
    }
    
    return false;
}

/**
 * 创建页面元素
 * @param {number} pageNumber - 页码
 * @returns {HTMLElement} - 页面元素
 */
function createPageElement(pageNumber) {
    const page = document.createElement('div');
    page.className = 'content-page';
    page.dataset.pageNumber = pageNumber;
    
    return page;
}

/**
 * 添加页码到每个页面
 * @param {HTMLElement} container - 页面容器
 */
function addPageNumbers(container) {
    const pages = container.querySelectorAll('.content-page');
    pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        footer.innerHTML = `<span class="page-number">${pageNumber}</span>`;
        page.appendChild(footer);
    });
}

/**
 * 添加页眉到非封面页
 * @param {HTMLElement} container - 页面容器
 */
function addHeaders(container) {
    const pages = container.querySelectorAll('.content-page');
    pages.forEach(page => {
        // 检查页面是否包含封面页元素
        const hasCoverPageElement = page.querySelector('.cover-page, .thesis-main-title, .thesis-title, .university-logo, .student-info, .thesis-date');
        
        // 如果不是封面页，添加页眉
        if (!hasCoverPageElement) {
            const header = document.createElement('div');
            header.className = 'page-header';
            // 将页眉插入到页面的最前面
            if (page.firstChild) {
                page.insertBefore(header, page.firstChild);
            } else {
                page.appendChild(header);
            }
        }
    });
}

/**
 * 判断元素是否应该在新页面开始
 * @param {string} tagName - 元素标签名
 * @param {string} className - 元素类名
 * @param {number} pageFullnessRatio - 当前页面已用空间比例
 * @param {number} elementHeight - 元素高度
 * @returns {boolean} - 是否应该在新页面开始
 */
function shouldElementStartNewPage(tagName, className, pageFullnessRatio, elementHeight) {
    // 一级标题总是新页开始
    if (tagName === 'H1') return true;
    
    // 二级标题，如果当前页已经使用了超过30%的空间，则新页开始
    if (tagName === 'H2' && pageFullnessRatio > 0.3) return true;
    
    // 三级标题，如果当前页已经使用了超过60%的空间，则新页开始
    if (tagName === 'H3' && pageFullnessRatio > 0.6) return true;
    
    // 图片和表格，如果当前页已经使用了超过40%的空间，则新页开始
    if ((tagName === 'FIGURE' || tagName === 'TABLE') && pageFullnessRatio > 0.4) return true;
    
    // 数学公式，如果是大型公式且当前页已经使用了超过50%的空间，则新页开始
    if (tagName === 'DIV' && className.includes('math-formula') && elementHeight > 30 && pageFullnessRatio > 0.5) return true;
    
    return false;
}

/**
 * 添加页面导航事件监听
 */
function addPageNavigationListeners() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const currentPageIndicator = document.getElementById('current-page');
    const totalPages = parseInt(document.getElementById('total-pages').textContent, 10);
    
    let currentPageIndex = 1;
    updatePageView();
    
    prevButton.addEventListener('click', () => {
        if (currentPageIndex > 1) {
            currentPageIndex--;
            updatePageView();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPageIndex < totalPages) {
            currentPageIndex++;
            updatePageView();
        }
    });
    
    function updatePageView() {
        // 更新页码显示
        currentPageIndicator.textContent = currentPageIndex;
        
        // 更新页面可见性
        const pages = document.querySelectorAll('.page');
        pages.forEach((page, index) => {
            if (index + 1 === currentPageIndex) {
                page.style.display = 'block';
                page.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                page.style.display = 'none';
            }
        });
        
        // 更新按钮状态
        prevButton.disabled = currentPageIndex === 1;
        nextButton.disabled = currentPageIndex === totalPages;
    }
}

/**
 * 递归处理节点
 * @param {Array} nodes - 要处理的节点数组
 * @param {HTMLElement} currentPageContent - 当前页面内容元素
 * @param {number} usedHeight - 当前页面已使用的高度
 * @param {number} pageCount - 当前页数
 * @returns {Object} - 包含当前页面内容、已使用高度和页数的对象
 */
function processNodes(nodes, currentPageContent, usedHeight, pageCount) {
    const pagesContainer = document.getElementById('pages-container');
    
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // 跳过空文本节点
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
            continue;
        }
        
        // 处理元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
            // 特殊处理标题元素
            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName)) {
                // 标题元素应该在新页开始或者当前页有足够空间
                const headingHeight = getElementHeightInMm(node);
                
                // 如果当前页面已经使用了一定高度且没有足够空间，创建新页面
                if (usedHeight > 0 && usedHeight + headingHeight > PAGE_CONTENT_HEIGHT) {
                    pageCount++;
                    const newPage = createNewPage(pageCount);
                    pagesContainer.appendChild(newPage);
                    currentPageContent = newPage.querySelector('.page-content');
                    usedHeight = 0;
                }
            }
            
            // 处理表格和图片等特殊元素
            if (['TABLE', 'FIGURE'].includes(node.tagName)) {
                const elementHeight = getElementHeightInMm(node);
                
                // 如果元素高度大于一页，则需要特殊处理
                if (elementHeight > PAGE_CONTENT_HEIGHT) {
                    // 如果当前页面已有内容，创建新页面
                    if (usedHeight > 0) {
                        pageCount++;
                        const newPage = createNewPage(pageCount);
                        pagesContainer.appendChild(newPage);
                        currentPageContent = newPage.querySelector('.page-content');
                        usedHeight = 0;
                    }
                    
                    // 添加元素到当前页面
                    const clonedNode = node.cloneNode(true);
                    currentPageContent.appendChild(clonedNode);
                    
                    // 创建新页面用于后续内容
                    pageCount++;
                    const newPage = createNewPage(pageCount);
                    pagesContainer.appendChild(newPage);
                    currentPageContent = newPage.querySelector('.page-content');
                    usedHeight = 0;
                    
                    continue;
                }
                
                // 如果元素高度小于一页但当前页面没有足够空间
                if (usedHeight + elementHeight > PAGE_CONTENT_HEIGHT) {
                    pageCount++;
                    const newPage = createNewPage(pageCount);
                    pagesContainer.appendChild(newPage);
                    currentPageContent = newPage.querySelector('.page-content');
                    usedHeight = 0;
                }
            }
            
            // 克隆并添加节点
            const clonedNode = node.cloneNode(true);
            currentPageContent.appendChild(clonedNode);
            
            // 计算元素高度
            const elementHeight = getElementHeightInMm(clonedNode);
            usedHeight += elementHeight;
            
            // 如果当前页面已满，创建新页面
            if (usedHeight >= PAGE_CONTENT_HEIGHT && i < nodes.length - 1) {
                pageCount++;
                const newPage = createNewPage(pageCount);
                pagesContainer.appendChild(newPage);
                currentPageContent = newPage.querySelector('.page-content');
                usedHeight = 0;
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            // 处理文本节点
            const textNode = document.createTextNode(node.textContent);
            currentPageContent.appendChild(textNode);
            
            // 文本节点高度计算相对复杂，这里使用近似值
            usedHeight += 1; // 假设文本节点高度为1mm
        }
    }
    
    return { currentPageContent, usedHeight, pageCount };
}

/**
 * 获取元素高度（毫米）
 * @param {HTMLElement} element - 要测量的元素
 * @returns {number} - 元素高度（毫米）
 */
function getElementHeightInMm(element) {
    // 获取元素的计算样式
    const style = window.getComputedStyle(element);
    
    // 考虑元素的margin
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    
    // 计算总高度（像素）
    const totalHeightPx = element.offsetHeight + marginTop + marginBottom;
    
    // 转换为毫米
    return totalHeightPx / PX_TO_MM_RATIO;
}

/**
 * 创建新页面
 * @param {number} pageNumber - 页码
 * @returns {HTMLElement} - 页面元素
 */
function createNewPage(pageNumber) {
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.pageNumber = pageNumber;
    
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';
    page.appendChild(pageContent);
    
    const pageNumberElement = document.createElement('div');
    pageNumberElement.className = 'page-number';
    pageNumberElement.textContent = pageNumber;
    page.appendChild(pageNumberElement);
    
    return page;
}

/**
 * 处理特殊元素的分页
 * @param {HTMLElement} element - 需要处理的元素
 * @param {number} availableHeight - 当前页面可用高度
 * @returns {Object} - 处理结果
 */
function handleSpecialElement(element, availableHeight) {
    // 处理表格
    if (element.tagName === 'TABLE') {
        // 如果表格太大，尝试在新页面开始
        const tableHeight = element.offsetHeight / 3.78; // 转换为mm
        if (tableHeight > availableHeight && tableHeight <= PAGE_CONTENT_HEIGHT) {
            return { needNewPage: true, element: element };
        }
    }
    
    // 处理图片
    if (element.tagName === 'FIGURE') {
        const figureHeight = element.offsetHeight / 3.78; // 转换为mm
        if (figureHeight > availableHeight && figureHeight <= PAGE_CONTENT_HEIGHT) {
            return { needNewPage: true, element: element };
        }
    }
    
    return { needNewPage: false, element: element };
}
