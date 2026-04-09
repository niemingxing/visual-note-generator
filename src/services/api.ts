import * as gemini from './geminiApi';
import * as volcano from './volcengineApi';
import { useSettingsStore } from '../stores';
import type { Section } from '../types.ts';

export async function analyzeContent(
  content: string,
  userPrompt: string,
  _apiKey: string
): Promise<Section[]> {
  const { provider, apiKey, volcengineApiKey, volcengineChatModel } = useSettingsStore.getState();
  if (provider === 'volcengine') {
    return volcano.analyzeContent(content, userPrompt, volcengineApiKey, volcengineChatModel);
  }
  return gemini.analyzeContent(content, userPrompt, apiKey);
}

export async function generateSingleImage(
  section: Section,
  style: string,
  aspectRatio: string,
  brand: any,
  _apiKey: string
): Promise<{ id: string; filename: string; data: string; sectionId: string }> {
  const { provider, apiKey, volcengineApiKey, volcengineImageModel } = useSettingsStore.getState();
  if (provider === 'volcengine') {
    return volcano.generateSingleImage(section, style, aspectRatio, brand, volcengineApiKey, volcengineImageModel);
  }
  return gemini.generateSingleImage(section, style, aspectRatio, brand, apiKey);
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
  const { provider, apiKey, volcengineApiKey, volcengineImageModel } = useSettingsStore.getState();
  if (provider === 'volcengine') {
    return volcano.generateImages(sections, style, aspectRatio, brand, volcengineApiKey, volcengineImageModel, workers, onProgress);
  }
  return gemini.generateImages(sections, style, aspectRatio, brand, apiKey, workers, onProgress);
}

export { downloadZip } from './geminiApi';
