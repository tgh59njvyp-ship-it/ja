import React, { useState } from 'react';
import {
  Library,
  Search,
  MessageSquare,
  Headphones,
  Search as SearchIcon,
  Code,
  FileText,
  Layers,
  Database,
  Share2,
  Edit3,
  Cpu,
  Globe,
  GitFork,
  ArrowRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { TEMPLATES_LIBRARY } from '../data/templates';
import { TemplateApp, AIApp } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (template: TemplateApp) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<TemplateApp | null>(null);

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'chatbot', label: 'チャットボット' },
    { id: 'support', label: 'カスタマーサポート' },
    { id: 'research', label: 'リサーチ・調査' },
    { id: 'code', label: 'コード開発' },
    { id: 'writing', label: '執筆・SNS・要約' },
    { id: 'rag', label: 'ナレッジ・RAG' },
    { id: 'workflow', label: '自動化ワークフロー' },
    { id: 'agent', label: 'エージェント' },
  ];

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Headphones':
        return <Headphones className="w-5 h-5 text-blue-600" />;
      case 'Search':
        return <SearchIcon className="w-5 h-5 text-amber-600" />;
      case 'Code':
        return <Code className="w-5 h-5 text-emerald-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-cyan-600" />;
      case 'Database':
        return <Database className="w-5 h-5 text-rose-600" />;
      case 'Share2':
        return <Share2 className="w-5 h-5 text-pink-600" />;
      case 'Edit3':
        return <Edit3 className="w-5 h-5 text-purple-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-orange-600" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-teal-600" />;
      case 'GitFork':
        return <GitFork className="w-5 h-5 text-violet-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  const filteredTemplates = TEMPLATES_LIBRARY.filter((tpl) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'writing') {
        if (tpl.category !== 'writing') return false;
      } else if (tpl.category !== selectedCategory) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            テンプレートライブラリ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            業界標準の高品質プロンプトとワークフロー構成を網羅。1クリックで複製し、自社向けにカスタマイズできます。
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="テンプレートを検索..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getTemplateIcon(tpl.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tpl.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                    <span className="capitalize">{tpl.requiredProvider}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tpl.recommendedModel}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                {tpl.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActivePreviewTemplate(tpl)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                詳細を見る
              </button>
              <button
                onClick={() => onSelectTemplate(tpl)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs"
              >
                <span>このテンプレートを使う</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Detail & Preview Modal */}
      {activePreviewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  {getTemplateIcon(activePreviewTemplate.icon)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activePreviewTemplate.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>推奨: {activePreviewTemplate.recommendedModel}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">説明</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activePreviewTemplate.description}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  初期システムプロンプト設定:
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {activePreviewTemplate.systemPrompt}
                </div>
              </div>

              {activePreviewTemplate.previewPrompt && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                    完成動作イメージ (サンプル対話例):
                  </span>
                  <div className="p-3 bg-slate-100 rounded-lg space-y-2 text-xs">
                    <div className="font-semibold text-slate-800">
                      Q: {activePreviewTemplate.previewPrompt}
                    </div>
                    <div className="text-slate-700 font-mono whitespace-pre-wrap pl-2 border-l-2 border-blue-500 text-[11px] leading-relaxed">
                      {activePreviewTemplate.previewOutput}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  const tpl = activePreviewTemplate;
                  setActivePreviewTemplate(null);
                  onSelectTemplate(tpl);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>このテンプレートから作成する</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
