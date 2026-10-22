import React, { useState, useEffect } from 'react';
import {
  Save,
  Play,
  Copy,
  Globe,
  Plus,
  Trash2,
  FileText,
  Settings,
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  Clock,
  Zap,
  HelpCircle,
  Database,
  Sliders,
  Code,
  ExternalLink,
  Download,
  Edit3,
  Check,
  RefreshCw,
} from 'lucide-react';
import { AIApp, AIProvider, KnowledgeDoc, VariableDef, BYOKCredential, ModelInfo } from '../types';
import { PROVIDERS_CATALOG } from '../data/models';
import {
  addExecutionLog,
  getStoredModels,
  saveStoredModels,
  getStoredModelFetchMeta,
} from '../services/storage';

interface StudioViewProps {
  app: AIApp;
  onSave: (app: AIApp) => void;
  onDuplicate: (id: string) => void;
  onOpenPublish: (app: AIApp) => void;
  byokList: Record<string, BYOKCredential>;
  onOpenBYOK: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  app,
  onSave,
  onDuplicate,
  onOpenPublish,
  byokList,
  onOpenBYOK,
}) => {
  const [currentApp, setCurrentApp] = useState<AIApp>(app);
  const [activeTab, setActiveTab] = useState<'prompt' | 'variables' | 'knowledge' | 'settings'>('prompt');
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'simulator'>('editor');
  const [isSaved, setIsSaved] = useState(false);

  // Live simulator state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; durationMs?: number; tokens?: number }>>([
    { role: 'assistant', content: app.initialMessage || 'こんにちは！何か質問はありますか？' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentApp(app);
    const initialVars: Record<string, string> = {};
    app.variables.forEach((v) => {
      initialVars[v.name] = v.defaultValue || '';
    });
    setVariableValues(initialVars);
    setMessages([{ role: 'assistant', content: app.initialMessage || 'こんにちは！' }]);
  }, [app.id]);

  const providerCatalog = PROVIDERS_CATALOG.find((p) => p.id === currentApp.provider) || PROVIDERS_CATALOG[0];
  const [isManualModelId, setIsManualModelId] = useState(false);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [modelFetchNotice, setModelFetchNotice] = useState<string | null>(null);

  // Available models for currentApp.provider (cached or default catalog)
  const availableModels: ModelInfo[] = getStoredModels(currentApp.provider) || providerCatalog.models;
  const currentModelMeta = getStoredModelFetchMeta(currentApp.provider);

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    setModelFetchNotice(null);
    try {
      const activeCred = byokList[currentApp.provider];
      const res = await fetch('/api/ai/fetch-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: currentApp.provider,
          apiKey: activeCred?.apiKey || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'モデル取得に失敗しました');
      }
      if (data.models && data.models.length > 0) {
        saveStoredModels(currentApp.provider, data.models, {
          endpoint: data.endpoint || providerCatalog.modelsEndpoint,
          isLive: data.isLive ?? true,
        });
        setModelFetchNotice(`${data.models.length}件の最新モデルを取得しました`);
        setTimeout(() => setModelFetchNotice(null), 3000);
      }
    } catch (err: any) {
      setModelFetchNotice(err.message || 'モデル取得エラー');
      setTimeout(() => setModelFetchNotice(null), 3000);
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleSave = () => {
    const updated = {
      ...currentApp,
      version: (currentApp.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    setCurrentApp(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Add variable
  const handleAddVariable = () => {
    const newVar: VariableDef = {
      id: `v-${Date.now()}`,
      name: `var_${currentApp.variables.length + 1}`,
      label: `変数 ${currentApp.variables.length + 1}`,
      type: 'string',
      defaultValue: '',
      required: false,
    };
    setCurrentApp({ ...currentApp, variables: [...currentApp.variables, newVar] });
  };

  const handleRemoveVariable = (id: string) => {
    setCurrentApp({
      ...currentApp,
      variables: currentApp.variables.filter((v) => v.id !== id),
    });
  };

  // Add knowledge doc
  const handleAddKnowledgeDoc = () => {
    const newDoc: KnowledgeDoc = {
      id: `doc-${Date.now()}`,
      title: '新規ナレッジドキュメント',
      content: 'ここにAIが参照する業務ルールやFAQ本文を入力してください。',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setCurrentApp({
      ...currentApp,
      knowledgeDocs: [...currentApp.knowledgeDocs, newDoc],
    });
  };

  const handleRemoveKnowledgeDoc = (id: string) => {
    setCurrentApp({
      ...currentApp,
      knowledgeDocs: currentApp.knowledgeDocs.filter((d) => d.id !== id),
    });
  };

  // Chat simulator send
  const handleSendSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatError('');

    const nextMsgs = [...messages, { role: 'user' as const, content: userText }];
    setMessages(nextMsgs);
    setIsChatLoading(true);

    try {
      const activeCred = byokList[currentApp.provider];
      const res = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: currentApp.provider,
          apiKey: activeCred?.apiKey || '',
          modelId: currentApp.modelId,
          systemPrompt: currentApp.systemPrompt,
          messages: nextMsgs,
          temperature: currentApp.temperature,
          knowledgeDocs: currentApp.knowledgeDocs,
          variables: variableValues,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'レスポンス取得に失敗しました');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.output,
          durationMs: data.durationMs,
          tokens: data.tokenUsage?.totalTokens,
        },
      ]);

      // Record log
      addExecutionLog({
        appId: currentApp.id,
        appName: currentApp.name,
        provider: currentApp.provider,
        modelId: currentApp.modelId,
        status: 'success',
        durationMs: data.durationMs || 300,
        promptTokens: data.tokenUsage?.promptTokens || 0,
        completionTokens: data.tokenUsage?.completionTokens || 0,
        totalTokens: data.tokenUsage?.totalTokens || 0,
        inputSnippet: userText.slice(0, 100),
        outputSnippet: (data.output || '').slice(0, 120),
      });
    } catch (err: any) {
      setChatError(err.message || '実行エラーが発生しました。');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-slate-50 overflow-hidden">
      {/* Studio Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentApp.name}
            onChange={(e) => setCurrentApp({ ...currentApp, name: e.target.value })}
            className="text-sm md:text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors px-1"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
            <span>v{currentApp.version || 1}</span>
            <span>·</span>
            <span className="capitalize truncate">{currentApp.provider}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onDuplicate(currentApp.id)}
            className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px] whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>複製</span>
          </button>
          <button
            onClick={() => onOpenPublish(currentApp)}
            className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px] whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>公開・埋込</span>
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-xs flex items-center gap-1.5 min-h-[40px] whitespace-nowrap ${
              isSaved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? '保存完了！' : '変更を保存'}</span>
          </button>
        </div>
      </div>

      {/* Mobile view switch bar */}
      <div className="flex md:hidden items-center bg-slate-100 p-1 border-b border-slate-200">
        <button
          onClick={() => setMobileActiveView('editor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
            mobileActiveView === 'editor'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>構成・プロンプト</span>
        </button>
        <button
          onClick={() => setMobileActiveView('simulator')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
            mobileActiveView === 'simulator'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Play className="w-4 h-4 fill-current text-blue-600" />
          <span>対話プレビュー</span>
        </button>
      </div>

      {/* Main Studio Body: 2-column split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Configuration Tabs & Editor */}
        <div className={`${mobileActiveView === 'editor' ? 'flex' : 'hidden md:flex'} w-full md:w-1/2 flex-col border-r border-slate-200 bg-white overflow-hidden`}>
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 px-4 md:px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'prompt'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              プロンプト & モデル
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'variables'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>変数設定</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                {currentApp.variables.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'knowledge'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>ナレッジ・RAG</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                {currentApp.knowledgeDocs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              詳細パラメータ
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* 1. Prompt & Model */}
            {activeTab === 'prompt' && (
              <div className="space-y-4">
                {/* Provider & Model selectors with auto-fetch and manual model input */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Provider select */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-500">
                          AIプロバイダー
                        </label>
                        <a
                          href={providerCatalog.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>公式仕様</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <select
                        value={currentApp.provider}
                        onChange={(e) => {
                          const newProvider = e.target.value as AIProvider;
                          const cat = PROVIDERS_CATALOG.find((p) => p.id === newProvider);
                          const cached = getStoredModels(newProvider);
                          const firstModel = cached?.[0]?.id || cat?.defaultModel || currentApp.modelId;
                          setCurrentApp({
                            ...currentApp,
                            provider: newProvider,
                            modelId: firstModel,
                          });
                        }}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                      >
                        {PROVIDERS_CATALOG.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.badge})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model select / manual input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <span>モデル指定</span>
                          {currentModelMeta?.isLive && (
                            <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-700 font-bold">
                              Live
                            </span>
                          )}
                        </label>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleRefreshModels}
                            disabled={isRefreshingModels}
                            title="公式エンドポイントから最新モデル一覧を同期"
                            className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${isRefreshingModels ? 'animate-spin' : ''}`} />
                            <span>{isRefreshingModels ? '取得中...' : '最新取得'}</span>
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setIsManualModelId(!isManualModelId)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-medium"
                          >
                            {isManualModelId ? '一覧選択' : '手動入力'}
                          </button>
                        </div>
                      </div>

                      {isManualModelId ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={currentApp.modelId}
                            onChange={(e) => setCurrentApp({ ...currentApp, modelId: e.target.value })}
                            placeholder="例: gemini-2.5-pro, gpt-4o, claude-3-7-sonnet..."
                            className="w-full text-xs p-2 bg-white border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      ) : (
                        <select
                          value={currentApp.modelId}
                          onChange={(e) => setCurrentApp({ ...currentApp, modelId: e.target.value })}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        >
                          {availableModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.contextWindow} tok)
                            </option>
                          ))}
                          {!availableModels.some((m) => m.id === currentApp.modelId) && (
                            <option value={currentApp.modelId}>
                              {currentApp.modelId} (カスタムモデル)
                            </option>
                          )}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Feedback notice if refreshed */}
                  {modelFetchNotice && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{modelFetchNotice}</span>
                    </div>
                  )}

                  {/* Selected model specs preview pill */}
                  {(() => {
                    const selectedModel = availableModels.find((m) => m.id === currentApp.modelId);
                    if (!selectedModel) return null;
                    return (
                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 font-mono">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          コンテキスト: {selectedModel.contextWindow}
                        </span>
                        {selectedModel.inputPrice && (
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                            入力: {selectedModel.inputPrice}
                          </span>
                        )}
                        {selectedModel.outputPrice && (
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                            出力: {selectedModel.outputPrice}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* System Prompt editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>システムプロンプト (指示・役割)</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      変数挿入: {'{{変数名}}'}
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={currentApp.systemPrompt}
                    onChange={(e) => setCurrentApp({ ...currentApp, systemPrompt: e.target.value })}
                    placeholder="AIのキャラクター、知識、回答ポリシー、禁止事項を定義します..."
                    className="w-full text-xs p-3 font-mono leading-relaxed bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Initial greeting */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    開始時の挨拶メッセージ
                  </label>
                  <input
                    type="text"
                    value={currentApp.initialMessage}
                    onChange={(e) => setCurrentApp({ ...currentApp, initialMessage: e.target.value })}
                    placeholder="会話開始時にAIから最初に表示するテキスト"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 2. Variables */}
            {activeTab === 'variables' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      動的変数 (ユーザー入力パラメータ)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      プロンプト内で {'{{変数名}}'} として埋め込むことができます。
                    </p>
                  </div>
                  <button
                    onClick={handleAddVariable}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>変数を追加</span>
                  </button>
                </div>

                {currentApp.variables.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                    変数はまだ登録されていません。「変数を追加」から作成できます。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentApp.variables.map((v, i) => (
                      <div
                        key={v.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">
                            #{i + 1} 変数定義
                          </span>
                          <button
                            onClick={() => handleRemoveVariable(v.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[11px] text-slate-500 block mb-0.5">変数ID (英数)</span>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => {
                                const newVars = [...currentApp.variables];
                                newVars[i].name = e.target.value;
                                setCurrentApp({ ...currentApp, variables: newVars });
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block mb-0.5">ラベル名 (表示用)</span>
                            <input
                              type="text"
                              value={v.label}
                              onChange={(e) => {
                                const newVars = [...currentApp.variables];
                                newVars[i].label = e.target.value;
                                setCurrentApp({ ...currentApp, variables: newVars });
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-0.5">デフォルト値</span>
                          <input
                            type="text"
                            value={v.defaultValue || ''}
                            onChange={(e) => {
                              const newVars = [...currentApp.variables];
                              newVars[i].defaultValue = e.target.value;
                              setCurrentApp({ ...currentApp, variables: newVars });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-300 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Knowledge Base / RAG */}
            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      ナレッジベース (社内規程・FAQ文書)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ここに登録したテキストをAIが回答時に根拠として参照します。
                    </p>
                  </div>
                  <button
                    onClick={handleAddKnowledgeDoc}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ドキュメントを追加</span>
                  </button>
                </div>

                {currentApp.knowledgeDocs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                    ナレッジ文書はまだ登録されていません。「ドキュメントを追加」から追加できます。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentApp.knowledgeDocs.map((doc, idx) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={doc.title}
                            onChange={(e) => {
                              const newDocs = [...currentApp.knowledgeDocs];
                              newDocs[idx].title = e.target.value;
                              setCurrentApp({ ...currentApp, knowledgeDocs: newDocs });
                            }}
                            className="font-semibold text-slate-800 bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none w-2/3"
                          />
                          <button
                            onClick={() => handleRemoveKnowledgeDoc(doc.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={doc.content}
                          onChange={(e) => {
                            const newDocs = [...currentApp.knowledgeDocs];
                            newDocs[idx].content = e.target.value;
                            setCurrentApp({ ...currentApp, knowledgeDocs: newDocs });
                          }}
                          className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Temperature (創造性 vs 正確性): {currentApp.temperature}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentApp.temperature}
                    onChange={(e) =>
                      setCurrentApp({ ...currentApp, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>0.0 (厳密・正確)</span>
                    <span>0.5 (バランス)</span>
                    <span>1.0 (創造的)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="font-semibold text-slate-700 block mb-1">
                    アプリの概要説明
                  </label>
                  <textarea
                    rows={3}
                    value={currentApp.description}
                    onChange={(e) => setCurrentApp({ ...currentApp, description: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="font-semibold text-slate-700 block mb-1">
                    カスタムモデルIDの手動指定 (任意)
                  </label>
                  <input
                    type="text"
                    value={currentApp.modelId}
                    onChange={(e) => setCurrentApp({ ...currentApp, modelId: e.target.value })}
                    placeholder="例: gpt-4o-2024-11-20, claude-3-7-sonnet"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    リストにない新規モデルや特定日付のスナップショットIDを直接指定できます。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Chat Simulator */}
        <div className={`${mobileActiveView === 'simulator' ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 overflow-hidden`}>
          {/* Simulator Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                <Play className="w-3 h-3 fill-current" />
              </span>
              <span className="text-xs font-semibold text-slate-800">
                ライブプレビュー・シミュレータ
              </span>
            </div>
            <button
              onClick={() => {
                setMessages([{ role: 'assistant', content: currentApp.initialMessage || 'こんにちは！' }]);
                setChatError('');
              }}
              title="リセット"
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulator messages stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                    }`}
                  >
                    {m.content}
                    {!isUser && (m.durationMs || m.tokens) && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400 font-mono tabular-nums">
                        {m.durationMs && <span>{m.durationMs}ms</span>}
                        {m.tokens && <span>{m.tokens} トークン</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>推論実行中...</span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {chatError}
              </div>
            )}
          </div>

          {/* Simulator input */}
          <form
            onSubmit={handleSendSimulation}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="テストメッセージを入力してEnter..."
              disabled={isChatLoading}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
