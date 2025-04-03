/**
 * 内容加载模块 - 负责从外部HTML文件加载章节内容
 */

/**
 * 加载章节内容
 * @param {Array} chapterFiles - 章节文件路径数组
 * @returns {Promise} - 加载完成的Promise
 */
export async function loadChapterContents(chapterFiles) {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'paper-content';
    
    // 添加论文头部信息
    const header = createPaperHeader();
    contentContainer.appendChild(header);
    
    // 加载每个章节内容
    for (const file of chapterFiles) {
        try {
            const chapterContent = await fetchChapterContent(file);
            // 创建一个临时容器来解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = chapterContent;
            
            // 将解析后的节点附加到内容容器
            while (tempDiv.firstChild) {
                contentContainer.appendChild(tempDiv.firstChild);
            }
            
            console.log(`成功加载章节: ${file}`);
        } catch (error) {
            console.error(`加载章节文件 ${file} 失败:`, error);
            const errorElement = document.createElement('p');
            errorElement.className = 'error';
            errorElement.textContent = `加载章节内容失败: ${file}`;
            contentContainer.appendChild(errorElement);
        }
    }
    
    return contentContainer;
}

/**
 * 获取章节内容
 * @param {string} filePath - 章节文件路径
 * @returns {Promise<string>} - 章节内容HTML字符串
 */
async function fetchChapterContent(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`获取章节内容失败: ${filePath}`, error);
        return `<p class="error">加载章节内容失败: ${filePath}</p>`;
    }
}

/**
 * 创建论文头部信息
 * @returns {HTMLElement} - 头部元素
 */
function createPaperHeader() {
    const header = document.createElement('header');
    
    const title = document.createElement('h1');
    title.textContent = '基于改进遗传算法的土石方调运优化研究';
    
    const author = document.createElement('div');
    author.className = 'author';
    author.textContent = '张三';
    
    const affiliation = document.createElement('div');
    affiliation.className = 'affiliation';
    affiliation.textContent = '某某大学水利与环境工程学院';
    
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = '2025年4月';
    
    header.appendChild(title);
    header.appendChild(author);
    header.appendChild(affiliation);
    header.appendChild(date);
    
    return header;
}
