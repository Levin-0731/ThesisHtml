// 导入模块
import { generatePages } from './pagination.js';
import { generateTOC } from './toc.js';
import { setupPrinting } from './printing.js';
import { setupNavigation } from './navigation.js';
import { loadChapterContents } from './content-loader.js';
import { initializeFormatting } from './formatting.js';

// 章节文件列表
const CHAPTER_FILES = [
    'sections/chapter1绪论.html',
    'sections/chapter4.html',
    'sections/chapter5.html',
    // 可以添加更多章节文件
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeSystem();
});

// 初始化系统
async function initializeSystem() {
    // 显示加载指示器
    showLoading();
    
    try {
        console.log('开始加载章节内容...');
        // 从外部文件加载章节内容
        const paperContent = await loadChapterContents(CHAPTER_FILES);
        console.log('章节内容加载完成', paperContent);
        
        // 检查内容是否正确加载
        if (!paperContent || paperContent.childNodes.length === 0) {
            throw new Error('章节内容为空');
        }
        
        // 生成页面
        const pagesContainer = document.getElementById('pages-container');
        console.log('开始生成页面...');
        const pageCount = generatePages(paperContent, pagesContainer);
        console.log(`生成了 ${pageCount} 页内容`);
        
        // 生成目录
        console.log('生成目录...');
        generateTOC();
        
        // 设置打印功能
        setupPrinting();
        
        // 设置页面导航
        setupNavigation();
        
        // 初始化格式化功能（缩进、自动编号和数学公式）
        console.log('初始化格式化功能...');
        initializeFormatting();
    } catch (error) {
        console.error('初始化系统失败:', error);
        showError('加载论文内容失败，请刷新页面重试。');
    } finally {
        // 隐藏加载指示器
        hideLoading();
    }
}

/**
 * 显示加载指示器
 */
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = '<div class="spinner"></div><p>正在加载论文内容...</p>';
    document.body.appendChild(loadingElement);
}

/**
 * 隐藏加载指示器
 */
function hideLoading() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        document.body.removeChild(loadingElement);
    }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(errorElement);
}
