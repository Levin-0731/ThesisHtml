/**
 * Prism.js初始化脚本
 * 确保代码高亮正确应用
 */

// 在页面加载完成后初始化Prism
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行，确保所有内容都已加载
    setTimeout(function() {
        console.log('正在初始化Prism.js代码高亮...');
        initPrismHighlighting();
    }, 500);
});

// 监听内容加载事件
document.addEventListener('contentLoaded', function() {
    console.log('内容已加载，重新应用代码高亮...');
    setTimeout(function() {
        initPrismHighlighting();
    }, 100);
});

/**
 * 初始化Prism代码高亮
 */
function initPrismHighlighting() {
    if (typeof Prism === 'undefined') {
        console.error('Prism.js未加载，无法应用代码高亮');
        return;
    }
    
    // 处理所有代码块
    const codeBlocks = document.querySelectorAll('.code-block pre');
    console.log(`找到 ${codeBlocks.length} 个代码块`);
    
    codeBlocks.forEach(function(preElement, index) {
        const codeElement = preElement.querySelector('code');
        if (!codeElement) return;
        
        // 确保代码元素有正确的语言类
        const language = preElement.getAttribute('data-language') || 'python';
        
        // 直接设置语言类
        codeElement.className = `language-${language}`;
        
        // 手动应用Prism高亮
        try {
            console.log(`正在高亮代码块 #${index+1}, 语言: ${language}`);
            Prism.highlightElement(codeElement);
        } catch (e) {
            console.error(`高亮代码块 #${index+1} 时出错:`, e);
        }
    });
    
    console.log('Prism.js代码高亮初始化完成');
}
