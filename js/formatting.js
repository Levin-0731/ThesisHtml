/**
 * 格式化模块 - 处理缩进、自动编号和数学公式
 */

/**
 * 初始化格式化功能
 */
export function initializeFormatting() {
    // 为论文内容添加自动编号类
    const paperContent = document.querySelector('.paper-content');
    if (paperContent) {
        paperContent.classList.add('auto-number');
    }
    
    // 处理数学公式
    processMathFormulas();
    
    // 处理缩进
    processIndentation();
    
    // 处理自动编号列表
    processAutoNumberLists();
}

/**
 * 处理数学公式
 */
function processMathFormulas() {
    // 查找所有数学公式容器
    const mathContainers = document.querySelectorAll('.math-formula');
    
    // 为每个公式添加编号并确保正确的格式
    mathContainers.forEach((container, index) => {
        // 确保公式内容被正确包裹
        let formula = container.innerHTML.trim();
        
        // 如果公式没有被$$包裹，添加它们
        if (!formula.startsWith('$$') && !formula.endsWith('$$')) {
            container.innerHTML = '$$' + formula + '$$';
        }
        
        // 如果容器没有编号，添加一个
        if (!container.querySelector('.math-formula-number')) {
            const number = document.createElement('span');
            number.className = 'math-formula-number';
            number.textContent = `(${index + 1})`;
            container.appendChild(number);
        }
    });
    
    // 延迟渲染以确保所有公式已加载
    setTimeout(() => {
        if (window.MathJax && window.MathJax.typeset) {
            try {
                console.log('正在渲染数学公式...');
                window.MathJax.typeset();
            } catch (error) {
                console.error('渲染数学公式时出错:', error);
            }
        } else {
            console.warn('MathJax未加载或不可用');
        }
    }, 500);
}

/**
 * 处理缩进
 */
function processIndentation() {
    // 查找所有带有缩进类的元素
    const indentElements = document.querySelectorAll('.indent-1, .indent-2, .indent-3');
    
    // 确保缩进样式正确应用
    indentElements.forEach(element => {
        // 这里可以添加额外的处理逻辑，如果需要的话
        console.log('应用缩进样式到元素:', element);
    });
}

/**
 * 处理自动编号列表
 */
function processAutoNumberLists() {
    // 查找所有需要自动编号的列表
    const autoNumberLists = document.querySelectorAll('ol.auto-number-list');
    
    // 确保自动编号样式正确应用
    autoNumberLists.forEach(list => {
        // 这里可以添加额外的处理逻辑，如果需要的话
        console.log('应用自动编号样式到列表:', list);
    });
}

/**
 * 创建数学公式元素
 * @param {string} formula - LaTeX格式的公式
 * @param {boolean} isInline - 是否为行内公式
 * @returns {HTMLElement} - 公式元素
 */
export function createMathFormula(formula, isInline = false) {
    const container = document.createElement('div');
    
    if (isInline) {
        container.innerHTML = `$${formula}$`;
    } else {
        container.className = 'math-formula';
        container.innerHTML = `$$${formula}$$`;
    }
    
    return container;
}

/**
 * 创建带缩进的段落
 * @param {string} text - 段落文本
 * @param {number} level - 缩进级别（1-3）
 * @returns {HTMLElement} - 段落元素
 */
export function createIndentedParagraph(text, level = 1) {
    const p = document.createElement('p');
    p.className = `indent-${Math.min(Math.max(level, 1), 3)}`;
    p.textContent = text;
    return p;
}

/**
 * 创建自动编号列表
 * @param {Array} items - 列表项数组
 * @returns {HTMLElement} - 列表元素
 */
export function createAutoNumberList(items) {
    const ol = document.createElement('ol');
    ol.className = 'auto-number-list';
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ol.appendChild(li);
    });
    
    return ol;
}
