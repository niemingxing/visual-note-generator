import { Link, useLocation } from 'react-router-dom';
import { Settings, FileText } from 'lucide-react';
import { cn } from '../../utils';
import { useSettingsStore } from '../../stores';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Gemini',
  volcengine: '火山方舟',
  apimart: 'APIMart'
};

export function Navbar() {
  const location = useLocation();
  const { provider } = useSettingsStore();

  const navItems = [
    { path: '/', label: '工作台', icon: FileText },
    { path: '/settings', label: '设置', icon: Settings }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl">📝</span>
          <span className="font-bold text-lg">Visual Note Generator</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* 当前服务商指示器 */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            {PROVIDER_LABELS[provider] ?? provider}
          </span>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
