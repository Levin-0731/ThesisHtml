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
    
    // 不再添加自动生成的论文头部信息
    
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
