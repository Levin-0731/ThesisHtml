/**
 * 目录生成模块 - 负责生成和管理论文目录
 */

/**
 * 生成目录
 */
export function generateTOC() {
    const tocContent = document.getElementById('toc-content');
    const contentPages = document.querySelectorAll('.content-page');
    
    // 清空目录内容
    tocContent.innerHTML = '';
    
    // 创建目录列表
    const tocList = document.createElement('ul');
    tocContent.appendChild(tocList);
    
    // 用于存储目录项的数组
    const tocItems = [];
    
    // 查找所有内容页中的标题元素
    if (contentPages && contentPages.length > 0) {
        // 遍历所有页面
        contentPages.forEach(contentPage => {
            // 跳过封面页
            if (contentPage.querySelector('.cover-page')) {
                return;
            }
            
            const headings = contentPage.querySelectorAll('h1, h2, h3, h4, h5');
            
            headings.forEach(heading => {
                // 跳过封面页的标题
                if (heading.classList.contains('thesis-main-title') || 
                    heading.classList.contains('thesis-title') || 
                    heading.id === 'main-title') {
                    return;
                }
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
    // 为标题添加编号
    const counters = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0 };
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `toc-h${item.level}`;
        li.dataset.target = item.id;
        
        // 根据标题级别生成编号
        let prefix = '';
        if (item.level === 1) {
            // 一级标题特殊处理
            counters.h1++;
            counters.h2 = 0;
            counters.h3 = 0;
            counters.h4 = 0;
            counters.h5 = 0;
            
            // 一级标题使用特殊样式
            li.style.fontWeight = 'bold';
            li.style.fontSize = '1.1em';
            li.style.marginTop = '0.8em';
            li.style.marginBottom = '0.4em';
            li.style.color = '#333';
            
            // 一级标题使用中文数字编号 - 与CSS保持一致
            const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
            if (counters.h1 <= 10) {
                prefix = chineseNumbers[counters.h1 - 1] + '、';
            } else if (counters.h1 <= 19) {
                prefix = '十' + (counters.h1 > 10 ? chineseNumbers[counters.h1 - 11] : '') + '、';
            } else {
                prefix = counters.h1 + '、';
            }
        } else if (item.level === 2) {
            counters.h2++;
            counters.h3 = 0; // 重置下级计数器
            counters.h4 = 0;
            counters.h5 = 0;
            // 二级标题使用中文数字编号 - 与CSS保持一致
            const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
            if (counters.h2 <= 20) {
                prefix = '（' + chineseNumbers[counters.h2 - 1] + '）';
            } else {
                prefix = '（' + counters.h2 + '）';
            }
        } else if (item.level === 3) {
            counters.h3++;
            counters.h4 = 0; // 重置下级计数器
            counters.h5 = 0;
            // 三级标题使用阿拉伯数字 - 与CSS保持一致
            prefix = counters.h3 + '. ';
        } else if (item.level === 4) {
            counters.h4++;
            counters.h5 = 0; // 重置下级计数器
            // 四级标题使用层级编号 - 与JavaScript中保持一致
            prefix = counters.h2 + '.' + counters.h3 + '.' + counters.h4 + ' ';
        } else if (item.level === 5) {
            counters.h5++;
            // 五级标题使用层级编号 - 与JavaScript中保持一致
            prefix = counters.h2 + '.' + counters.h3 + '.' + counters.h4 + '.' + counters.h5 + ' ';
        }
        
        // 创建目录文本（带编号）
        const text = document.createTextNode(prefix + item.text);
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
