import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  Library,
  Plug,
  KeyRound,
  FileClock,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appCount: number;
  byokCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  appCount,
  byokCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: LayoutDashboard,
      count: appCount,
    },
    {
      id: 'studio',
      label: 'AIスタジオ',
      icon: Sparkles,
    },
    {
      id: 'workflow',
      label: 'ビジュアルワークフロー',
      icon: GitFork,
    },
    {
      id: 'templates',
      label: 'テンプレート',
      icon: Library,
      count: 12,
    },
    {
      id: 'integrations',
      label: '外部サービス連携',
      icon: Plug,
    },
    {
      id: 'byok',
      label: 'BYOK・APIキー管理',
      icon: KeyRound,
      count: byokCount,
    },
    {
      id: 'logs',
      label: '実行ログ・分析',
      icon: FileClock,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full py-4">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div className="px-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-slate-400 tracking-wider">
              ワークスペース
            </p>
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate text-sm md:text-xs">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-500">Dify Studio v1.2</p>
        <p>マルチプロバイダーBYOK対応</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] flex-col justify-between">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          />
          {/* Drawer panel */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
