import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Maximize2, Minimize2, Upload, Check, X } from 'lucide-react';
import { useSettingsStore } from '../stores';
import { QuickConfigBar } from '../components/workbench/QuickConfigBar';
import { PromptGuide } from '../components/workbench/PromptGuide';
import { SectionList } from '../components/workbench/SectionList';
import { PreviewPanel } from '../components/workbench/PreviewPanel';
import { useContentStore } from '../stores';
import { Button } from '../components/ui/Button';
import { DocumentParser } from '../services/documentParser';
import { formatFileSize } from '../utils';
import { cn } from '../utils';

export function Workbench() {
  const navigate = useNavigate();
  const { provider, apiKey, volcengineApiKey, apimartApiKey } = useSettingsStore();
  const { sections, setSections, markdown, setMarkdown } = useContentStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loadedFile, setLoadedFile] = useState<{ name: string; size: number } | null>(null);

  const hasKey = provider === 'volcengine' ? !!volcengineApiKey : provider === 'apimart' ? !!apimartApiKey : !!apiKey;

  useEffect(() => {
    if (!hasKey) {
      setShowWelcome(true);
    }
  }, [hasKey]);

  const handleFile = useCallback(async (file: File) => {
    if (!DocumentParser.isSupported(file.name)) {
      setFileError('不支持的文件格式，请上传 PDF、Markdown 或 TXT 文件');
      return;
    }
    setFileLoading(true);
    setFileError(null);
    try {
      const result = await DocumentParser.parse(file);
      setMarkdown(result.content);
      setLoadedFile({ name: result.metadata.fileName, size: result.metadata.fileSize });
    } catch (err) {
      setFileError((err as Error).message);
    } finally {
      setFileLoading(false);
    }
  }, [setMarkdown]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  // 欢迎弹窗
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-2xl font-bold mb-2">欢迎使用 Visual Note Generator</h1>
          <p className="text-muted-foreground mb-8">
            将各类文档转换为精美的视觉笔记图片
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoToSettings}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              前往设置配置 API 密钥
            </button>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-3 px-6 border border-input rounded-lg font-medium hover:bg-accent transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 快捷配置栏 */}
      <QuickConfigBar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col container mx-auto px-4 py-6 overflow-hidden">
        {/* 上部分：文档输入 + 内容分段 */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 overflow-hidden">
          {/* 左侧：文档输入区 */}
          <div className="overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">📄 文档输入区</h2>
            </div>

            <div className="space-y-4">
              {/* 融合内容输入 + 文件上传 */}
              <div
                className={cn(
                  'border rounded-xl bg-card overflow-hidden transition-colors',
                  isDragging && 'border-primary bg-primary/5'
                )}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
              >
                <div className="px-4 py-3 font-medium flex items-center justify-between">
                  <span>📖 内容输入</span>
                  {markdown && <span className="text-xs text-muted-foreground">{markdown.length} 字符</span>}
                </div>
                <div className="px-4">
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="输入、粘贴文本内容，或拖拽文件到此处"
                    className="w-full min-h-32 max-h-48 text-sm text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                  />
                </div>
                {/* 底部工具栏 */}
                <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      上传文件
                    </button>
                    <span className="text-xs text-muted-foreground/60">PDF / Markdown / TXT</span>
                    {loadedFile && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <Check className="h-3 w-3" />
                        {loadedFile.name}
                        <span className="text-muted-foreground">({formatFileSize(loadedFile.size)})</span>
                        <button onClick={() => setLoadedFile(null)} className="hover:text-foreground ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <div>
                    {fileLoading && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        解析中...
                      </span>
                    )}
                    {fileError && (
                      <span className="text-xs text-destructive">{fileError}</span>
                    )}
                  </div>
                </div>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileInput}
                  className="hidden"
                  accept=".pdf,.md,.markdown,.txt"
                />
              </div>

              {/* 提示词引导 */}
              <PromptGuide />
            </div>
          </div>

          {/* 右侧：内容分段区 */}
          <div className="overflow-y-auto pr-2">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">📋 内容分段区</h2>
              {sections.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {sections.length} 个分段
                </span>
              )}
            </div>

            <SectionList onSectionsUpdate={setSections} />
          </div>
        </div>

        {/* 下部分：预览与结果区（可折叠） */}
        <div className={`mt-6 transition-all duration-300 ${
          previewCollapsed ? 'h-12' : 'min-h-[300px]'
        } ${previewFullscreen ? 'fixed inset-0 z-50 bg-background pt-16 px-4' : ''}`}>
          {/* 折叠/展开控制栏 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewCollapsed(!previewCollapsed)}
                className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
              >
                {previewCollapsed ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    展开预览区
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    收起预览区
                  </>
                )}
              </button>
              <span className="text-xs text-muted-foreground">生成结果预览</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewFullscreen(!previewFullscreen)}
              className="h-8"
            >
              {previewFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-1" />
                  退出全屏
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-1" />
                  全屏预览
                </>
              )}
            </Button>
          </div>

          {/* 预览内容 */}
          {!previewCollapsed && (
            <div className="h-[calc(100%-2rem)] overflow-y-auto">
              <PreviewPanel
                sections={sections}
                onSectionsUpdate={setSections}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
