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
    'H1': 100,  // 一级标题总是新页开始
    'H2': 90,   // 二级标题尽量新页开始
    'H3': 70,   // 三级标题如果当前页已经过半则新页开始
    'H4': 40,   // 四级标题不强制新页，但有一定权重
    'FIGURE': 85, // 图片尽量新页开始
    'TABLE': 85,  // 表格尽量新页开始
    'DIV.math-formula': 60 // 数学公式如果较大则考虑新页
};

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
    
    // 克隆内容以便操作
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
    title.style.marginBottom = '25px';
    currentPageContent.appendChild(title);
    
    // 添加作者信息
    const authorInfo = document.createElement('div');
    authorInfo.innerHTML = `
        <div class="author" style="text-align: center; margin-bottom: 8px;">张三</div>
        <div class="affiliation" style="text-align: center; margin-bottom: 8px;">某某大学水利与环境工程学院</div>
        <div class="date" style="text-align: center; margin-bottom: 30px;">2025年4月</div>
    `;
    currentPageContent.appendChild(authorInfo);
    
    // 创建一个临时容器来测量内容高度
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.width = `calc(var(--page-width) - var(--margin-left) - var(--margin-right))`;
    document.body.appendChild(tempContainer);
    
    // 将内容节点附加到页面
    const children = Array.from(content.childNodes);
    let currentPageHeight = estimateContentHeight(currentPageContent);
    
    // 处理每个子节点
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        
        // 跳过空文本节点
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '') {
            continue;
        }
        
        // 克隆节点以便测量
        const clonedNode = child.cloneNode(true);
        
        // 测量节点高度
        tempContainer.innerHTML = '';
        tempContainer.appendChild(clonedNode);
        const elementHeight = tempContainer.offsetHeight / PX_TO_MM_RATIO;
        
        // 判断是否需要新建页面
        if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.tagName;
            const elementClass = child.className || '';
            const elementId = `${tagName}${elementClass ? '.' + elementClass : ''}`;
            const elementWeight = ELEMENT_WEIGHTS[tagName] || ELEMENT_WEIGHTS[elementId] || 0;
            
            // 根据元素类型和当前页面已用空间决定是否需要新页面
            const pageFullnessRatio = currentPageHeight / PAGE_CONTENT_HEIGHT;
            const shouldStartNewPage = shouldElementStartNewPage(tagName, elementClass, pageFullnessRatio, elementHeight);
            
            if (shouldStartNewPage && currentPageContent.childNodes.length > 2) {
                pageCount++;
                currentPage = createNewPage(pageCount);
                container.appendChild(currentPage);
                currentPageContent = currentPage.querySelector('.page-content');
                currentPageHeight = 0;
            }
        }
        
        // 检查元素是否会导致页面溢出
        if (currentPageHeight + elementHeight > PAGE_CONTENT_HEIGHT) {
            // 创建新页面
            pageCount++;
            currentPage = createNewPage(pageCount);
            container.appendChild(currentPage);
            currentPageContent = currentPage.querySelector('.page-content');
            currentPageHeight = 0;
        }
        
        // 添加元素到当前页面
        currentPageContent.appendChild(child.cloneNode(true));
        currentPageHeight += elementHeight;
    }
    
    // 移除临时容器
    document.body.removeChild(tempContainer);
    
    // 更新总页数显示
    document.getElementById('total-pages').textContent = pageCount;
    console.log(`生成了 ${pageCount} 页内容`);
    
    // 添加页面跳转事件监听
    addPageNavigationListeners();
    
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
