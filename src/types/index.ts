export type StyleType = 'sketchnote' | 'minimalist' | 'colorful' | 'dark' | 'retro';
export type AspectRatioType = '9:16' | '1:1' | '16:9';
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
  thumbnail: string;
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
