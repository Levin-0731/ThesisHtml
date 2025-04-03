/**
 * 格式化模块 - 处理缩进、自动编号和数学公式
 * 优化版本：改进数学公式渲染和整体排版效果
 */

// 格式化配置
 const FORMAT_CONFIG = {
    headingSpacing: {
        h1: '1.8em',
        h2: '1.5em',
        h3: '1.2em',
        h4: '1em'
    },
    paragraphIndent: '2em',
    mathFormulaSpacing: '1.5em',
    tableSpacing: '1.2em',
    figureSpacing: '1.5em',
    listSpacing: '0.8em'
};

/**
 * 初始化格式化功能
 */
export function initializeFormatting() {
    console.log('初始化格式化功能...');
    
    // 为论文内容添加自动编号类
    const paperContent = document.querySelector('.paper-content');
    if (paperContent) {
        paperContent.classList.add('auto-number');
    }
    
    // 处理标题格式
    processHeadings();
    
    // 处理数学公式
    processMathFormulas();
    
    // 处理缩进
    processIndentation();
    
    // 处理自动编号列表
    processAutoNumberLists();
    
    // 处理图表
    processFiguresAndTables();
}

/**
 * 处理标题格式
 */
function processHeadings() {
    // 查找所有标题元素
    const headings = document.querySelectorAll('.paper-content h1, .paper-content h2, .paper-content h3, .paper-content h4');
    
    headings.forEach(heading => {
        const tagName = heading.tagName.toLowerCase();
        
        // 设置标题间距
        if (FORMAT_CONFIG.headingSpacing[tagName]) {
            heading.style.marginBottom = FORMAT_CONFIG.headingSpacing[tagName];
        }
        
        // 为二级标题添加下划线效果
        if (tagName === 'h2') {
            heading.style.paddingBottom = '0.3em';
            heading.style.borderBottom = '1px solid var(--border-color)';
        }
    });
}

/**
 * 处理数学公式
 */
function processMathFormulas() {
    // 查找所有数学公式容器
    const mathContainers = document.querySelectorAll('.math-formula');
    
    // 为每个公式添加编号并确保正确的格式
    mathContainers.forEach((container, index) => {
        // 设置公式容器的间距
        container.style.margin = `${FORMAT_CONFIG.mathFormulaSpacing} 0`;
        container.style.position = 'relative';
        container.style.padding = '0.5em 0';
        
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
            number.style.position = 'absolute';
            number.style.right = '0';
            number.style.top = '50%';
            number.style.transform = 'translateY(-50%)';
            number.style.color = 'var(--secondary-color)';
            container.appendChild(number);
        }
    });
    
    // 延迟渲染以确保所有公式已加载
    setTimeout(() => {
        if (window.MathJax && window.MathJax.typeset) {
            try {
                console.log('正在渲染数学公式...');
                window.MathJax.typeset();
                
                // 添加二次渲染以确保公式正确显示
                setTimeout(() => {
                    window.MathJax.typeset();
                }, 1000);
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
    // 查找所有段落元素
    const paragraphs = document.querySelectorAll('.paper-content p');
    
    // 为段落设置默认缩进（除非有特殊类指定不缩进）
    paragraphs.forEach(paragraph => {
        // 如果不是特殊类型的段落（如关键词、摘要等）
        if (!paragraph.classList.contains('keywords') && 
            !paragraph.classList.contains('abstract') &&
            !paragraph.classList.contains('no-indent')) {
            paragraph.style.textIndent = FORMAT_CONFIG.paragraphIndent;
            paragraph.style.textAlign = 'justify';
            paragraph.style.lineHeight = '1.7';
        }
    });
    
    // 处理特定的缩进类
    const indentElements = document.querySelectorAll('.indent-1, .indent-2, .indent-3');
    
    // 确保缩进样式正确应用
    indentElements.forEach(element => {
        if (element.classList.contains('indent-1')) {
            element.style.paddingLeft = '2em';
        } else if (element.classList.contains('indent-2')) {
            element.style.paddingLeft = '4em';
        } else if (element.classList.contains('indent-3')) {
            element.style.paddingLeft = '6em';
        }
        
        // 确保段落内文本对齐
        element.style.textAlign = 'justify';
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
        // 设置列表间距
        list.style.margin = `${FORMAT_CONFIG.listSpacing} 0`;
        list.style.paddingLeft = '2em';
        
        // 处理列表项
        const listItems = list.querySelectorAll('li');
        listItems.forEach((item, index) => {
            item.style.marginBottom = '0.5em';
            item.style.position = 'relative';
            
            // 添加自定义编号
            if (!item.getAttribute('data-numbered')) {
                item.setAttribute('data-numbered', 'true');
                item.style.counterIncrement = 'item';
                item.style.position = 'relative';
                
                // 添加编号内容
                const number = document.createElement('span');
                number.className = 'list-number';
                number.textContent = `${index + 1}. `;
                number.style.position = 'absolute';
                number.style.left = '-2em';
                number.style.fontWeight = 'normal';
                item.insertBefore(number, item.firstChild);
            }
        });
    });
}

/**
 * 处理图表
 */
function processFiguresAndTables() {
    // 处理图片
    const figures = document.querySelectorAll('.paper-content figure');
    figures.forEach((figure, index) => {
        // 设置图片容器样式
        figure.style.margin = `${FORMAT_CONFIG.figureSpacing} 0`;
        figure.style.padding = '10px';
        figure.style.backgroundColor = '#fafafa';
        figure.style.borderRadius = '4px';
        figure.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        
        // 处理图片标题
        const caption = figure.querySelector('figcaption');
        if (caption) {
            if (!caption.textContent.startsWith('图')) {
                caption.textContent = `图 ${index + 1} ${caption.textContent}`;
            }
            caption.style.marginTop = '10px';
            caption.style.fontSize = '10pt';
            caption.style.color = 'var(--caption-color)';
            caption.style.fontStyle = 'italic';
            caption.style.textAlign = 'center';
        }
    });
    
    // 处理表格
    const tables = document.querySelectorAll('.paper-content table');
    tables.forEach((table, index) => {
        // 设置表格样式
        table.style.margin = `${FORMAT_CONFIG.tableSpacing} 0`;
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // 处理表格标题
        const caption = table.querySelector('caption');
        if (caption) {
            if (!caption.textContent.startsWith('表')) {
                caption.textContent = `表 ${index + 1} ${caption.textContent}`;
            }
            caption.style.marginBottom = '10px';
            caption.style.fontSize = '10pt';
            caption.style.color = 'var(--caption-color)';
            caption.style.fontWeight = 'bold';
            caption.style.textAlign = 'center';
        }
        
        // 处理表格单元格
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.border = '1px solid var(--border-color)';
            cell.style.padding = '8px';
            cell.style.textAlign = 'center';
        });
        
        // 处理表头
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
            header.style.backgroundColor = '#f2f2f2';
            header.style.fontWeight = 'bold';
        });
    });
}

