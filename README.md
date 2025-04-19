# HTML论文展示系统

一个基于HTML/CSS/JavaScript的论文展示系统，支持A4格式分页预览和PDF打印功能。该系统专为学术论文设计，提供精确的A4页面布局、自动分页、目录生成和打印功能。

## 功能特点

- **A4页面布局**：精确模拟A4纸张（210mm × 297mm）
- **自动分页**：智能分页算法，处理各类内容元素
- **目录生成**：自动生成可交互的目录
- **代码高亮**：支持多种编程语言的代码高亮显示
- **数学公式**：集成MathJax支持LaTeX数学公式
- **打印导出**：支持导出为PDF，保持格式一致性
- **响应式设计**：适配不同屏幕和打印环境

## 系统架构

项目采用模块化结构，将内容、样式和功能分离：

```
/Html
├── css/                        # 样式文件目录
│   └── styles.css              # 主样式表
├── images/                     # 图片资源目录
├── index.html                  # 主页面入口
├── js/                         # JavaScript代码目录
│   ├── code-highlight.js       # 代码高亮功能
│   ├── content-loader.js       # 章节内容加载器
│   ├── formatting.js           # 文本格式化处理
│   ├── main.js                 # 主入口文件
│   ├── navigation.js           # 页面导航功能
│   ├── pagination.js           # 分页处理模块
│   ├── printing.js             # 打印功能实现
│   ├── prism-init.js           # Prism代码高亮初始化
│   └── toc.js                  # 目录生成功能
└── sections/                   # 论文章节内容目录
    ├── chapter1_研究背景与意义.html
    ├── chapter2_国内外研究现状.html
    ├── chapter3_研究内容与方案.html
    ├── chapter4_实施计划.html
    ├── chapter5_预期成果.html
    ├── chapter6_参考文献.html
    ├── chapter7_示例章节.html
    └── cover_page.html         # 封面页
```

## 核心模块说明

### 主要入口文件

- **index.html**：系统主入口，包含基本HTML结构和外部依赖引入
  - 集成MathJax数学公式支持
  - 集成Prism代码高亮
  - 定义论文容器、目录面板和控制区

### JavaScript模块

- **main.js**：系统初始化和协调模块
  - 导入其他JS模块
  - 定义章节文件列表
  - 初始化系统流程
  - 提供加载和错误处理

- **pagination.js**：核心分页处理
  - 实现精确的A4分页算法
  - 处理不同元素类型的分页逻辑
  - 添加页码和页眉
  - 处理内容的高度估算

- **content-loader.js**：加载外部章节内容

- **toc.js**：生成论文目录并提供导航

- **printing.js**：论文打印功能实现

- **navigation.js**：页面导航功能

- **formatting.js**：文本格式化处理

- **code-highlight.js**：代码高亮实现

- **prism-init.js**：Prism库初始化配置

### 样式文件

- **styles.css**：定义论文的样式
  - A4页面布局设置
  - 文本排版样式
  - 打印样式规则
  - 响应式设计调整

### 内容文件

- **sections/**：包含论文各章节的HTML文件
  - 每个文件对应一个论文章节
  - 使用HTML5语义化标签
  - 支持各类内容元素（图表、代码、公式等）

## 使用方法

### 本地运行

1. 克隆或下载项目到本地
2. 使用现代浏览器（Chrome, Firefox, Edge等）打开`index.html`文件
3. 论文内容将自动加载并分页显示

### 修改论文内容

1. 修改`sections/`目录下的HTML文件以更新论文章节内容
2. 如需添加新章节：
   - 创建新的HTML文件
   - 在`main.js`中的`CHAPTER_FILES`数组中添加文件路径

### 打印为PDF

1. 点击界面右下角的"打印"按钮
2. 在打印对话框中选择"另存为PDF"
3. 确保打印设置为A4纸张和无边距

## 技术实现

### 分页算法

系统采用精确的分页算法，确保内容正确分布在A4页面上：

- 使用CSS Grid布局实现A4比例页面
- JavaScript动态计算元素高度并进行分页
- 智能处理不可分割元素（如标题、图表）
- 考虑元素权重决定分页位置

### 格式化处理

#### 多级标题自动编号实现

系统采用CSS计数器实现多级标题的自动编号，确保样式一致性和打印可靠性：

- **一级标题(H1)**：使用中文数字编号（一、二、三...）
  ```css
  .content-page h1::before {
    content: counter(h1counter, cjk-ideographic) "、";
  }
  ```

- **二级标题(H2)**：使用中文数字带括号（（一）、（二）...）
  ```css
  .content-page h2::before {
    content: "（" counter(h2counter, cjk-ideographic) "）";
  }
  ```

- **三级标题(H3)**：使用阿拉伯数字加右括号（1)、2)...）
  ```css
  .content-page h3::before {
    content: counter(h3counter) ")";
  }
  ```

- **四级标题(H4)**：使用多级数字编号（1.1.1、1.1.2...）
  ```css
  .content-page h4::before {
    content: counter(h2counter) "." counter(h3counter) "." counter(h4counter) " ";
  }
  ```

- **五级标题(H5)**：使用更深层次的数字编号（1.1.1.1、1.1.1.2...）

**实现原理**：

1. 在CSS中初始化计数器：
   ```css
   :root {
     counter-reset: h1counter h2counter h3counter h4counter h5counter;
   }
   ```

2. 每遇到标题元素就递增相应计数器：
   ```css
   .content-page h1 { counter-increment: h1counter; }
   ```

3. 更高级别的标题会重置低级别的计数器：
   ```css
   .content-page h1 { counter-reset: h2counter; }
   .content-page h2 { counter-reset: h3counter; }
   ```

4. 使用伪元素(::before)在标题前显示编号

5. 通过JavaScript将CSS计数器值保存为数据属性，用于目录生成和引用

#### 其他格式化功能

- 自动处理图表、公式的引用编号
- LaTeX数学公式渲染（MathJax集成）
- 代码块语法高亮（Prism.js集成）
- 段落首行缩进和间距控制

### 打印优化

- 使用CSS `@page` 规则控制打印样式
- 确保打印版本与屏幕预览一致
- 优化页面断点，避免内容被不当分割

## 兼容性

- 支持现代浏览器（Chrome, Firefox, Edge, Safari）
- 推荐使用最新版Chrome或Edge获得最佳打印体验
- 响应式设计支持不同屏幕尺寸

## 扩展开发

### 添加新功能

1. 遵循模块化结构创建新的JavaScript模块
2. 在main.js中导入并初始化新模块
3. 保持与现有代码风格一致

### 自定义样式

1. 修改css/styles.css调整样式
2. 添加新的CSS变量以保持主题一致性
3. 注意保持A4比例和页面布局

## 更新日志

### 版本 1.0.0 (2025-04-19)
- 初始版本发布
- 实现核心分页功能
- 添加目录和导航功能
- 支持代码高亮和数学公式
