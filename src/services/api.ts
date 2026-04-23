import * as gemini from './geminiApi';
import * as volcano from './volcengineApi';
import * as apimart from './apimartApi';
import { useSettingsStore } from '../stores';
import type { Section } from '../types.ts';

export async function analyzeContent(
  content: string,
  userPrompt: string,
  _apiKey: string
): Promise<Section[]> {
  const state = useSettingsStore.getState();
  if (state.provider === 'volcengine') {
    return volcano.analyzeContent(content, userPrompt, state.volcengineApiKey, state.volcengineChatModel);
  }
  if (state.provider === 'apimart') {
    return apimart.analyzeContent(content, userPrompt, state.apimartApiKey, state.apimartChatModel);
  }
  return gemini.analyzeContent(content, userPrompt, state.apiKey);
}

export async function generateSingleImage(
  section: Section,
  style: string,
  aspectRatio: string,
  brand: any,
  _apiKey: string
): Promise<{ id: string; filename: string; data: string; sectionId: string }> {
  const state = useSettingsStore.getState();
  if (state.provider === 'volcengine') {
    return volcano.generateSingleImage(section, style, aspectRatio, brand, state.volcengineApiKey, state.volcengineImageModel);
  }
  if (state.provider === 'apimart') {
    return apimart.generateSingleImage(section, style, aspectRatio, brand, state.apimartApiKey, state.apimartImageModel);
  }
  return gemini.generateSingleImage(section, style, aspectRatio, brand, state.apiKey);
}

export async function generateImages(
  sections: Section[],
  style: string,
  aspectRatio: string,
  brand: any,
  _apiKey: string,
  workers: number,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ id: string; filename: string; data: string; sectionId: string }>> {
  const state = useSettingsStore.getState();
  if (state.provider === 'volcengine') {
    return volcano.generateImages(sections, style, aspectRatio, brand, state.volcengineApiKey, state.volcengineImageModel, workers, onProgress);
  }
  if (state.provider === 'apimart') {
    return apimart.generateImages(sections, style, aspectRatio, brand, state.apimartApiKey, state.apimartImageModel, workers, onProgress);
  }
  return gemini.generateImages(sections, style, aspectRatio, brand, state.apiKey, workers, onProgress);
}

export { downloadZip } from './geminiApi';