/**
 * 创建数学公式元素
 * @param {string} formula - LaTeX格式的公式
 * @param {boolean} isInline - 是否为行内公式
 * @param {number} formulaNumber - 公式编号（可选）
 * @returns {HTMLElement} - 公式元素
 */
export function createMathFormula(formula, isInline = false, formulaNumber = null) {
    const container = document.createElement('div');
    
    if (isInline) {
        container.innerHTML = `$${formula}$`;
    } else {
        container.className = 'math-formula';
        container.style.margin = `${FORMAT_CONFIG.mathFormulaSpacing} 0`;
        container.style.position = 'relative';
        container.style.padding = '0.5em 0';
        container.style.textAlign = 'center';
        container.innerHTML = `$$${formula}$$`;
        
        // 添加公式编号（如果提供）
        if (formulaNumber !== null) {
            const number = document.createElement('span');
            number.className = 'math-formula-number';
            number.textContent = `(${formulaNumber})`;
            number.style.position = 'absolute';
            number.style.right = '0';
            number.style.top = '50%';
            number.style.transform = 'translateY(-50%)';
            number.style.color = 'var(--secondary-color)';
            container.appendChild(number);
        }
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
    
    // 应用格式化样式
    p.style.textAlign = 'justify';
    p.style.lineHeight = '1.7';
    
    // 根据缩进级别设置缩进量
    const indentLevel = Math.min(Math.max(level, 1), 3);
    p.style.paddingLeft = `${indentLevel * 2}em`;
    
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
    ol.style.counterReset = 'item';
    ol.style.paddingLeft = '2em';
    ol.style.margin = `${FORMAT_CONFIG.listSpacing} 0`;
    
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.style.marginBottom = '0.5em';
        li.style.position = 'relative';
        
        // 添加自定义编号
        const number = document.createElement('span');
        number.className = 'list-number';
        number.textContent = `${index + 1}. `;
        number.style.position = 'absolute';
        number.style.left = '-2em';
        number.style.fontWeight = 'normal';
        li.insertBefore(number, li.firstChild);
        
        ol.appendChild(li);
    });
    
    return ol;
}

/**
 * 创建图片元素
 * @param {string} src - 图片路径
 * @param {string} caption - 图片标题
 * @param {number} figureNumber - 图片编号（可选）
 * @returns {HTMLElement} - 图片元素
 */
export function createFigure(src, caption, figureNumber = null) {
    const figure = document.createElement('figure');
    figure.style.margin = `${FORMAT_CONFIG.figureSpacing} 0`;
    figure.style.padding = '10px';
    figure.style.backgroundColor = '#fafafa';
    figure.style.borderRadius = '4px';
    figure.style.textAlign = 'center';
    figure.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '150mm';
    img.style.objectFit = 'contain';
    figure.appendChild(img);
    
    if (caption) {
        const figCaption = document.createElement('figcaption');
        figCaption.textContent = figureNumber !== null ? `图 ${figureNumber} ${caption}` : caption;
        figCaption.style.marginTop = '10px';
        figCaption.style.fontSize = '10pt';
        figCaption.style.color = 'var(--caption-color)';
        figCaption.style.fontStyle = 'italic';
        figure.appendChild(figCaption);
    }
    
    return figure;
}

/**
 * 创建表格元素
 * @param {Array} headers - 表头数组
 * @param {Array} rows - 行数据数组的数组
 * @param {string} caption - 表格标题
 * @param {number} tableNumber - 表格编号（可选）
 * @returns {HTMLElement} - 表格元素
 */
export function createTable(headers, rows, caption, tableNumber = null) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = `${FORMAT_CONFIG.tableSpacing} 0`;
    
    if (caption) {
        const captionElement = document.createElement('caption');
        captionElement.textContent = tableNumber !== null ? `表 ${tableNumber} ${caption}` : caption;
        captionElement.style.marginBottom = '10px';
        captionElement.style.fontSize = '10pt';
        captionElement.style.color = 'var(--caption-color)';
        captionElement.style.fontWeight = 'bold';
        table.appendChild(captionElement);
    }
    
    // 创建表头
    if (headers && headers.length > 0) {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.border = '1px solid var(--border-color)';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            th.style.fontWeight = 'bold';
            th.style.textAlign = 'center';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
    }
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.style.border = '1px solid var(--border-color)';
            td.style.padding = '8px';
            td.style.textAlign = 'center';
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    return table;
}
