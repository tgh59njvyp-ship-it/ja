import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check, ArrowRight } from 'lucide-react';
import { AIApp, AIProvider } from '../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppCreated: (app: AIApp) => void;
  byokList: Record<string, any>;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onAppCreated,
  byokList,
}) => {
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!ideaPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    setGeneratedConfig(null);

    try {
      const activeKey = byokList['gemini']?.apiKey || '';
      const res = await fetch('/api/ai/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaPrompt,
          provider: 'gemini',
          apiKey: activeKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '生成に失敗しました');
      }

      setGeneratedConfig(data.generatedApp);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI構成の自動生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmCreate = () => {
    if (!generatedConfig) return;

    const newApp: AIApp = {
      id: `app-custom-${Date.now()}`,
      name: generatedConfig.name || 'カスタムAIアプリ',
      description: generatedConfig.description || ideaPrompt,
      icon: generatedConfig.icon || 'MessageSquare',
      type: generatedConfig.type || 'chat',
      provider: (generatedConfig.provider as AIProvider) || 'gemini',
      modelId: generatedConfig.modelId || 'gemini-3.8-flash',
      systemPrompt: generatedConfig.systemPrompt || '',
      initialMessage: generatedConfig.initialMessage || 'こんにちは！',
      temperature: generatedConfig.temperature || 0.7,
      variables: generatedConfig.variables || [],
      tools: generatedConfig.tools || ['calculator'],
      knowledgeDocs: [],
      isPublished: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
    };

    onAppCreated(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              かんたん作成 (Prompt to App)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              作りたいAIアプリの概要・アイデア
            </label>
            <textarea
              rows={3}
              value={ideaPrompt}
              onChange={(e) => setIdeaPrompt(e.target.value)}
              placeholder="例: ECサイトの問い合わせに対して、返品条件や配送予定日を優しく案内するカスタマーサポートBotを作りたい。"
              className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            <p className="mt-1 text-xs text-slate-400">
              日常会話のような文章で入力するだけで、システム指示や初期メッセージをAIが自動合成します。
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !ideaPrompt.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'AI構成を設計中...' : 'AI構成を自動生成する'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedConfig && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="font-semibold text-sm text-slate-900">
                  {generatedConfig.name}
                </div>
                <span className="text-xs text-slate-500">
                  推奨モデル: {generatedConfig.modelId}
                </span>
              </div>
              <p className="text-xs text-slate-600">{generatedConfig.description}</p>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  自動生成されたシステムプロンプト:
                </span>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {generatedConfig.systemPrompt}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  初期メッセージ:
                </span>
                <p className="text-xs text-slate-800 bg-white p-2 border border-slate-200 rounded">
                  {generatedConfig.initialMessage}
                </p>
              </div>

              {generatedConfig.sampleQuestions && generatedConfig.sampleQuestions.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    サンプルトーク例:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedConfig.sampleQuestions.map((q: string, idx: number) => (
                      <span key={idx} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            キャンセル
          </button>
          {generatedConfig && (
            <button
              onClick={handleConfirmCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>この構成でアプリを作成する</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
