import React, { useState } from 'react';
import { X, Check, Copy, Globe, Code, Link2, ExternalLink } from 'lucide-react';
import { AIApp } from '../types';

interface PublishShareModalProps {
  app: AIApp | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePublish: (app: AIApp) => void;
}

export const PublishShareModal: React.FC<PublishShareModalProps> = ({
  app,
  isOpen,
  onClose,
  onTogglePublish,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'api'>('link');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !app) return null;

  const shareUrl = `${window.location.origin}/share/${app.id}`;
  const embedCode = `<iframe
  src="${shareUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e2e8f0;"
></iframe>`;

  const curlCode = `curl -X POST ${window.location.origin}/api/ai/run \\
  -H "Content-Type: application/json" \\
  -d '{
    "appId": "${app.id}",
    "provider": "${app.provider}",
    "modelId": "${app.modelId}",
    "messages": [
      { "role": "user", "content": "こんにちは！" }
    ]
  }'`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              公開・埋め込み・API連携
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                公開ステータス:{' '}
                <span className={app.isPublished ? 'text-emerald-600 font-bold' : 'text-slate-500 font-normal'}>
                  {app.isPublished ? '公開中 (Public)' : '非公開 (Private)'}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {app.isPublished
                  ? '誰でもリンクや埋め込みからこのAIとチャットできます。'
                  : '現在はこのワークスペース内でのみテスト可能です。'}
              </p>
            </div>
            <button
              onClick={() => onTogglePublish(app)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                app.isPublished
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {app.isPublished ? '非公開にする' : '一般公開する'}
            </button>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'link'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>共有リンク</span>
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'embed'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web埋め込み</span>
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'api'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>APIエンドポイント</span>
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                独立したチャット画面の公開URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'link' ? 'コピー済' : 'コピー'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Webサイトに埋め込むHTMLコード（iframe形式）
              </label>
              <textarea
                readOnly
                rows={4}
                value={embedCode}
                className="w-full text-xs p-2.5 bg-slate-900 text-slate-200 font-mono rounded-lg focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'embed' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'embed' ? 'コピー済' : 'コードをコピー'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                外部アプリケーションから呼び出すcURLコマンド例
              </label>
              <textarea
                readOnly
                rows={6}
                value={curlCode}
                className="w-full text-xs p-2.5 bg-slate-900 text-slate-200 font-mono rounded-lg focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => copyToClipboard(curlCode, 'curl')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'curl' ? 'コピー済' : 'cURLをコピー'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
