import { useCallback, useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { DocumentParser } from '../../services/documentParser';
import { formatFileSize } from '../../utils';
import { cn } from '../../utils';

interface DocumentUploaderProps {
  onContentLoad: (content: string, metadata: { fileName: string; fileType: string; fileSize: number }) => void;
}

export function DocumentUploader({ onContentLoad }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFile, setLoadedFile] = useState<{ name: string; size: number; type: string } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!DocumentParser.isSupported(file.name)) {
      setError('不支持的文件格式，请上传 PDF、Markdown 或 TXT 文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await DocumentParser.parse(file);
      onContentLoad(result.content, {
        fileName: result.metadata.fileName,
        fileType: result.metadata.fileType,
        fileSize: result.metadata.fileSize
      });
      setLoadedFile({
        name: result.metadata.fileName,
        size: result.metadata.fileSize,
        type: result.metadata.fileType
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [onContentLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClear = () => {
    setLoadedFile(null);
  };

  const handleAreaClick = useCallback(() => {
    document.getElementById('file-input')?.click();
  }, []);

  if (loadedFile) {
    return (
      <div className="border rounded-xl p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{loadedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(loadedFile.size)} · 已加载
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="清除"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 拖拽上传区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleAreaClick}
        className={cn(
          'border-2 border-dashed rounded-xl px-4 py-3 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <div className="flex items-center justify-center gap-3">
          <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            点击或拖拽文件到此处 · 支持 PDF、Markdown、TXT
          </p>
          <input
            id="file-input"
            type="file"
            onChange={handleFileInput}
            className="hidden"
            accept=".pdf,.md,.markdown,.txt"
          />
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>正在解析文档...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive py-2">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
}
