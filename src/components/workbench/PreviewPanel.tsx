import { useState, useCallback, useEffect } from 'react';
import { Download, Loader2, Check, Sparkles, ImageIcon, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Section } from '../../types.ts';
import { useSettingsStore, usePreferencesStore, useGenerationStore } from '../../stores';
import { generateImages, downloadZip } from '../../services/geminiApi';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { downloadBase64Image } from '../../utils';
import { cn } from '../../utils';

interface PreviewPanelProps {
  sections: Section[];
  onSectionsUpdate?: (sections: Section[]) => void;
}

export function PreviewPanel({ sections }: PreviewPanelProps) {
  const { apiKey } = useSettingsStore();
  const { style, aspectRatio, brand, advanced } = usePreferencesStore();
  const {
    isGenerating,
    progress,
    images,
    error,
    setGenerating,
    setProgress,
    setImages,
    setError,
    resetGeneration
  } = useGenerationStore();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 大图查看功能
  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // 键盘导航
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('请先在设置中配置 API 密钥');
      return;
    }

    if (sections.length === 0) {
      setError('请先分析文档生成分段');
      return;
    }

    setGenerating(true);
    setError(null);
    setImages([]);
    setProgress(0);

    try {
      const results = await generateImages(
        sections,
        style,
        aspectRatio,
        brand,
        apiKey,
        advanced.workers,
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
        }
      );

      setImages(results.map((img) => ({ ...img, sectionId: img.sectionId })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (image: typeof images[0]) => {
    downloadBase64Image(image.data, image.filename);
  };

  const handleDownloadAll = async () => {
    await downloadZip(images);
  };

  const handleRegenerate = async () => {
    if (!apiKey || sections.length === 0) return;
    resetGeneration();
    await handleGenerate();
  };

  // 按分段分组图片
  const imagesBySection = sections.map(section => ({
    section,
    images: images.filter(img => img.sectionId === section.id)
  }));

  const totalImages = sections.length;
  const completedImages = images.length;

  // 根据宽高比获取 CSS 样式
  const getAspectRatioClass = (ratio: string) => {
    const ratioMap: Record<string, string> = {
      '1:1': 'aspect-square',
      '4:5': 'aspect-[4/5]',
      '3:4': 'aspect-[3/4]',
      '9:16': 'aspect-[9/16]',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]'
    };
    return ratioMap[ratio] || 'aspect-[9/16]';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">🖼️ 预览与结果</h2>
          {sections.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {sections.length} 分段 · {completedImages}/{totalImages} 图
            </span>
          )}
          {isGenerating && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse">
              生成中 {progress}%
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {images.length > 0 && !isGenerating && (
            <>
              <Button onClick={handleRegenerate} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                重新生成
              </Button>
              <Button onClick={handleDownloadAll} size="sm">
                <Download className="h-4 w-4 mr-1" />
                下载全部 ({images.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* 错误提示 */}
        {error && !isGenerating && (
          <Card className="p-3 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-destructive">⚠️ {error}</p>
          </Card>
        )}

        {/* 空状态 - 无分段 */}
        {sections.length === 0 && !isGenerating && images.length === 0 && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-xl">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">分段完成后，点击"生成图片"开始制作视觉笔记</p>
            </div>
          </div>
        )}

        {/* 生成按钮 - 有分段但无图片 */}
        {sections.length > 0 && !isGenerating && images.length === 0 && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/20">
            <div className="text-center">
              <Check className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="font-medium mb-1">分析完成！共 {sections.length} 个分段</p>
              <p className="text-sm text-muted-foreground mb-3">预计生成 {sections.length} 张图片</p>
              <Button onClick={handleGenerate} disabled={!apiKey} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                开始生成图片
              </Button>
            </div>
          </div>
        )}

        {/* 生成进度 */}
        {isGenerating && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-xl bg-muted/20">
            <div className="text-center w-64">
              <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin text-primary" />
              <p className="font-medium mb-2">生成中 {progress}%</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 图片结果网格 */}
        {images.length > 0 && !isGenerating && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative rounded-lg overflow-hidden border bg-muted ${getAspectRatioClass(aspectRatio)} hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={`data:image/png;base64,${image.data}`}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white truncate mb-1">{image.filename}</p>
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                        size="sm"
                        variant="secondary"
                        className="flex-1 h-7 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 大图查看灯箱 */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 关闭按钮 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            title="关闭 (Esc)"
          >
            <X className="h-6 w-6" />
          </button>

          {/* 上一张按钮 */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="上一张 (←)"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* 下一张按钮 */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="下一张 (→)"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* 图片容器 */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:image/png;base64,${images[currentImageIndex].data}`}
              alt={images[currentImageIndex].filename}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* 图片信息 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium truncate">{images[currentImageIndex].filename}</p>
            <p className="text-xs text-white/70">{currentImageIndex + 1} / {images.length}</p>
          </div>

          {/* 图片缩略图导航 */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 max-w-[80vw] overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    "w-12 h-16 rounded overflow-hidden border-2 flex-shrink-0 transition-all",
                    index === currentImageIndex
                      ? "border-white scale-110"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={`data:image/png;base64,${img.data}`}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
