import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../stores';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { validateApiKey as validateGeminiKey } from '../services/geminiApi';
import { validateApiKey as validateVolcengineKey } from '../services/volcengineApi';
import { validateApiKey as validateApimartKey } from '../services/apimartApi';
import { cn } from '../utils';
import type { ModelProvider } from '../types';

export function Settings() {
  const {
    provider, apiKey, volcengineApiKey, volcengineChatModel, volcengineImageModel,
    apimartApiKey, apimartChatModel, apimartImageModel,
    setProvider, setApiKey, setVolcengineApiKey, setVolcengineChatModel, setVolcengineImageModel,
    setApimartApiKey, setApimartChatModel, setApimartImageModel, clearApiKey
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<ModelProvider>(provider);

  // Google 状态
  const [googleKey, setGoogleKey] = useState(apiKey);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [googleValidating, setGoogleValidating] = useState(false);
  const [googleValid, setGoogleValid] = useState<boolean | null>(apiKey ? true : null);

  // 火山方舟状态
  const [volKey, setVolKey] = useState(volcengineApiKey);
  const [volChatModel, setVolChatModel] = useState(volcengineChatModel);
  const [volImageModel, setVolImageModel] = useState(volcengineImageModel);
  const [showVolKey, setShowVolKey] = useState(false);
  const [volValidating, setVolValidating] = useState(false);
  const [volValid, setVolValid] = useState<boolean | null>(volcengineApiKey ? true : null);

  // APIMart 状态
  const [amKey, setAmKey] = useState(apimartApiKey);
  const [amChatModel, setAmChatModel] = useState(apimartChatModel);
  const [amImageModel, setAmImageModel] = useState(apimartImageModel);
  const [showAmKey, setShowAmKey] = useState(false);
  const [amValidating, setAmValidating] = useState(false);
  const [amValid, setAmValid] = useState<boolean | null>(apimartApiKey ? true : null);

  useEffect(() => {
    setGoogleKey(apiKey);
    setVolKey(volcengineApiKey);
    setVolChatModel(volcengineChatModel);
    setVolImageModel(volcengineImageModel);
    setAmKey(apimartApiKey);
    setAmChatModel(apimartChatModel);
    setAmImageModel(apimartImageModel);
  }, [apiKey, volcengineApiKey, volcengineChatModel, volcengineImageModel, apimartApiKey, apimartChatModel, apimartImageModel]);

  const handleTabChange = (tab: ModelProvider) => {
    setActiveTab(tab);
    setProvider(tab);
  };

  // Google: 验证
  const handleGoogleValidate = async () => {
    if (!googleKey.trim()) return;
    setGoogleValidating(true);
    setGoogleValid(null);
    const valid = await validateGeminiKey(googleKey.trim());
    setGoogleValid(valid);
    if (valid) setApiKey(googleKey.trim());
    setGoogleValidating(false);
  };

  const handleGoogleSave = () => {
    setApiKey(googleKey.trim());
    window.history.back();
  };

  // 火山方舟: 验证
  const handleVolValidate = async () => {
    if (!volKey.trim() || !volChatModel.trim()) return;
    setVolValidating(true);
    setVolValid(null);
    const valid = await validateVolcengineKey(volKey.trim(), volChatModel.trim());
    setVolValid(valid);
    if (valid) {
      setVolcengineApiKey(volKey.trim());
      setVolcengineChatModel(volChatModel.trim());
      setVolcengineImageModel(volImageModel.trim() || 'doubao-seedream-4-5-251128');
    }
    setVolValidating(false);
  };

  const handleVolSave = () => {
    setVolcengineApiKey(volKey.trim());
    setVolcengineChatModel(volChatModel.trim());
    setVolcengineImageModel(volImageModel.trim() || 'doubao-seedream-4-5-251128');
    window.history.back();
  };

  // APIMart: 验证
  const handleAmValidate = async () => {
    if (!amKey.trim() || !amChatModel.trim()) return;
    setAmValidating(true);
    setAmValid(null);
    const valid = await validateApimartKey(amKey.trim(), amChatModel.trim());
    setAmValid(valid);
    if (valid) {
      setApimartApiKey(amKey.trim());
      setApimartChatModel(amChatModel.trim());
      setApimartImageModel(amImageModel.trim() || 'gpt-image-2');
    }
    setAmValidating(false);
  };

  const handleAmSave = () => {
    setApimartApiKey(amKey.trim());
    setApimartChatModel(amChatModel.trim());
    setApimartImageModel(amImageModel.trim() || 'gpt-image-2');
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回工作台
        </Link>

        <h1 className="text-3xl font-bold mb-8">设置</h1>

        {/* Provider 切换 Tab */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
          {([
            ['google', 'Google Gemini'],
            ['volcengine', '火山方舟'],
            ['apimart', 'APIMart'],
          ] as [ModelProvider, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Google Gemini 配置 */}
        {activeTab === 'google' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Google Gemini API 配置</CardTitle>
                <CardDescription>
                  配置 Google Gemini API 密钥以使用视觉笔记生成功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API 密钥</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showGoogleKey ? 'text' : 'password'}
                        value={googleKey}
                        onChange={(e) => setGoogleKey(e.target.value)}
                        placeholder="输入您的 Gemini API 密钥"
                        className={cn(
                          googleValid === false && 'border-destructive',
                          googleValid === true && 'border-green-500'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGoogleKey(!showGoogleKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showGoogleKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      onClick={handleGoogleValidate}
                      disabled={!googleKey.trim() || googleValidating}
                      variant="outline"
                    >
                      {googleValidating ? '验证中...' : '验证'}
                    </Button>
                  </div>

                  {googleValid === true && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>密钥已配置有效</span>
                    </div>
                  )}
                  {googleValid === false && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>密钥验证失败，请检查后重试</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleGoogleSave} disabled={!googleKey.trim()} className="flex-1">
                    保存并返回工作台
                  </Button>
                  {apiKey && (
                    <Button onClick={() => { clearApiKey(); setGoogleKey(''); setGoogleValid(null); }} variant="outline">
                      清除密钥
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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
          </>
        )}

        {/* 火山方舟配置 */}
        {activeTab === 'volcengine' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>火山方舟 API 配置</CardTitle>
                <CardDescription>
                  配置火山方舟（Ark）API 密钥及模型信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API 密钥</label>
                  <div className="relative">
                    <Input
                      type={showVolKey ? 'text' : 'password'}
                      value={volKey}
                      onChange={(e) => setVolKey(e.target.value)}
                      placeholder="ak-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className={cn(
                        volValid === false && 'border-destructive',
                        volValid === true && 'border-green-500'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVolKey(!showVolKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showVolKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">对话模型名称</label>
                  <Input
                    value={volChatModel}
                    onChange={(e) => setVolChatModel(e.target.value)}
                    placeholder="如：doubao-seed-2-0-pro-260215 或 ep-xxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    填写在火山方舟控制台创建的 Endpoint ID（ep- 开头）或直接填写模型名称
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">图片生成模型名称</label>
                  <Input
                    value={volImageModel}
                    onChange={(e) => setVolImageModel(e.target.value)}
                    placeholder="如：doubao-seedream-4-5-251128"
                  />
                  <p className="text-xs text-muted-foreground">
                    推荐：doubao-seedream-4-5-251128 / doubao-seedream-3-0
                  </p>
                </div>

                {volValid === true && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>配置验证成功</span>
                  </div>
                )}
                {volValid === false && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>验证失败，请检查 API 密钥和对话模型名称</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleVolValidate}
                    disabled={!volKey.trim() || !volChatModel.trim() || volValidating}
                    variant="outline"
                  >
                    {volValidating ? '验证中...' : '验证'}
                  </Button>
                  <Button
                    onClick={handleVolSave}
                    disabled={!volKey.trim() || !volChatModel.trim()}
                    className="flex-1"
                  >
                    保存并返回工作台
                  </Button>
                  {volcengineApiKey && (
                    <Button onClick={() => { clearApiKey(); setVolKey(''); setVolValid(null); }} variant="outline">
                      清除
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>如何获取火山方舟 API 密钥？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>访问 <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">火山方舟控制台</a></li>
                  <li>在左侧导航栏选择「API Key 管理」</li>
                  <li>点击「创建 API Key」并复制</li>
                  <li>在「模型推理」中创建推理接入点（Endpoint），获取 ep- 开头的 Endpoint ID 用于对话模型</li>
                  <li>图片生成模型直接填写模型名称即可（无需 Endpoint）</li>
                </ol>
              </CardContent>
            </Card>
          </>
        )}

        {/* APIMart 配置 */}
        {activeTab === 'apimart' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>APIMart API 配置</CardTitle>
                <CardDescription>
                  配置 APIMart API 密钥，支持 GPT、Claude、Gemini 等多种模型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API 密钥</label>
                  <div className="relative">
                    <Input
                      type={showAmKey ? 'text' : 'password'}
                      value={amKey}
                      onChange={(e) => setAmKey(e.target.value)}
                      placeholder="输入您的 APIMart API Key"
                      className={cn(
                        amValid === false && 'border-destructive',
                        amValid === true && 'border-green-500'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAmKey(!showAmKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showAmKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">对话模型名称</label>
                  <Input
                    value={amChatModel}
                    onChange={(e) => setAmChatModel(e.target.value)}
                    placeholder="如：gpt-4o"
                  />
                  <p className="text-xs text-muted-foreground">
                    支持：gpt-4o / gpt-5 / claude-sonnet-4-5-20250929 / gemini-2.5-flash / deepseek-v3.1-250821 等
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">图片生成模型名称</label>
                  <Input
                    value={amImageModel}
                    onChange={(e) => setAmImageModel(e.target.value)}
                    placeholder="如：gpt-image-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    图片生成为异步模式，提交后需等待 30-60 秒出图
                  </p>
                </div>

                {amValid === true && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>配置验证成功</span>
                  </div>
                )}
                {amValid === false && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>验证失败，请检查 API 密钥和对话模型名称</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAmValidate}
                    disabled={!amKey.trim() || !amChatModel.trim() || amValidating}
                    variant="outline"
                  >
                    {amValidating ? '验证中...' : '验证'}
                  </Button>
                  <Button
                    onClick={handleAmSave}
                    disabled={!amKey.trim() || !amChatModel.trim()}
                    className="flex-1"
                  >
                    保存并返回工作台
                  </Button>
                  {apimartApiKey && (
                    <Button onClick={() => { clearApiKey(); setAmKey(''); setAmValid(null); }} variant="outline">
                      清除
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>如何获取 APIMart API 密钥？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>访问 <a href="https://apimart.ai/register?aff=eyL8" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">APIMart 注册页面</a></li>
                  <li>注册并登录账号</li>
                  <li>创建新的 API Key 并复制</li>
                  <li>对话模型和图片模型可使用默认值，也可自行更换</li>
                </ol>
              </CardContent>
            </Card>
          </>
        )}

        {/* 通用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• API 密钥仅存储在您的浏览器本地，不会上传到任何服务器</p>
            <p>• 请妥善保管您的密钥，不要分享给他人</p>
            <p>• 切换模型提供商后，工作台将自动使用新的模型</p>
            <p>• 如遇问题，请检查网络连接和 API 密钥是否正确</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
