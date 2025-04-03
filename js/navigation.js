/**
 * 导航模块 - 负责页面导航和交互
 */

/**
 * 设置页面导航功能
 */
export function setupNavigation() {
    console.log('设置导航功能');
    
    // 添加滚动事件以支持平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加页面导航控件
    addPageNavigationControls();
    
    // 监听滚动事件，更新当前页码
    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer) {
        pagesContainer.addEventListener('scroll', debounce(() => {
            updateCurrentPageIndicator();
        }, 100));
    }
}

/**
 * 添加页面导航控件
 */
function addPageNavigationControls() {
    // 获取控制区域
    const controlsArea = document.querySelector('.controls');
    if (!controlsArea) return;
    
    // 创建页面导航元素
    const pageNavigation = document.createElement('div');
    pageNavigation.className = 'page-navigation';
    pageNavigation.innerHTML = `
        <button id="prev-page" title="上一页">上一页</button>
        <span id="page-indicator">第 <span id="current-page">1</span> 页 / 共 <span id="total-pages">1</span> 页</span>
        <button id="next-page" title="下一页">下一页</button>
    `;
    
    // 在打印按钮前插入页面导航元素
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        controlsArea.insertBefore(pageNavigation, printBtn);
    } else {
        controlsArea.appendChild(pageNavigation);
    }
    
    // 添加导航按钮事件
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            navigateToPreviousPage();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            navigateToNextPage();
        });
    }
    
    // 初始化更新页面指示器
    updateCurrentPageIndicator();
}

/**
 * 更新当前页面指示器
 */
function updateCurrentPageIndicator() {
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    if (!currentPageElement || !totalPagesElement) return;
    
    // 获取所有页面
    const pages = document.querySelectorAll('.content-page');
    const totalPages = pages.length;
    totalPagesElement.textContent = totalPages;
    
    // 找到当前可见的页面
    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;
    
    const scrollPosition = pagesContainer.scrollTop + pagesContainer.clientHeight / 2;
    let currentPage = 1;
    
    // 找到当前可见的页面
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const rect = page.getBoundingClientRect();
        const containerRect = pagesContainer.getBoundingClientRect();
        const pageTop = rect.top - containerRect.top + pagesContainer.scrollTop;
        const pageBottom = pageTop + rect.height;
        
        if (scrollPosition >= pageTop && scrollPosition <= pageBottom) {
            currentPage = parseInt(page.dataset.pageNumber) || (i + 1);
            break;
        }
    }
    
    // 更新当前页码显示
    currentPageElement.textContent = currentPage;
    
    // 更新按钮状态
    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
    }
}

/**
 * 导航到上一页
 */
function navigateToPreviousPage() {
    const currentPageElement = document.getElementById('current-page');
    if (!currentPageElement) return;
    
    const currentPage = parseInt(currentPageElement.textContent);
    if (currentPage <= 1) return;
    
    navigateToPage(currentPage - 1);
}

/**
 * 导航到下一页
 */
function navigateToNextPage() {
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    if (!currentPageElement || !totalPagesElement) return;
    
    const currentPage = parseInt(currentPageElement.textContent);
    const totalPages = parseInt(totalPagesElement.textContent);
    
    if (currentPage >= totalPages) return;
    
    navigateToPage(currentPage + 1);
}

/**
 * 导航到指定页面
 * @param {number} pageNumber - 页码
 */
function navigateToPage(pageNumber) {
    // 获取目标页面
    const pages = document.querySelectorAll('.content-page');
    if (pageNumber < 1 || pageNumber > pages.length) return;
    
    const targetPage = pages[pageNumber - 1];
    if (!targetPage) return;
    
    // 滚动到目标页面
    targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // 更新页面指示器
    setTimeout(updateCurrentPageIndicator, 500);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖处理后的函数
 */
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
