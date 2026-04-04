import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useSettingsStore } from '../stores';
import { QuickConfigBar } from '../components/workbench/QuickConfigBar';
import { DocumentUploader } from '../components/workbench/DocumentUploader';
import { PromptGuide } from '../components/workbench/PromptGuide';
import { SectionList } from '../components/workbench/SectionList';
import { PreviewPanel } from '../components/workbench/PreviewPanel';
import { useContentStore } from '../stores';
import { generateImages } from '../services/geminiApi';
import { Button } from '../components/ui/button';

export function Workbench() {
  const navigate = useNavigate();
  const { apiKey } = useSettingsStore();
  const { sections, setSections, markdown, setMarkdown, promptGuide } = useContentStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  useEffect(() => {
    // 检查是否是首次使用（没有 API 密钥）
    if (!apiKey) {
      setShowWelcome(true);
    }
  }, [apiKey]);

  const handleContentLoad = (content: string) => {
    setMarkdown(content);
  };

  const handleGenerate = async () => {
    // 在 PreviewPanel 中处理
  };

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
              立即配置 API 密钥
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
              {/* 文档上传 */}
              <DocumentUploader onContentLoad={handleContentLoad} />

              {/* 提示词引导 */}
              <PromptGuide />

              {/* 内容预览（可折叠） */}
              {markdown && (
                <details className="border rounded-xl bg-card overflow-hidden group">
                  <summary className="px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors flex items-center justify-between font-medium">
                    <span>📖 内容预览 ({markdown.length} 字符)</span>
                    <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="max-h-48 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap">
                      {markdown.slice(0, 1000)}
                      {markdown.length > 1000 && '...'}
                    </div>
                  </div>
                </details>
              )}
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
                    <ChevronUp className="h-4 w-4" />
                    展开预览区
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
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
