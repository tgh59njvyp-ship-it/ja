import React from 'react';
import { Sparkles, Key, Plus, Download, Upload } from 'lucide-react';
import { BYOKCredential } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  byokList: Record<string, BYOKCredential>;
  onNewApp: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  byokList,
  onNewApp,
  onExport,
  onImport,
  onToggleMobileMenu,
}) => {
  const activeKeyCount = Object.values(byokList).filter(
    (b) => b.apiKey && (b.status === 'valid' || b.status === 'untested')
  ).length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-2.5 md:py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Single text element wordmark + mobile hamburger */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="メニューを開く"
        >
          <span className="text-xl">☰</span>
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="text-base md:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-sm shadow-sm">
            ✦
          </span>
          <span>Dify Studio</span>
        </a>
        <span className="text-xs text-slate-400 font-normal hidden lg:inline">
          · AI Platform
        </span>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          ダッシュボード
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'studio' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          スタジオ
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'workflow' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          ワークフロー
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'templates' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          テンプレート
        </button>
        <button
          onClick={() => setActiveTab('byok')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'byok' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>BYOK設定</span>
          {activeKeyCount > 0 && (
            <span className="text-xs font-mono tabular-nums text-slate-500">
              ({activeKeyCount})
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExport}
          title="ワークスペース設定を書き出し"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap min-h-[38px]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>エクスポート</span>
        </button>
        <button
          onClick={onImport}
          title="ワークスペース設定を読み込み"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap min-h-[38px]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>インポート</span>
        </button>
        <button
          onClick={onNewApp}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>作成する</span>
        </button>
      </div>
    </header>
  );
};
