import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AIProvider, BYOKCredential, ModelInfo } from '../types';
import { PROVIDERS_CATALOG } from '../data/models';
import {
  getStoredModels,
  saveStoredModels,
  clearStoredModels,
  getStoredModelFetchMeta,
  ModelFetchMeta,
} from '../services/storage';

interface BYOKSettingsViewProps {
  byokList: Record<string, BYOKCredential>;
  onSaveCredential: (cred: BYOKCredential) => void;
  onRemoveCredential: (provider: string) => void;
}

export const BYOKSettingsView: React.FC<BYOKSettingsViewProps> = ({
  byokList,
  onSaveCredential,
  onRemoveCredential,
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<AIProvider>('gemini');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null);

  // Model fetching states
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [modelsList, setModelsList] = useState<ModelInfo[]>([]);
  const [fetchMeta, setFetchMeta] = useState<ModelFetchMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const selectedProvider = PROVIDERS_CATALOG.find((p) => p.id === selectedProviderId) || PROVIDERS_CATALOG[0];
  const currentCred = byokList[selectedProviderId];

  // Load models from cache or default catalog on provider change
  useEffect(() => {
    setKeyInput(currentCred?.apiKey || '');
    setShowKey(false);
    setTestResult(null);
    setFetchMessage(null);
    setSearchQuery('');

    const cached = getStoredModels(selectedProviderId);
    const meta = getStoredModelFetchMeta(selectedProviderId);
    setFetchMeta(meta);

    if (cached && cached.length > 0) {
      setModelsList(cached);
    } else {
      setModelsList(selectedProvider.models);
    }
  }, [selectedProviderId, currentCred, selectedProvider]);

  // Handle Save
  const handleSave = () => {
    if (!keyInput.trim()) {
      onRemoveCredential(selectedProviderId);
      return;
    }
    const cred: BYOKCredential = {
      provider: selectedProviderId,
      apiKey: keyInput.trim(),
      status: currentCred?.status || 'untested',
      lastTestedAt: currentCred?.lastTestedAt,
      testLatencyMs: currentCred?.testLatencyMs,
    };
    onSaveCredential(cred);
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    const keyToTest = keyInput.trim() || currentCred?.apiKey;
    if (!keyToTest && selectedProviderId !== 'gemini') {
      setTestResult({ success: false, error: 'APIキーを入力してからテストしてください。' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProviderId,
          apiKey: keyToTest,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '接続テストに失敗しました');
      }

      const updatedCred: BYOKCredential = {
        provider: selectedProviderId,
        apiKey: keyToTest || '',
        status: 'valid',
        lastTestedAt: new Date().toISOString(),
        testLatencyMs: data.latencyMs,
      };
      onSaveCredential(updatedCred);

      setTestResult({
        success: true,
        latencyMs: data.latencyMs,
      });

      // Also trigger model fetch automatically on successful connection test
      handleFetchModels(keyToTest);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || '通信エラーが発生しました。',
      });
      if (currentCred) {
        onSaveCredential({
          ...currentCred,
          status: 'invalid',
          errorMessage: err.message,
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Automatic Model Fetching from Endpoint
  const handleFetchModels = async (overrideKey?: string) => {
    const keyToUse = overrideKey !== undefined ? overrideKey : (keyInput.trim() || currentCred?.apiKey || '');
    setIsFetchingModels(true);
    setFetchMessage(null);

    try {
      const res = await fetch('/api/ai/fetch-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProviderId,
          apiKey: keyToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'モデル一覧の取得に失敗しました。');
      }

      const fetchedList: ModelInfo[] = data.models || [];
      setModelsList(fetchedList);
      saveStoredModels(selectedProviderId, fetchedList, {
        endpoint: data.endpoint || selectedProvider.modelsEndpoint,
        isLive: data.isLive ?? true,
      });

      const updatedMeta = getStoredModelFetchMeta(selectedProviderId);
      setFetchMeta(updatedMeta);

      if (data.isLive) {
        setFetchMessage({
          type: 'success',
          text: `公式エンドポイントから ${fetchedList.length} 件のモデルを自動取得しました (${data.latencyMs}ms)`,
        });
      } else {
        setFetchMessage({
          type: 'info',
          text: data.notice || '標準カタログを表示しています。APIキーを登録するとリアルタイム一覧を取得できます。',
        });
      }
    } catch (err: any) {
      console.error('Fetch models error:', err);
      setFetchMessage({
        type: 'error',
        text: err.message || 'モデル一覧取得に失敗しました。',
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Reset to default catalog
  const handleResetCatalog = () => {
    clearStoredModels(selectedProviderId);
    setModelsList(selectedProvider.models);
    setFetchMeta(null);
    setFetchMessage({
      type: 'info',
      text: '標準モデルカタログにリセットしました。',
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  // Filtered models
  const filteredModels = modelsList.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.recommendedFor && m.recommendedFor.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          BYOK (Bring Your Own Key) & AIモデル管理
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          各AIプロバイダーのAPIキーを登録し、公式エンドポイントから利用可能モデルを自動取得してテスト・実行します。
        </p>
      </div>

      {/* Security callout */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">セキュアなBYOKアーキテクチャ & 公式API自動連携</p>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            APIキーはローカルストレージ内で安全に保持され、AIリクエスト送信時はバックエンドサーバー（<code>/api/ai/*</code>）経由でのみ正規化中継されます。第三者に共有されたり、フロントエンドのJavaScriptログに直接出力されることはありません。
          </p>
        </div>
      </div>

      {/* Main Grid: Left Providers list / Right Provider detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Provider Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400">
            対応プロバイダー (全8社)
          </p>
          <div className="flex lg:flex-col overflow-x-auto gap-2 lg:gap-1 pb-1 lg:pb-0">
            {PROVIDERS_CATALOG.map((p) => {
              const isSelected = selectedProviderId === p.id;
              const cred = byokList[p.id];
              const isConfigured = Boolean(cred?.apiKey);

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`flex-shrink-0 lg:flex-shrink lg:w-full flex items-center justify-between p-3 rounded-lg text-xs transition-all text-left min-h-[44px] ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="mr-3 lg:mr-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold whitespace-nowrap">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    {cred?.status === 'valid' ? (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-mono whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">確認済</span>
                      </span>
                    ) : isConfigured ? (
                      <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">登録済</span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">未設定</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Provider Settings & Model Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Key Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedProvider.name} の設定
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 font-mono">
                    {selectedProvider.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedProvider.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>公式モデルドキュメント</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href={selectedProvider.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                >
                  <span>キー取得先</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Official Models Endpoint display */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>モデル取得公式エンドポイント</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyEndpoint(selectedProvider.modelsEndpoint)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {copiedEndpoint ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEndpoint ? 'コピー完了' : 'URLをコピー'}</span>
                </button>
              </div>
              <code className="text-xs font-mono text-slate-800 break-all select-all block bg-white p-1.5 rounded border border-slate-200">
                {selectedProvider.modelsEndpoint}
              </code>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                APIキー (API Key)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={`例: ${selectedProvider.keyPrefix || 'API Key...'}`}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  保存する
                </button>
                {currentCred?.apiKey && (
                  <button
                    onClick={() => {
                      onRemoveCredential(selectedProviderId);
                      setKeyInput('');
                    }}
                    title="キーを削除"
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedProvider.pricingNote}
              </p>
            </div>

            {/* Actions: Test Connection + Fetch Models */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? '接続テスト中...' : '接続テストを実行'}</span>
                </button>

                <button
                  onClick={() => handleFetchModels()}
                  disabled={isFetchingModels}
                  className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-bounce' : ''}`} />
                  <span>{isFetchingModels ? 'モデル自動取得中...' : 'モデル一覧を自動取得'}</span>
                </button>
              </div>

              {testResult && (
                <div className="text-xs font-mono">
                  {testResult.success ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>疎通成功 ({testResult.latencyMs}ms)</span>
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-sm">{testResult.error}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Fetch status message */}
            {fetchMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  fetchMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : fetchMessage.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {fetchMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : fetchMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                ) : (
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                )}
                <span>{fetchMessage.text}</span>
              </div>
            )}
          </div>

          {/* Model Catalog Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedProvider.name} の利用可能モデル一覧 ({filteredModels.length}件)
                  </h3>
                  {fetchMeta?.isLive ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      公式API自動取得済み
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 font-mono">
                      標準カタログ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fetchMeta?.fetchedAt
                    ? `最終取得日時: ${new Date(fetchMeta.fetchedAt).toLocaleString('ja-JP')} (公式エンドポイント: ${selectedProvider.modelsEndpoint})`
                    : 'APIキーを設定し「モデル一覧を自動取得」を実行すると、最新モデルに同期されます。'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {fetchMeta && (
                  <button
                    onClick={handleResetCatalog}
                    title="標準カタログにリセット"
                    className="p-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">リセット</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Filter input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="モデルIDや名前、キーワードで絞り込み (例: flash, reasoner, mini, llama...)"
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Models Table */}
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white shadow-xs">
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-2 font-semibold">モデル名 / ID</th>
                    <th className="pb-2 font-semibold">コンテキスト</th>
                    <th className="pb-2 font-semibold">入力価格 (1M)</th>
                    <th className="pb-2 font-semibold">出力価格 (1M)</th>
                    <th className="pb-2 font-semibold">特徴・用途</th>
                    <th className="pb-2 font-semibold text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredModels.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-3 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.isLiveFetched && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-600 font-sans font-semibold">
                              Live
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal select-all">
                          {m.id}
                        </span>
                      </td>
                      <td className="py-2.5 tabular-nums text-slate-600">
                        {m.contextWindow}
                      </td>
                      <td className="py-2.5 tabular-nums text-slate-600">
                        {m.inputPrice || '-'}
                      </td>
                      <td className="py-2.5 tabular-nums text-slate-600">
                        {m.outputPrice || '-'}
                      </td>
                      <td className="py-2.5 text-[11px] font-sans text-slate-600 max-w-xs truncate">
                        {m.recommendedFor || (m.features && m.features.join(', ')) || '-'}
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.id)}
                          className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors inline-flex items-center gap-1"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">コピー完了</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>IDコピー</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredModels.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  該当するモデルが見つかりませんでした。「{searchQuery}」の条件を変更するか、「モデル一覧を自動取得」をお試しください。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
