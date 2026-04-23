import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModelProvider, StyleType, AspectRatioType, BrandInfo, AdvancedSettings, Section, GeneratedImage } from '../types.ts';
import { DEFAULT_CONFIG, STORAGE_KEYS } from '../constants/index.ts';

type SettingsState = {
  provider: ModelProvider;
  apiKey: string;
  volcengineApiKey: string;
  volcengineChatModel: string;
  volcengineImageModel: string;
  apimartApiKey: string;
  apimartChatModel: string;
  apimartImageModel: string;
  setProvider: (provider: ModelProvider) => void;
  setApiKey: (key: string) => void;
  setVolcengineApiKey: (key: string) => void;
  setVolcengineChatModel: (model: string) => void;
  setVolcengineImageModel: (model: string) => void;
  setApimartApiKey: (key: string) => void;
  setApimartChatModel: (model: string) => void;
  setApimartImageModel: (model: string) => void;
  clearApiKey: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'google',
      apiKey: '',
      volcengineApiKey: '',
      volcengineChatModel: 'doubao-seed-2-0-pro-260215',
      volcengineImageModel: 'doubao-seedream-4-5-251128',
      apimartApiKey: '',
      apimartChatModel: 'gpt-4o',
      apimartImageModel: 'gpt-image-2',
      setProvider: (provider) => set({ provider }),
      setApiKey: (key) => set({ apiKey: key }),
      setVolcengineApiKey: (key) => set({ volcengineApiKey: key }),
      setVolcengineChatModel: (model) => set({ volcengineChatModel: model }),
      setVolcengineImageModel: (model) => set({ volcengineImageModel: model }),
      setApimartApiKey: (key) => set({ apimartApiKey: key }),
      setApimartChatModel: (model) => set({ apimartChatModel: model }),
      setApimartImageModel: (model) => set({ apimartImageModel: model }),
      clearApiKey: () => set({ apiKey: '', volcengineApiKey: '', apimartApiKey: '' })
    }),
    {
      name: STORAGE_KEYS.API_KEY
    }
  )
);

type PreferencesState = {
  style: StyleType;
  aspectRatio: AspectRatioType;
  brand: BrandInfo;
  advanced: AdvancedSettings;
  setStyle: (style: StyleType) => void;
  setAspectRatio: (ratio: AspectRatioType) => void;
  setBrand: (brand: Partial<BrandInfo>) => void;
  setAdvanced: (advanced: Partial<AdvancedSettings>) => void;
  resetPreferences: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,
      setStyle: (style) => set({ style }),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      setBrand: (brand) => set((state) => ({ brand: { ...state.brand, ...brand } })),
      setAdvanced: (advanced) => set((state) => ({ advanced: { ...state.advanced, ...advanced } })),
      resetPreferences: () => set(DEFAULT_CONFIG)
    }),
    {
      name: STORAGE_KEYS.PREFERENCES
    }
  )
);

type ContentState = {
  markdown: string;
  sections: Section[];
  promptGuide: string;
  setMarkdown: (content: string) => void;
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
  setPromptGuide: (prompt: string) => void;
  clearContent: () => void;
};

export const useContentStore = create<ContentState>((set) => ({
  markdown: '',
  sections: [],
  promptGuide: '',
  setMarkdown: (markdown) => set({ markdown }),
  setSections: (sections) => set({ sections }),
  addSection: (section) => set((state) => ({ sections: [...state.sections, section] })),
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
  })),
  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id)
  })),
  setPromptGuide: (promptGuide) => set({ promptGuide }),
  clearContent: () => set({ markdown: '', sections: [], promptGuide: '' })
}));

type GenerationState = {
  isGenerating: boolean;
  progress: number;
  images: GeneratedImage[];
  error: string | null;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setImages: (images: GeneratedImage[]) => void;
  addImage: (image: GeneratedImage) => void;
  setError: (error: string | null) => void;
  resetGeneration: () => void;
};

export const useGenerationStore = create<GenerationState>((set) => ({
  isGenerating: false,
  progress: 0,
  images: [],
  error: null,
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  setError: (error) => set({ error }),
  resetGeneration: () => set({ isGenerating: false, progress: 0, images: [], error: null })
}));
