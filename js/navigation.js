/**
 * 导航模块 - 负责页面导航和交互
 */

/**
 * 设置页面导航功能
 */
export function setupNavigation() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    
    // 当前页码
    let currentPage = 1;
    
    // 获取总页数
    const totalPages = document.querySelectorAll('.page').length;
    totalPagesElement.textContent = totalPages;
    
    // 设置上一页按钮事件
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                navigateToPage(--currentPage);
            }
        });
    }
    
    // 设置下一页按钮事件
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                navigateToPage(++currentPage);
            }
        });
    }
    
    // 添加键盘导航
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            if (currentPage > 1) {
                navigateToPage(--currentPage);
            }
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            if (currentPage < totalPages) {
                navigateToPage(++currentPage);
            }
        }
    });
    
    /**
     * 导航到指定页面
     * @param {number} pageNumber - 页码
     */
    function navigateToPage(pageNumber) {
        // 更新当前页码显示
        currentPageElement.textContent = pageNumber;
        
        // 获取目标页面
        const targetPage = document.querySelector(`.page[data-page-number="${pageNumber}"]`);
        
        if (targetPage) {
            // 滚动到目标页面
            targetPage.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 更新按钮状态
        updateButtonStates();
    }
    
    /**
     * 更新按钮状态
     */
    function updateButtonStates() {
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        
        if (nextButton) {
            nextButton.disabled = currentPage >= totalPages;
        }
    }
    
    // 初始化按钮状态
    updateButtonStates();
    
    // 监听滚动事件，更新当前页码
    document.addEventListener('scroll', debounce(() => {
        const pages = document.querySelectorAll('.page');
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        // 找到当前可见的页面
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const rect = page.getBoundingClientRect();
            const pageTop = rect.top + window.scrollY;
            const pageBottom = pageTop + rect.height;
            
            if (scrollPosition >= pageTop && scrollPosition <= pageBottom) {
                const pageNumber = parseInt(page.dataset.pageNumber);
                
                // 更新当前页码
                if (pageNumber !== currentPage) {
                    currentPage = pageNumber;
                    currentPageElement.textContent = currentPage;
                    updateButtonStates();
                }
                
                break;
            }
        }
    }, 100));
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
