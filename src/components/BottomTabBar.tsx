import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  Library,
  KeyRound,
  Menu,
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  byokCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  byokCount,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'ホーム', icon: LayoutDashboard },
    { id: 'studio', label: 'スタジオ', icon: Sparkles },
    { id: 'workflow', label: 'フロー', icon: GitFork },
    { id: 'templates', label: 'テンプレ', icon: Library },
    { id: 'byok', label: 'BYOK', icon: KeyRound, count: byokCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 flex items-center justify-around h-16 shadow-lg shadow-slate-900/5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] py-1 transition-all relative ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-mono bg-blue-100 text-blue-700 px-1 py-0.2 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Button for secondary items (Integrations, Logs) */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] py-1 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-1">メニュー</span>
      </button>
    </nav>
  );
};
