# HTML论文展示系统

## 项目概述

HTML论文展示系统是一个基于Web技术的论文排版与展示工具，支持A4格式分页预览和PDF打印功能。系统采用纯前端技术实现，无需后端支持，可以在任何现代浏览器中运行。适合用于学术论文、研究报告、技术文档等需要精确排版的场景。

## 核心功能

- **A4页面布局**：精确实现A4纸张尺寸（210mm × 297mm）和页边距（上下25mm，左右20mm）
- **自动分页**：根据内容自动计算分页，处理跨页元素
- **目录生成**：自动分析文档结构生成目录，支持点击跳转
- **页码管理**：自动为每页添加页码
- **打印导出**：支持导出为PDF，保持样式一致性
- **模块化内容**：支持从外部HTML文件加载章节内容
- **数学公式支持**：集成MathJax，支持LaTeX格式的数学公式
- **自动编号**：支持标题、列表的自动编号功能
- **文本缩进**：支持多级文本缩进，适合论文格式要求

## 技术特点

- 使用HTML5语义化标签构建文档结构
- 采用CSS Grid/Flexbox实现精确布局
- 使用CSS变量定义主题，便于样式定制
- 采用ES6+模块化组织JavaScript代码
- 响应式设计适配打印需求
- 集成MathJax实现数学公式渲染
- 使用CSS计数器实现自动编号功能
- 无依赖设计，不需要额外的框架或库

## 项目结构

```
/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 样式文件
├── js/
│   ├── main.js         # 主程序
│   ├── pagination.js   # 分页模块
│   ├── toc.js          # 目录生成模块
│   ├── printing.js     # 打印功能模块
│   ├── navigation.js   # 页面导航模块
│   └── content-loader.js # 内容加载模块
├── sections/           # 章节内容目录
│   ├── chapter1.html   # 第一章内容
│   └── chapter4.html   # 第四章内容
└── images/             # 图片资源目录
```

## 使用方法

### 1. 启动系统

```bash
# 使用任意HTTP服务器启动项目
python -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 2. 添加新章节

1. 在 `sections` 目录下创建新的HTML文件，例如 `chapter2.html`
2. 按照已有章节的格式编写内容
3. 在 `js/main.js` 文件中的 `CHAPTER_FILES` 数组中添加新章节文件路径

```javascript
const CHAPTER_FILES = [
    'sections/chapter1.html',
    'sections/chapter2.html',  // 新添加的章节
    'sections/chapter4.html',
];
```

### 3. 导出PDF

点击界面底部的"打印"按钮，在浏览器打印对话框中选择"另存为PDF"即可。

## 浏览器兼容性

系统已在以下浏览器中测试通过：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 自定义样式

可以通过修改 `css/styles.css` 文件中的CSS变量来自定义样式：

```css
:root {
    /* 颜色变量 */
    --primary-color: #333;
    --secondary-color: #666;
    --accent-color: #0066cc;
    
    /* 尺寸变量 */
    --page-width: 210mm;
    --page-height: 297mm;
    --margin-top: 25mm;
    --margin-right: 20mm;
    --margin-bottom: 25mm;
    --margin-left: 20mm;
    
    /* 字体变量 */
    --font-title: "SimHei", "黑体", "Times New Roman", serif;
    --font-body: "SimSun", "宋体", "Times New Roman", serif;
    --font-code: "Consolas", "Monaco", monospace;
}
```

## 注意事项

1. 图片建议使用相对路径，并放置在 `images` 目录下
2. 表格和图片会自动处理分页，避免过大的表格和图片
3. 代码块使用 `<pre><code>` 标签包裹，支持语法高亮
4. 打印时会自动应用打印样式，隐藏非必要元素

## 行距处理与边界情况

本系统采用了特殊的CSS设计来确保正文中的行距一致，即使在HTML源码中存在空行或特殊标签。

### 行距处理机制

- 所有段落元素(`<p>`)之间的行距已通过CSS强制设置为一致
- 系统会自动忽略HTML中的空行和`<br>`标签，不会影响最终渲染效果
- 带有`<strong>`标签的段落与普通段落之间的行距保持一致

### 编辑注意事项

当编辑HTML文件时，不需要特别注意段落之间是否有空行，系统会自动处理这些情况。但对于以下边界情况，需要特别注意：

1. **代码块插入**：代码块使用`<pre><code>`标签包裹，并且已经设置了特殊的样式。代码块前后的段落行距会自动处理。

2. **图表插入**：图表应使用`<figure>`和`<figcaption>`标签包裹，系统已为其设置了适当的间距。例如：
   ```html
   <figure>
     <img src="path/to/image.jpg" alt="图片描述">
     <figcaption>图1. 图片标题</figcaption>
   </figure>
   ```

3. **数学公式**：数学公式使用MathJax渲染，可以在行内使用`\(\)`或单独段落使用`$$$$`包裹LaTeX公式。系统已经为公式设置了适当的行距。

4. **表格**：表格使用`<table>`标签创建，并应包含适当的标题。表格前后的行距已经调整为与正文一致。

### CSS实现机制

行距一致性通过以下CSS规则实现：

```css
/* 正文样式设置 */
.content-page p {
    line-height: 1.5;
    margin: 0;
    padding: 0;
}

/* 强制所有段落之间没有额外的间距 */
.content-page p + p {
    margin-top: 0 !important;
}

/* 消除所有段落之间的空白行影响 */
.content-page br, 
.content-page p:empty {
    display: none;
    height: 0;
    line-height: 0;
}
```

这些规则确保了即使在HTML源码中存在空行或特殊标签，最终渲染的文档中行距仍然保持一致。

## 未来计划

- 支持数学公式（通过MathJax或KaTeX）
- 增强引用和参考文献管理
- 添加多主题支持
- 提供更多格式导出选项（如Word、Markdown）

## 许可证

MIT
