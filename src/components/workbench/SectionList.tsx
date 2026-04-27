import { Edit, Trash2, ChevronDown, ChevronRight, Sparkles, Loader2, X, Wand2, Check } from 'lucide-react';
import type { Section } from '../../types.ts';
import { useContentStore, useGenerationStore, useSettingsStore, usePreferencesStore } from '../../stores';
import { analyzeContent, generateSingleImage } from '../../services/api';
import { buildImagePrompt } from '../../services/promptBuilder';
import { cn } from '../../utils';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface SectionListProps {
  onSectionsUpdate?: (sections: Section[]) => void;
}

export function SectionList({ onSectionsUpdate }: SectionListProps) {
  const { sections, updateSection, removeSection, markdown, promptGuide } = useContentStore();
  const { images, addImage, error, setError } = useGenerationStore();
  const { provider, apiKey, volcengineApiKey, apimartApiKey } = useSettingsStore();
  const activeApiKey = provider === 'volcengine' ? volcengineApiKey : provider === 'apimart' ? apimartApiKey : apiKey;
  const { style, aspectRatio, brand } = usePreferencesStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPrompts, setEditPrompts] = useState<string[]>([]);

  const visualTypeLabels: Record<string, string> = {
    list: '列表',
    process: '流程',
    diagram: '图解',
    comparison: '对比',
    timeline: '时间线',
    other: '其他'
  };

  const visualTypeIcons: Record<string, string> = {
    list: '📋',
    process: '🔄',
    diagram: '📊',
    comparison: '⚖️',
    timeline: '📅',
    other: '📝'
  };

  const toggleExpand = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSectionImages = (sectionId: string) => {
    return images.filter(img => img.sectionId === sectionId);
  };

  const handleAnalyze = async () => {
    if (!markdown || !activeApiKey) {
      setError('请先上传文档并配置 API 密钥');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const newSections = await analyzeContent(markdown, promptGuide, activeApiKey);
      onSectionsUpdate?.(newSections);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const openEditDialog = (section: Section) => {
    setEditingSection(section);
    setEditTitle(section.title);
    setEditContent(section.content);
    setEditPrompts(section.imagePrompts || ['']);
  };

  const closeEditDialog = () => {
    setEditingSection(null);
    setEditTitle('');
    setEditContent('');
    setEditPrompts(['']);
  };

  const saveEdit = () => {
    if (!editingSection) return;
    updateSection(editingSection.id, {
      title: editTitle,
      content: editContent,
      imagePrompts: editPrompts[0] ? [editPrompts[0]] : undefined
    });
    closeEditDialog();
  };

  // 生成单个分段的图片
  const handleGenerateSingle = async (section: Section) => {
    if (!activeApiKey) {
      setError('请先在设置中配置 API 密钥');
      return;
    }

    // 检查是否已经有图片了
    const existingImage = images.find(img => img.sectionId === section.id);
    if (existingImage) {
      // 重新生成，删除旧图片（这里简化处理，直接添加新的）
    }

    setGeneratingSectionId(section.id);
    setError(null);

    try {
      const result = await generateSingleImage(
        section,
        style,
        aspectRatio,
        brand,
        activeApiKey
      );
      addImage(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGeneratingSectionId(null);
    }
  };

  // 重新生成该分段图片
  const handleRegenerateSingle = async (section: Section) => {
    if (!activeApiKey) return;

    setGeneratingSectionId(section.id);
    setError(null);

    try {
      const result = await generateSingleImage(
        section,
        style,
        aspectRatio,
        brand,
        activeApiKey
      );
      // 移除旧图片，添加新图片
      // 这里简化处理，直接添加新图片
      addImage(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGeneratingSectionId(null);
    }
  };

  return (
    <div className="space-y-3">
      {sections.length === 0 ? (
        <div className="border rounded-xl p-6 bg-card">
          {markdown ? (
            // 有文档但未分段
            <div className="text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
              <p className="font-medium mb-1">文档已就绪 ({markdown.length} 字符)</p>
              <p className="text-sm text-muted-foreground mb-4">
                点击下方按钮开始 AI 分析，自动分段并生成图片提示词
              </p>
              {promptGuide && (
                <p className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded max-w-md mx-auto">
                  提示词引导：{promptGuide.slice(0, 50)}...
                </p>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={!activeApiKey || analyzing}
                size="sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
            </div>
          ) : (
            // 无文档
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-muted-foreground">
                在左侧上传文档后，AI 将自动分析并分段生成视觉笔记
              </p>
            </div>
          )}
          {/* 错误提示 */}
          {error && !analyzing && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">⚠️ {error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionImages = getSectionImages(section.id);

            return (
              <div
                key={section.id}
                className="border rounded-xl bg-card overflow-hidden"
              >
                {/* 分段标题行 */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                    isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
                  )}
                  onClick={() => toggleExpand(section.id)}
                >
                  <button className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{visualTypeIcons[section.visualType] || '📝'}</span>
                      <p className="text-sm font-medium truncate">{section.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sectionImages.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Check className="h-3 w-3" />
                        已生成
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {visualTypeLabels[section.visualType] || '其他'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(section);
                      }}
                      className="p-1.5 hover:bg-background rounded transition-colors"
                      title="编辑"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="p-1.5 hover:bg-background rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                {/* 展开的详情内容 */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-3 max-h-24 overflow-y-auto">
                      {section.content}
                    </p>

                    {/* 实际图片提示词 */}
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1 text-muted-foreground">
                        图片提示词 {section.imagePrompts?.[0] ? '(手动)' : '(自动)'}：
                      </p>
                      <div className="text-xs bg-muted/50 rounded px-2 py-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {section.imagePrompts?.[0] || buildImagePrompt(
                          section.content,
                          style,
                          aspectRatio,
                          brand,
                          section.title,
                          section.visualType
                        )}
                      </div>
                    </div>

                    {/* 生成按钮区 */}
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {sectionImages.length > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Check className="h-3 w-3" />
                            <span>图片已生成</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            尚未生成图片
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {generatingSectionId === section.id ? (
                          <Button size="sm" variant="outline" disabled className="h-7">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            生成中...
                          </Button>
                        ) : sectionImages.length > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegenerateSingle(section)}
                            className="h-7"
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            重新生成
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleGenerateSingle(section)}
                            className="h-7"
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            生成图片
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">编辑分段</h3>
              <button
                onClick={closeEditDialog}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 标题编辑 */}
              <div>
                <label className="text-sm font-medium mb-1 block">标题</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入分段标题"
                />
              </div>

              {/* 内容编辑 */}
              <div>
                <label className="text-sm font-medium mb-1 block">内容</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
                  placeholder="输入分段内容"
                />
              </div>

              {/* 图片提示词编辑 */}
              <div>
                <label className="text-sm font-medium mb-1 block">图片提示词</label>
                <input
                  type="text"
                  value={editPrompts[0] || ''}
                  onChange={(e) => setEditPrompts([e.target.value])}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入图片生成提示词（留空则自动生成）"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  每个分段将生成 1 张图片
                </p>
              </div>
            </div>

            {/* 操作栏 */}
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
              <Button
                onClick={closeEditDialog}
                variant="outline"
                size="sm"
              >
                取消
              </Button>
              <Button
                onClick={saveEdit}
                size="sm"
                disabled={!editTitle.trim()}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
