import { useState } from 'react';
import { Lightbulb, X, Sparkles } from 'lucide-react';
import { PROMPT_TEMPLATES } from '../../constants';
import { useContentStore } from '../../stores';
import { cn } from '../../utils';

export function PromptGuide() {
  const { promptGuide, setPromptGuide } = useContentStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'extract', name: '提取类', icon: '🎯' },
    { id: 'process', name: '处理类', icon: '✂️' },
    { id: 'scenario', name: '场景类', icon: '📱' },
    { id: 'format', name: '格式类', icon: '📊' }
  ];

  const handleApplyTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPromptGuide(template.prompt);
    setSelectedTemplate(template.id);
    setTimeout(() => setSelectedTemplate(null), 1000);
  };

  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="font-medium">提示词引导（可选）</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        告诉 AI 如何分析和生成视觉笔记，让结果更符合您的需求。
      </p>

      {/* 提示词输入框 */}
      <div className="relative">
        <textarea
          value={promptGuide}
          onChange={(e) => setPromptGuide(e.target.value)}
          placeholder="例如: 提取文档中的核心观点和关键方法论，用简洁的语言总结..."
          className={cn(
            'w-full min-h-[80px] p-3 pr-10 rounded-lg border border-input bg-background',
            'text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring',
            selectedTemplate && 'ring-2 ring-green-500'
          )}
        />
        {promptGuide && (
          <button
            onClick={() => setPromptGuide('')}
            className="absolute right-2 top-2 p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* 快捷模板 */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">快捷模板</span>
        </div>

        <div className="space-y-3">
          {categories.map((category) => {
            const templates = PROMPT_TEMPLATES.filter((t) => t.category === category.id);
            return (
              <div key={category.id}>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {category.icon} {category.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                        'bg-muted hover:bg-muted/80',
                        selectedTemplate === template.id && 'bg-green-100 text-green-700'
                      )}
                      title={template.prompt}
                    >
                      <span>{template.icon}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
