// 添加一个实际值导出以避免 Vite 将文件视为空模块
export const __TYPES_VERSION__ = '1.0.0';

export type StyleType = 'sketchnote' | 'minimalist' | 'colorful' | 'dark' | 'retro';
export type AspectRatioType = '1:1' | '4:5' | '3:4' | '9:16' | '16:9' | '4:3';
export type VisualType = 'list' | 'process' | 'diagram' | 'comparison' | 'timeline' | 'other';

export interface BrandInfo {
  name: string;
  tagline: string;
  instructor: string;
}

export interface AdvancedSettings {
  workers: number;
  timeout: number;
  retries: number;
  temperature: number;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  visualType: VisualType;
  order: number;
  imagePrompts?: string[];
}

export interface ParseResult {
  content: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    wordCount: number;
  };
}

export interface GenerationConfig {
  style: StyleType;
  aspectRatio: AspectRatioType;
  brand: BrandInfo;
  advanced: AdvancedSettings;
}

export interface GeneratedImage {
  id: string;
  filename: string;
  data: string;
  thumbnail?: string;
  sectionId: string;
}

export interface HistoryRecord {
  id: string;
  title: string;
  markdown: string;
  sections: Section[];
  config: GenerationConfig;
  images: GeneratedImage[];
  createdAt: Date;
  isFavorite: boolean;
}

export interface AppState {
  apiKey: string;
  currentConfig: GenerationConfig;
  currentContent: string;
  currentSections: Section[];
  promptGuide: string;
  isGenerating: boolean;
  generationProgress: number;
  generatedImages: GeneratedImage[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  category: 'extract' | 'process' | 'scenario' | 'format';
}
