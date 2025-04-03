/**
 * 目录生成模块 - 负责生成和管理论文目录
 */

/**
 * 生成目录
 */
export function generateTOC() {
    const tocContent = document.getElementById('toc-content');
    const contentPage = document.querySelector('.content-page');
    
    // 清空目录内容
    tocContent.innerHTML = '';
    
    // 创建目录列表
    const tocList = document.createElement('ul');
    tocContent.appendChild(tocList);
    
    // 用于存储目录项的数组
    const tocItems = [];
    
    // 查找内容页中的所有标题元素
    if (contentPage) {
        const headings = contentPage.querySelectorAll('h2, h3, h4');
        
        headings.forEach(heading => {
            // 获取标题ID，如果没有则创建一个
            if (!heading.id) {
                heading.id = 'heading-' + Math.random().toString(36).substr(2, 9);
            }
            
            // 创建目录项
            const tocItem = {
                id: heading.id,
                text: heading.textContent,
                level: parseInt(heading.tagName.substring(1))
            };
            
            tocItems.push(tocItem);
        });
    }
    
    // 构建目录HTML
    buildTOCHTML(tocItems, tocList);
    
    // 添加目录项点击事件
    addTOCEventListeners();
}

/**
 * 构建目录HTML结构
 * @param {Array} items - 目录项数组
 * @param {HTMLElement} container - 目录容器
 */
function buildTOCHTML(items, container) {
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `toc-h${item.level}`;
        li.dataset.target = item.id;
        
        // 创建目录文本
        const text = document.createTextNode(item.text);
        li.appendChild(text);
        
        container.appendChild(li);
    });
}

/**
 * 为目录项添加点击事件
 */
function addTOCEventListeners() {
    const tocItems = document.querySelectorAll('#toc-content li');
    
    tocItems.forEach(item => {
        item.addEventListener('click', () => {
            // 获取目标元素ID
            const targetId = item.dataset.target;
            
            // 跳转到对应元素
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // 滚动到目标元素
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // 高亮目标元素
                highlightElement(targetId);
            }
        });
    });
}

// 跳转到指定元素的功能已集成到addTOCEventListeners中

/**
 * 高亮显示目标元素
 * @param {string} elementId - 元素ID
 */
function highlightElement(elementId) {
    // 移除之前的高亮
    const previousHighlight = document.querySelector('.highlight-element');
    if (previousHighlight) {
        previousHighlight.classList.remove('highlight-element');
    }
    
    // 添加新的高亮
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        targetElement.classList.add('highlight-element');
        
        // 3秒后移除高亮
        setTimeout(() => {
            targetElement.classList.remove('highlight-element');
        }, 3000);
    }
}
