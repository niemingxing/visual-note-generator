import type { Section } from '../types.ts';
import { buildImagePrompt, buildAnalysisPrompt } from './promptBuilder';

const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';


function authHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
}

// 验证 API Key
export async function validateApiKey(apiKey: string, chatModel: string): Promise<boolean> {
  if (!apiKey || !chatModel) return false;
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

// AI 分析文档内容
export async function analyzeContent(
  content: string,
  userPrompt: string,
  apiKey: string,
  chatModel: string
): Promise<Section[]> {
  const prompt = buildAnalysisPrompt(content, userPrompt);

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      model: chatModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API 请求失败');
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error('AI 未返回分析结果');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 返回格式不正确');

  const result = JSON.parse(jsonMatch[0]);
  if (!result.sections || !Array.isArray(result.sections)) {
    throw new Error('AI 返回的数据格式不正确');
  }

  return result.sections.map((section: any, index: number) => ({
    id: `section-${Date.now()}-${index}`,
    title: section.title || `第 ${index + 1} 部分`,
    content: section.content || '',
    visualType: section.visual_type || 'other',
    order: index
  }));
}

// 生成单张图片
export async function generateImage(
  prompt: string,
  apiKey: string,
  imageModel: string,
  size: string
): Promise<string> {
  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      model: imageModel,
      prompt,
      size,
      response_format: 'b64_json'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '图片生成失败');
  }

  const data = await response.json();
  const imageData = data.data?.[0];

  if (!imageData) throw new Error('AI 未返回图片');

  if (imageData.b64_json) return imageData.b64_json;
  if (imageData.url) {
    // 将 URL 转为 base64
    const imgResponse = await fetch(imageData.url);
    const blob = await imgResponse.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  throw new Error('响应中未找到图片数据');
}

// 生成单个分段的图片
export async function generateSingleImage(
  section: Section,
  style: string,
  aspectRatio: string,
  brand: any,
  apiKey: string,
  imageModel: string
): Promise<{ id: string; filename: string; data: string; sectionId: string }> {
  const prompt = section.imagePrompts?.[0] || buildImagePrompt(
    section.content,
    style as any,
    aspectRatio as any,
    brand,
    section.title,
    section.visualType
  );

  const size = '2k';
  const data = await generateImage(prompt, apiKey, imageModel, size);

  return {
    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    filename: `${section.order + 1}_${section.title}.png`,
    data,
    sectionId: section.id
  };
}

// 批量生成图片
export async function generateImages(
  sections: Section[],
  style: string,
  aspectRatio: string,
  brand: any,
  apiKey: string,
  imageModel: string,
  workers: number,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ id: string; filename: string; data: string; sectionId: string }>> {
  const results: Array<{ id: string; filename: string; data: string; sectionId: string }> = [];
  const total = sections.length;
  let completed = 0;

  const chunks: Section[][] = [];
  for (let i = 0; i < sections.length; i += workers) {
    chunks.push(sections.slice(i, i + workers));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (section) => {
      const prompt = section.imagePrompts?.[0] || buildImagePrompt(
        section.content,
        style as any,
        aspectRatio as any,
        brand,
        section.title,
        section.visualType
      );

      const size = '2k';
      const data = await generateImage(prompt, apiKey, imageModel, size);
      completed++;
      if (onProgress) onProgress(completed, total);

      return {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: `${section.order + 1}_${section.title}.png`,
        data,
        sectionId: section.id
      };
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}
