import type { StyleType, AspectRatioType } from '../types.ts';
import type { PromptTemplate } from '../types.ts';

export const STYLES: Record<StyleType, { id: StyleType; name: string; icon: string; description: string; prompt: string }> = {
  sketchnote: {
    id: 'sketchnote',
    name: '手绘涂鸦风',
    icon: '✏️',
    description: '便利贴、箭头、图标、柔和色彩',
    prompt: 'Visual note-taking infographic with hand-drawn sketchnote style.'
  },
  minimalist: {
    id: 'minimalist',
    name: '简约清新',
    icon: '📄',
    description: '大量留白、简洁线条',
    prompt: 'Clean minimalist infographic with ample white space.'
  },
  colorful: {
    id: 'colorful',
    name: '活力彩色',
    icon: '🌈',
    description: '鲜艳色彩、渐变',
    prompt: 'Bold vibrant infographic with eye-catching colors.'
  },
  dark: {
    id: 'dark',
    name: '暗色科技',
    icon: '🌙',
    description: '深色背景、霓虹色彩',
    prompt: 'Dark mode infographic with dark background.'
  },
  retro: {
    id: 'retro',
    name: '复古风格',
    icon: '📜',
    description: '纸质纹理、复古色调',
    prompt: 'Vintage-style infographic with paper texture.'
  }
};

export const ASPECT_RATIOS: Record<AspectRatioType, { id: AspectRatioType; name: string; dimensions: string }> = {
  '1:1': { id: '1:1', name: '1:1 正方形', dimensions: '1080x1080' },
  '4:5': { id: '4:5', name: '4:5 Instagram', dimensions: '1080x1350' },
  '3:4': { id: '3:4', name: '3:4 竖版', dimensions: '1080x1440' },
  '9:16': { id: '9:16', name: '9:16 手机', dimensions: '1080x1920' },
  '16:9': { id: '16:9', name: '16:9 横版', dimensions: '1920x1080' },
  '4:3': { id: '4:3', name: '4:3 传统', dimensions: '1440x1080' }
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: 'extractCorePoints', name: '提取核心要点', icon: '🎯', prompt: '提取文档中的核心观点和关键结论，用简洁的语言总结，每个段落聚焦一个核心概念。', category: 'extract' },
  { id: 'summarizeMethod', name: '总结方法论', icon: '📋', prompt: '提取文档中的方法论、步骤和流程，生成结构化的视觉笔记。', category: 'extract' },
  { id: 'extractFormula', name: '提炼公式模型', icon: '🧮', prompt: '重点提取文档中的公式、模型、框架，用图解方式呈现。', category: 'extract' },
  { id: 'makeSimple', name: '简洁总结', icon: '✂️', prompt: '将内容简化，去除冗余，保留最核心的信息。', category: 'process' },
  { id: 'makeDetailed', name: '详细展开', icon: '📖', prompt: '保留更多细节，生成更详细的视觉笔记。', category: 'process' },
  { id: 'storytelling', name: '故事化叙述', icon: '📚', prompt: '用故事化的方式组织内容，让笔记更易理解和记忆。', category: 'process' },
  { id: 'studyNotes', name: '生成学习笔记', icon: '📝', prompt: '生成适合学生复习的学习笔记，结构清晰，重点突出，便于记忆。', category: 'scenario' },
  { id: 'trainingMaterial', name: '制作培训材料', icon: '👥', prompt: '制作员工培训用的视觉化材料，步骤清晰，易于理解。', category: 'scenario' },
  { id: 'presentationSlides', name: '演示文稿内容', icon: '📊', prompt: '生成适合制作演示文稿的内容，每张图一个主题，视觉化呈现。', category: 'scenario' },
  { id: 'socialMedia', name: '社交媒体分享', icon: '📱', prompt: '生成适合在社交媒体（朋友圈、小红书）分享的视觉笔记，图文并茂。', category: 'scenario' },
  { id: 'createFlowchart', name: '创建流程图', icon: '🔄', prompt: '将内容转换为流程图形式，展示步骤和流程关系。', category: 'format' },
  { id: 'createComparison', name: '生成对比图', icon: '⚖️', prompt: '提取内容中的对比关系，生成对比式视觉笔记。', category: 'format' },
  { id: 'createTimeline', name: '生成时间线', icon: '📅', prompt: '按时间或逻辑顺序组织内容，生成时间线形式的笔记。', category: 'format' }
];

export const SUPPORTED_FILE_FORMATS = [
  { ext: '.pdf', name: 'PDF', mimeType: 'application/pdf', icon: '📕' },
  { ext: '.md', name: 'Markdown', mimeType: 'text/markdown', icon: '📝' },
  { ext: '.txt', name: 'TXT', mimeType: 'text/plain', icon: '📄' }
];

export const DEFAULT_CONFIG = {
  style: 'sketchnote' as StyleType,
  aspectRatio: '9:16' as AspectRatioType,
  brand: {
    name: '',
    tagline: '',
    instructor: ''
  },
  advanced: {
    workers: 2,
    timeout: 30,
    retries: 2,
    temperature: 0.8
  }
};

export const STORAGE_KEYS = {
  API_KEY: 'vng_api_key',
  PREFERENCES: 'vng_preferences',
  DRAFT: 'vng_draft',
  HISTORY: 'vng_history'
};
