import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked';
import type { ParseResult } from '../types.ts';

// 配置 PDF.js worker (使用动态导入以匹配版本)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export class DocumentParser {
  // 解析 PDF
  static async parsePDF(file: File): Promise<ParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return {
        content: fullText.trim(),
        metadata: {
          fileName: file.name,
          fileType: 'pdf',
          fileSize: file.size,
          wordCount: fullText.length
        }
      };
    } catch (error) {
      throw new Error('PDF 解析失败: ' + (error as Error).message);
    }
  }

  // 解析 Markdown
  static async parseMarkdown(file: File): Promise<ParseResult> {
    try {
      const text = await file.text();
      return {
        content: text,
        metadata: {
          fileName: file.name,
          fileType: 'markdown',
          fileSize: file.size,
          wordCount: text.length
        }
      };
    } catch (error) {
      throw new Error('Markdown 解析失败: ' + (error as Error).message);
    }
  }

  // 解析 TXT
  static async parseTXT(file: File): Promise<ParseResult> {
    try {
      const text = await file.text();
      return {
        content: text,
        metadata: {
          fileName: file.name,
          fileType: 'txt',
          fileSize: file.size,
          wordCount: text.length
        }
      };
    } catch (error) {
      throw new Error('TXT 解析失败: ' + (error as Error).message);
    }
  }

  // 统一解析入口
  static async parse(file: File): Promise<ParseResult> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return this.parsePDF(file);
      case 'md':
      case 'markdown':
        return this.parseMarkdown(file);
      case 'txt':
        return this.parseTXT(file);
      default:
        throw new Error('不支持的文件格式: ' + ext);
    }
  }

  // 检查文件格式是否支持
  static isSupported(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['pdf', 'md', 'markdown', 'txt'].includes(ext || '');
  }
}
