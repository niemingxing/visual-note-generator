import { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import type { StyleType, AspectRatioType, AdvancedSettings } from '../../types.ts';
import { STYLES, ASPECT_RATIOS } from '../../constants';
import { usePreferencesStore } from '../../stores';
import { cn } from '../../utils';

interface QuickConfigBarProps {
  onStyleChange?: (style: StyleType) => void;
  onAspectRatioChange?: (ratio: AspectRatioType) => void;
  onAdvancedChange?: (advanced: Partial<AdvancedSettings>) => void;
}

export function QuickConfigBar({
  onStyleChange,
  onAspectRatioChange,
  onAdvancedChange
}: QuickConfigBarProps) {
  const {
    style,
    aspectRatio,
    advanced,
    setStyle,
    setAspectRatio,
    setAdvanced
  } = usePreferencesStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStyleChange = (newStyle: StyleType) => {
    setStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  const handleAspectRatioChange = (newRatio: AspectRatioType) => {
    setAspectRatio(newRatio);
    onAspectRatioChange?.(newRatio);
  };

  const handleAdvancedChange = (field: keyof AdvancedSettings, value: number) => {
    setAdvanced({ [field]: value });
    onAdvancedChange?.({ [field]: value });
  };

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        {/* 快捷配置 */}
        <div className="flex flex-wrap items-center gap-6">
          {/* 风格选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">风格</span>
            <div className="flex gap-1">
              {Object.entries(STYLES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleStyleChange(key as StyleType)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    style === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  title={value.description}
                >
                  <span>{value.icon}</span>
                  <span className="hidden sm:inline">{value.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 尺寸选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">尺寸</span>
            <div className="flex gap-1">
              {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key as AspectRatioType)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    aspectRatio === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  title={`${value.name} - ${value.dimensions}`}
                >
                  {value.id}
                </button>
              ))}
            </div>
          </div>

          {/* 高级设置按钮 */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <Settings2 className="h-4 w-4" />
            高级设置
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* 高级设置面板 */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-6">
            {/* 并行任务数 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                并行任务数: {advanced.workers}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={advanced.workers}
                onChange={(e) => handleAdvancedChange('workers', Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 超时时间 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                超时时间: {advanced.timeout}秒
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={advanced.timeout}
                onChange={(e) => handleAdvancedChange('timeout', Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 重试次数 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                重试次数: {advanced.retries}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={advanced.retries}
                onChange={(e) => handleAdvancedChange('retries', Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 温度参数 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                温度参数: {advanced.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={advanced.temperature}
                onChange={(e) => handleAdvancedChange('temperature', Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
