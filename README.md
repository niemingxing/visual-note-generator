# Visual Note Generator

将文档（PDF、Markdown、TXT）转换为精美 AI 视觉笔记图片的工具，由 Google Gemini AI 驱动。

## 功能介绍

- **多格式文档解析**：支持上传 PDF、Markdown、TXT 文件，自动提取文本内容
- **AI 内容分析**：调用 Gemini AI 将文档内容智能拆分为多个视觉化章节
- **视觉笔记生成**：根据每个章节生成对应的视觉笔记图片，支持 5 种风格：
  - 手绘风格（Sketchnote）
  - 简约风格（Minimalist）
  - 彩色风格（Colorful）
  - 暗黑风格（Dark）
  - 复古风格（Retro）
- **多种宽高比**：支持 1:1、4:5、3:4、9:16、16:9、4:3
- **提示词模板**：内置 14 个提示词模板，覆盖内容提取、处理方式、应用场景、输出格式等方向
- **品牌定制**：可添加自定义品牌名称、署名等信息
- **批量下载**：生成的图片支持一键打包为 ZIP 下载

## 使用前提

需要一个有效的 [Google Gemini API Key](https://aistudio.google.com/apikey)。

## 安装与运行

### 本地开发

```bash
# 克隆项目
git clone <repo-url>
cd visual-note-generator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录，可部署到任意静态文件服务器。

## 使用方法

1. 进入**设置页面**，填入 Gemini API Key 并保存
2. 返回**工作台**，上传文档（PDF / Markdown / TXT）
3. 点击**分析文档**，AI 自动将内容拆分为多个章节
4. 在左侧选择或编辑各章节内容，配置生成风格、宽高比等参数
5. 点击**生成图片**，等待 AI 生成视觉笔记
6. 在右侧预览图片，支持单张下载或批量打包下载

## 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 8
- **样式**：Tailwind CSS 4
- **状态管理**：Zustand
- **AI 能力**：Google Gemini API（内容分析 + 图片生成）
- **文档解析**：pdfjs-dist（PDF）、marked（Markdown）
