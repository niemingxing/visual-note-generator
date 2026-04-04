import JSZip from 'jszip';
import type { Section } from '../types.ts';
import { buildImagePrompt, buildAnalysisPrompt } from './promptBuilder';

// 验证 API 密钥
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      console.error('API Key validation failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('API Key validation error:', error);
    return false;
  }
}

// AI 分析文档内容
export async function analyzeContent(
  content: string,
  userPrompt: string,
  apiKey: string
): Promise<Section[]> {
  const prompt = buildAnalysisPrompt(content, userPrompt);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API 请求失败');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('AI 未返回分析结果');
    }

    // 解析 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 返回格式不正确');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.sections || !Array.isArray(result.sections)) {
      throw new Error('AI 返回的数据格式不正确');
    }

    // 转换为 Section 格式
    return result.sections.map((section: any, index: number) => ({
      id: `section-${Date.now()}-${index}`,
      title: section.title || `第 ${index + 1} 部分`,
      content: section.content || '',
      visualType: section.visual_type || 'other',
      order: index
    }));
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

// 生成单张图片
export async function generateImage(
  prompt: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8 }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '图片生成失败');
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('AI 未返回图片');
  }

  const parts = data.candidates[0].content?.parts || [];

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
  }

  throw new Error('响应中未找到图片数据');
}

// 生成单个分段的图片
export async function generateSingleImage(
  section: Section,
  style: string,
  aspectRatio: string,
  brand: any,
  apiKey: string
): Promise<{ id: string; filename: string; data: string; sectionId: string }> {
  const prompt = section.imagePrompts?.[0] || buildImagePrompt(
    section.content,
    style as any,
    aspectRatio as any,
    brand,
    section.title,
    section.visualType
  );

  const data = await generateImage(prompt, apiKey);

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
  workers: number,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ id: string; filename: string; data: string; sectionId: string }>> {
  const results: Array<{ id: string; filename: string; data: string; sectionId: string }> = [];
  const total = sections.length;
  let completed = 0;

  // 并发控制
  const chunks: Section[][] = [];
  for (let i = 0; i < sections.length; i += workers) {
    chunks.push(sections.slice(i, i + workers));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (section) => {
      // 使用分段中的提示词，如果没有则使用自动生成的提示词
      const prompt = section.imagePrompts?.[0] || buildImagePrompt(
        section.content,
        style as any,
        aspectRatio as any,
        brand,
        section.title,
        section.visualType
      );

      try {
        const data = await generateImage(prompt, apiKey);
        completed++;
        if (onProgress) onProgress(completed, total);

        return {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: `${section.order + 1}_${section.title}.png`,
          data,
          sectionId: section.id
        };
      } catch (error) {
        console.error(`生成图片失败: ${section.title}`, error);
        throw error;
      }
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}

// 下载 ZIP 压缩包
export async function downloadZip(
  images: Array<{ filename: string; data: string }>
): Promise<void> {
  const zip = new JSZip();

  images.forEach((img) => {
    zip.file(img.filename, base64ToBlob(img.data));
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `visual-notes-${Date.now()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

// Base64 转 Blob
function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: 'image/png' });
}
