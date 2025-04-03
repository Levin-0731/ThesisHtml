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
    
    // 创建第一页（封面）
    let pageCount = 1;
    let currentPage = createPageElement(pageCount);
    scrollableContainer.appendChild(currentPage);
    
    // 创建封面内容容器
    const coverPage = document.createElement('div');
    coverPage.className = 'cover-page';
    currentPage.appendChild(coverPage);
    
    // 添加校徽
    const logo = document.createElement('img');
    logo.src = 'images/校徽.png';
    logo.alt = '太原理工大学校徽';
    logo.className = 'university-logo';
    coverPage.appendChild(logo);
    
    // 添加论文大标题
    const mainTitle = document.createElement('h1');
    mainTitle.textContent = '2025届毕业论文-开题报告';
    mainTitle.className = 'thesis-main-title';
    coverPage.appendChild(mainTitle);
    
    // 添加论文标题
    const title = document.createElement('h1');
    title.textContent = '毕业实习报告';
    title.className = 'thesis-title';
    title.id = 'main-title';
    coverPage.appendChild(title);
    
    // 添加学生信息
    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-info';
    studentInfo.innerHTML = `
        <div class="label">姓　　名：</div>
        <div class="value">梁海毅</div>
        <div class="label">学　　号：</div>
        <div class="value">2021002640</div>
        <div class="label">专业班级：</div>
        <div class="value">工程管理 2103 班</div>
        <div class="label">指导教师：</div>
        <div class="value">王天日</div>
    `;
    coverPage.appendChild(studentInfo);
    
    // 添加日期
    const dateInfo = document.createElement('div');
    dateInfo.className = 'thesis-date';
    dateInfo.textContent = '2025 年 3 月 9 日';
    coverPage.appendChild(dateInfo);
    
    // 封面页不需要计算高度，直接创建第二页
    pageCount++;
    currentPage = createPageElement(pageCount);
    scrollableContainer.appendChild(currentPage);
    let usedHeight = 0;
    const maxPageHeight = PAGE_CONTENT_HEIGHT; // 页面最大高度（毫米）
    
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
    // 根据元素类型返回预估高度
    switch (element.tagName) {
        case 'H1':
            return 15; // 一级标题高度约为15mm
        case 'H2':
            return 12; // 二级标题高度约为12mm
        case 'H3':
            return 10; // 三级标题高度约为10mm
        case 'H4':
        case 'H5':
        case 'H6':
            return 8;  // 其他标题高度约为8mm
        case 'P':
            return 8 * Math.ceil(element.textContent.length / 80); // 段落高度估算
        case 'UL':
        case 'OL':
            return 8 * element.querySelectorAll('li').length; // 列表高度估算
        case 'TABLE':
            return 20 + 8 * element.querySelectorAll('tr').length; // 表格高度估算
        case 'FIGURE':
            return 40; // 图片高度预估
        case 'PRE':
            return 15 + 5 * (element.textContent.match(/\n/g) || []).length; // 代码块高度估算
        default:
            return 10; // 其他元素默认高度
    }
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
    
    // 一级标题总是新页开始
    if (tagName === 'H1' && usedHeight > 0) {
        return true;
    }
    
    // 二级标题，如果当前页已经使用了超过30%的空间，则新页开始
    if (tagName === 'H2' && usedHeight > maxPageHeight * 0.3) {
        return true;
    }
    
    // 三级标题，如果当前页已经使用了超过60%的空间，则新页开始
    if (tagName === 'H3' && usedHeight > maxPageHeight * 0.6) {
        return true;
    }
    
    // 图片和表格，如果当前页已经使用了超过40%的空间，则新页开始
    if ((tagName === 'FIGURE' || tagName === 'TABLE') && usedHeight > maxPageHeight * 0.4) {
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
        const pageFooter = document.createElement('div');
        pageFooter.className = 'page-footer';
        pageFooter.innerHTML = `<span class="page-number">${pageNumber}</span>`;
        page.appendChild(pageFooter);
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
