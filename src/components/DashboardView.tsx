import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Play,
  Edit,
  Copy,
  Trash2,
  Globe,
  Clock,
  Layers,
  Search,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  GitFork,
  MessageSquare,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AIApp, BYOKCredential } from '../types';

interface DashboardViewProps {
  apps: AIApp[];
  byokList: Record<string, BYOKCredential>;
  onOpenStudio: (app: AIApp) => void;
  onOpenWorkflow: (app: AIApp) => void;
  onTestChat: (app: AIApp) => void;
  onDuplicateApp: (id: string) => void;
  onDeleteApp: (id: string) => void;
  onOpenPublish: (app: AIApp) => void;
  onOpenQuickCreate: () => void;
  onOpenTemplates: () => void;
  onNewEmptyApp: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  apps,
  byokList,
  onOpenStudio,
  onOpenWorkflow,
  onTestChat,
  onDuplicateApp,
  onDeleteApp,
  onOpenPublish,
  onOpenQuickCreate,
  onOpenTemplates,
  onNewEmptyApp,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPromptInput, setQuickPromptInput] = useState('');

  // Calculations
  const totalRuns = apps.reduce((acc, a) => acc + (a.executionCount || 0), 0);
  const activeKeysCount = Object.values(byokList).filter(
    (b) => b.apiKey && (b.status === 'valid' || b.status === 'untested')
  ).length;

  const filteredApps = apps.filter((app) => {
    if (filterType !== 'all') {
      if (filterType === 'published' && !app.isPublished) return false;
      if (filterType !== 'published' && app.type !== filterType) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.modelId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return <GitFork className="w-4 h-4 text-purple-600" />;
      case 'agent':
        return <Database className="w-4 h-4 text-emerald-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Quick Create Hero */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              AIアプリケーション・スタジオ
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              プロンプト、ナレッジ、マルチモデル、ワークフローを自由に組み合わせて独自のAIを構築・公開。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTemplates}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              テンプレートから作成
            </button>
            <button
              onClick={onNewEmptyApp}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ゼロから新規作成</span>
            </button>
          </div>
        </div>

        {/* Quick natural language input bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Sparkles className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={quickPromptInput}
              onChange={(e) => setQuickPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickPromptInput.trim()) {
                  onOpenQuickCreate();
                }
              }}
              placeholder="かんたん作成: 作り方のアイデアを入力（例:『商品の返品ポリシーを案内する接客ボットを作りたい』）"
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onOpenQuickCreate}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>AI構成を自動生成</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">総AIアプリ数</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {apps.length}
            </span>
            <span className="text-xs text-slate-400">件</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">累計実行回数</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalRuns}
            </span>
            <span className="text-xs text-slate-400">回</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">平均応答時間</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              420
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">接続中BYOK</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {activeKeysCount}
            </span>
            <span className="text-xs text-slate-400">/ 8 社</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'chat', label: 'チャット型' },
            { id: 'workflow', label: 'ワークフロー' },
            { id: 'agent', label: 'エージェント' },
            { id: 'published', label: '公開中' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="アプリを検索..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">アプリが見つかりません</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            条件に一致するAIアプリがありません。「テンプレートから作成」または「ゼロから新規作成」をお試しください。
          </p>
          <button
            onClick={onOpenTemplates}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-xs"
          >
            テンプレート一覧を見る
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getIcon(app.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {app.name}
                      </h3>
                      {/* Zero-Pill metadata discipline */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="capitalize">{app.provider}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[120px]">{app.modelId}</span>
                      </div>
                    </div>
                  </div>

                  {app.isPublished && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>公開中</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {app.description || '説明なし'}
                </p>

                {/* Meta stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pb-3 border-b border-slate-100 font-mono tabular-nums">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3 text-slate-400" />
                    <span>{app.executionCount || 0}回 実行</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>v{app.version || 1}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => onTestChat(app)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>テスト実行</span>
                </button>
                <button
                  onClick={() => {
                    if (app.type === 'workflow') {
                      onOpenWorkflow(app);
                    } else {
                      onOpenStudio(app);
                    }
                  }}
                  title="設定を編集"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicateApp(app.id)}
                  title="複製"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenPublish(app)}
                  title="公開・共有設定"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteApp(app.id)}
                  title="削除"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
