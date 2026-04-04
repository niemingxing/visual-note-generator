import type { StyleType, AspectRatioType, VisualType, BrandInfo } from '../types.ts';
import { STYLES } from '../constants';

// 视觉布局引导
function getVisualLayout(visualType: VisualType): string {
  const layouts: Record<VisualType, string> = {
    list: `=== VISUAL LAYOUT: NUMBERED LIST ===
Clean numbered list with icons. Each item: number + icon + title + brief text.
Use visual hierarchy with size and color.`,
    process: `=== VISUAL LAYOUT: PROCESS FLOW ===
Circular or linear flow diagram. Each step in a box/card connected by arrows.
Number steps clearly. Include key action for each step.`,
    diagram: `=== VISUAL LAYOUT: DIAGRAM ===
Central concept in middle. Related concepts branching out.
Use connecting lines with labels. Include key relationships.`,
    comparison: `=== VISUAL LAYOUT: COMPARISON ===
Split view with two columns. Left side: Topic A | Right side: Topic B.
VS badge in center. Each side has 3-4 key points with icons.`,
    timeline: `=== VISUAL LAYOUT: TIMELINE ===
Horizontal or vertical timeline with key events. Use arrow connectors between events.
Each event: label + title + brief description.`,
    other: `=== VISUAL LAYOUT: FLEXIBLE ===
Organize content visually with clear visual hierarchy, grouped related items,
visual connectors between concepts, and icons for key concepts.`
  };
  return layouts[visualType];
}

// 构建图片生成 Prompt
export function buildImagePrompt(
  content: string,
  style: StyleType,
  aspectRatio: AspectRatioType,
  brand: BrandInfo,
  title: string,
  visualType: VisualType
): string {
  const stylePrompt = STYLES[style].prompt;
  const visualLayout = getVisualLayout(visualType);

  // 根据宽高比确定方向
  const [w, h] = aspectRatio.split(':').map(Number);
  const orientation = w > h ? 'HORIZONTAL' : w < h ? 'VERTICAL' : 'SQUARE';

  let prompt = `${stylePrompt.trim()}

${orientation} INFOGRAPHIC (${aspectRatio} aspect ratio)

${visualLayout}

`;

  // 头部
  if (brand.name || title) {
    prompt += `=== HEADER ===
`;
    if (brand.name) {
      prompt += `Top left: Large bold text "${brand.name}"`;
      if (brand.tagline) {
        prompt += ` with subtitle "${brand.tagline}"`;
      }
      prompt += '\n';
    }
    if (title) {
      prompt += `Title: "${title}"\n`;
    }
    prompt += 'Add small doodle decorations around header\n\n';
  }

  // 内容
  prompt += `=== CONTENT ===
${content}

`;

  // 底部
  if (brand.name) {
    prompt += `=== FOOTER ===
At the bottom: A horizontal banner with "${brand.name}"`;
    if (brand.tagline) {
      prompt += ` | ${brand.tagline}`;
    }
    if (brand.instructor) {
      prompt += `\nSmall text: "讲师: ${brand.instructor}"`;
    }
    prompt += '\nAdd small doodle decorations at bottom\n';
  }

  return prompt.trim();
}

// 构建 AI 分析 Prompt
export function buildAnalysisPrompt(content: string, userPrompt: string): string {
  return `你是一个专业的内容分析师，负责将文档内容转换为视觉笔记的结构化数据。

${userPrompt ? `用户要求: ${userPrompt}\n` : ''}

请分析以下文档内容，提取出适合制作视觉笔记的核心内容段。

要求:
1. 每个段落聚焦一个核心概念或主题
2. 用简洁清晰的中文总结（3-8句话）
3. 保留关键的公式、模型、步骤
4. 总共生成 4-8 个段落
5. 返回 JSON 格式

文档内容:
"""
${content}
"""

请返回以下 JSON 格式（不要添加任何其他文字）:
{
  "sections": [
    {
      "title": "段落标题",
      "content": "段落内容（简洁总结）",
      "visual_type": "list|process|diagram|comparison|timeline"
    }
  ]
}`;
}
