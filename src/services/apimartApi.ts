import type { Section } from '../types.ts';
import { buildImagePrompt, buildAnalysisPrompt } from './promptBuilder';

const BASE_URL = 'https://api.apimart.ai/v1';

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
        max_tokens: 1,
        stream: false
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
      max_tokens: 8192,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API 请求失败');
  }

  const data = await response.json();
  const text = data.data?.choices?.[0]?.message?.content ?? data.choices?.[0]?.message?.content;

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

// 提交图片生成任务
async function submitImageTask(
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
      n: 1,
      size
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '图片任务提交失败');
  }

  const data = await response.json();
  const taskId = data.data?.[0]?.task_id;
  if (!taskId) throw new Error('未获取到任务 ID');
  return taskId;
}

// 轮询任务结果
async function pollTaskResult(taskId: string, apiKey: string, timeout = 120000): Promise<string> {
  const startTime = Date.now();
  const INITIAL_DELAY = 10000;
  const POLL_INTERVAL = 5000;

  // 首次延迟
  await new Promise(r => setTimeout(r, INITIAL_DELAY));

  while (Date.now() - startTime < timeout) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      headers: authHeaders(apiKey)
    });

    if (!response.ok) {
      throw new Error('查询任务状态失败');
    }

    const data = await response.json();
    const task = data.data ?? data;

    if (task.status === 'completed') {
      const imageUrl = task.result?.images?.[0]?.url?.[0];
      if (!imageUrl) throw new Error('任务完成但未返回图片 URL');
      return await downloadImageAsBase64(imageUrl);
    }

    if (task.status === 'failed') {
      throw new Error(task.error?.message || '图片生成失败');
    }

    // pending / processing → 继续等
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }

  throw new Error('图片生成超时（超过 2 分钟）');
}

// 下载图片 URL 转 base64
async function downloadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
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

// 生成单张图片（提交 + 轮询）
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

  const taskId = await submitImageTask(prompt, apiKey, imageModel, aspectRatio);
  const data = await pollTaskResult(taskId, apiKey);

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

      const taskId = await submitImageTask(prompt, apiKey, imageModel, aspectRatio);
      const data = await pollTaskResult(taskId, apiKey);
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
