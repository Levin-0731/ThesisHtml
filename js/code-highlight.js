/**
 * 代码高亮处理脚本
 * 使用Prism.js为代码块添加语言高亮
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化代码高亮
    initCodeHighlighting();
    
    // 监听内容加载事件，处理动态加载的内容
    document.addEventListener('contentLoaded', function() {
        initCodeHighlighting();
    });
});

/**
 * 初始化代码高亮
 */
function initCodeHighlighting() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('.code-block pre');
    
    codeBlocks.forEach(function(preElement) {
        const codeElement = preElement.querySelector('code');
        if (!codeElement) return;
        
        // 检查是否已经有data-language属性
        let language = preElement.getAttribute('data-language');
        
        if (!language) {
            // 如果没有data-language属性，尝试从代码内容检测
            const code = codeElement.textContent.trim();
            const firstLine = code.split('\n')[0].trim();
            language = detectLanguage(firstLine);
            
            if (language) {
                // 如果检测到语言，移除第一行的注释
                codeElement.textContent = code.substring(code.indexOf('\n')).trim();
            } else {
                // 默认使用python语言高亮
                language = 'python';
            }
            
            // 设置语言标识属性
            preElement.setAttribute('data-language', language);
        }
        
        // 确保语言类名正确设置
        if (!codeElement.className.includes(`language-${language}`)) {
            codeElement.className = codeElement.className ? 
                `${codeElement.className} language-${language}` : 
                `language-${language}`;
        }
        
        if (!preElement.className.includes(`language-${language}`)) {
            preElement.className = preElement.className ? 
                `${preElement.className} language-${language}` : 
                `language-${language}`;
        }
        
        // 应用Prism高亮
        try {
            Prism.highlightElement(codeElement);
        } catch (e) {
            console.error('Prism高亮错误:', e);
        }
    });
}

/**
 * 检测代码语言
 * @param {string} firstLine - 代码第一行
 * @returns {string|null} - 检测到的语言或null
 */
function detectLanguage(firstLine) {
    // 检查是否包含语言注释
    const languageCommentRegex = /^#\s*(python|py|javascript|js|java|c\+\+|cpp|c|bash|sh|matlab|r|ruby|go|php|csharp|cs|typescript|ts)$/i;
    const match = firstLine.match(languageCommentRegex);
    
    if (match) {
        const lang = match[1].toLowerCase();
        
        // 标准化语言名称
        const languageMap = {
            'py': 'python',
            'js': 'javascript',
            'cpp': 'cpp',
            'c++': 'cpp',
            'sh': 'bash',
            'cs': 'csharp',
            'ts': 'typescript'
        };
        
        return languageMap[lang] || lang;
    }
    
    return null;
}
