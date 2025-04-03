/**
 * 分页模块 - 负责将论文内容分割成A4页面
 */

// A4页面内容区域高度（减去页边距）
const PAGE_CONTENT_HEIGHT = 247; // 单位: mm，297mm - 25mm*2

// 像素到毫米的转换比例（取决于浏览器的DPI设置）
const PX_TO_MM_RATIO = 3.78; // 恢复原始比例，配合CSS中的aspect-ratio属性使用

/**
 * 生成页面
 * @param {Node} contentNode - 论文内容节点
 * @param {HTMLElement} container - 页面容器
 * @returns {number} - 生成的页面数量
 */
export function generatePages(contentNode, container) {
    console.log('开始生成页面', contentNode);
    
    // 清空容器
    container.innerHTML = '';
    
    // 简化版分页算法 - 每页固定字符数
    const content = contentNode.cloneNode(true);
    
    // 创建第一页
    let pageCount = 1;
    let currentPage = createNewPage(pageCount);
    container.appendChild(currentPage);
    let currentPageContent = currentPage.querySelector('.page-content');
    
    // 将标题添加到第一页
    const title = document.createElement('h1');
    title.textContent = '基于改进遗传算法的土石方调运优化研究';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    currentPageContent.appendChild(title);
    
    // 添加作者信息
    const authorInfo = document.createElement('div');
    authorInfo.innerHTML = `
        <div class="author" style="text-align: center; margin-bottom: 5px;">张三</div>
        <div class="affiliation" style="text-align: center; margin-bottom: 5px;">某某大学水利与环境工程学院</div>
        <div class="date" style="text-align: center; margin-bottom: 20px;">2025年4月</div>
    `;
    currentPageContent.appendChild(authorInfo);
    
    // 将内容节点附加到页面
    const children = Array.from(content.childNodes);
    
    // 处理每个子节点
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        
        // 跳过空文本节点
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '') {
            continue;
        }
        
        // 判断是否需要新建页面
        if (child.nodeType === Node.ELEMENT_NODE) {
            // 如果是标题元素且当前页面已有内容，创建新页面
            if (['H1', 'H2', 'H3'].includes(child.tagName) && currentPageContent.childNodes.length > 0) {
                // 检查当前页面内容数量
                if (currentPageContent.childNodes.length >= 10) {
                    pageCount++;
                    currentPage = createNewPage(pageCount);
                    container.appendChild(currentPage);
                    currentPageContent = currentPage.querySelector('.page-content');
                }
            }
            
            // 如果是表格或图片，单独占一页
            if (['TABLE', 'FIGURE'].includes(child.tagName) && currentPageContent.childNodes.length > 0) {
                pageCount++;
                currentPage = createNewPage(pageCount);
                container.appendChild(currentPage);
                currentPageContent = currentPage.querySelector('.page-content');
            }
        }
        
        // 添加元素到当前页面
        currentPageContent.appendChild(child.cloneNode(true));
        
        // 每添加几个元素后检查是否需要新页面
        if (i % 5 === 0 && i > 0) {
            // 检查当前页面内容数量
            if (currentPageContent.childNodes.length >= 15) {
                pageCount++;
                currentPage = createNewPage(pageCount);
                container.appendChild(currentPage);
                currentPageContent = currentPage.querySelector('.page-content');
            }
        }
    }
    
    // 更新总页数显示
    document.getElementById('total-pages').textContent = pageCount;
    console.log(`生成了 ${pageCount} 页内容`);
    
    return pageCount;
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
