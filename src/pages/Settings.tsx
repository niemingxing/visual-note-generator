import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../stores';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { validateApiKey } from '../services/geminiApi';
import { cn } from '../utils';

export function Settings() {
  const { apiKey, setApiKey, clearApiKey } = useSettingsStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    if (apiKey) {
      setIsValid(true);
    }
  }, [apiKey]);

  const handleValidate = async () => {
    if (!inputKey.trim()) return;

    setIsValidating(true);
    setIsValid(null);

    const valid = await validateApiKey(inputKey.trim());
    setIsValid(valid);

    if (valid) {
      setApiKey(inputKey.trim());
    }

    setIsValidating(false);
  };

  const handleSave = () => {
    setApiKey(inputKey.trim());
    window.history.back();
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setIsValid(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* 返回按钮 */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回工作台
        </Link>

        {/* 页面标题 */}
        <h1 className="text-3xl font-bold mb-8">设置</h1>

        {/* API 密钥配置 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API 密钥配置</CardTitle>
            <CardDescription>
              配置 Google Gemini API 密钥以使用视觉笔记生成功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Gemini API 密钥</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="输入您的 API 密钥"
                    className={cn(
                      isValid === false && 'border-destructive',
                      isValid === true && 'border-green-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleValidate}
                  disabled={!inputKey.trim() || isValidating}
                  variant="outline"
                >
                  {isValidating ? '验证中...' : '验证'}
                </Button>
              </div>

              {/* 验证状态 */}
              {isValid === true && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>密钥已配置有效</span>
                </div>
              )}
              {isValid === false && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>密钥验证失败，请检查后重试</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!inputKey.trim()} className="flex-1">
                保存并返回工作台
              </Button>
              {apiKey && (
                <Button onClick={handleClear} variant="outline">
                  清除密钥
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 帮助卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>如何获取 API 密钥？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>访问 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>使用 Google 账号登录</li>
              <li>点击 "Create API Key" 创建新的 API 密钥</li>
              <li>复制密钥并粘贴到上方输入框</li>
            </ol>
          </CardContent>
        </Card>

        {/* 说明卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• API 密钥仅存储在您的浏览器本地，不会上传到任何服务器</p>
            <p>• 请妥善保管您的密钥，不要分享给他人</p>
            <p>• 免费账户有使用限额，请合理使用</p>
            <p>• 如遇问题，请检查网络连接和 API 密钥是否正确</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
