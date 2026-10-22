import React, { useState } from 'react';
import {
  FileClock,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { ExecutionLog } from '../types';

interface LogsViewProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.appName.toLowerCase().includes(q) ||
        log.inputSnippet.toLowerCase().includes(q) ||
        log.outputSnippet.toLowerCase().includes(q) ||
        log.modelId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            実行ログ & 分析
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            アプリごとの呼び出し履歴、トークン消費量、推論レイテンシ、エラー内容のトレース。
          </p>
        </div>

        <button
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ログを全消去</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            すべて ({logs.length})
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterStatus === 'success'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            成功 ({logs.filter((l) => l.status === 'success').length})
          </button>
          <button
            onClick={() => setFilterStatus('error')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterStatus === 'error'
                ? 'bg-white text-red-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            エラー ({logs.filter((l) => l.status === 'error').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ログを検索..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table & Mobile Cards */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            一致する実行ログはありません。
          </div>
        ) : (
          <>
            {/* Mobile Cards (md:hidden) */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer space-y-2 min-h-[56px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {log.appName}
                    </span>
                    {log.status === 'success' ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>成功</span>
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>エラー</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {log.inputSnippet}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums pt-1">
                    <span>{log.modelId}</span>
                    <div className="flex items-center gap-2">
                      <span>{log.durationMs}ms</span>
                      <span>·</span>
                      <span>{log.totalTokens} tokens</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-4">ステータス</th>
                    <th className="py-3 px-4">対象アプリ</th>
                    <th className="py-3 px-4">モデル</th>
                    <th className="py-3 px-4">入力スニペット</th>
                    <th className="py-3 px-4 text-right">応答時間</th>
                    <th className="py-3 px-4 text-right">トークン数</th>
                    <th className="py-3 px-4 text-right">日時</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === 'success' ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-sans font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>成功</span>
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 font-sans font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>エラー</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800 whitespace-nowrap">
                        {log.appName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.modelId}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                        {log.inputSnippet}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600 whitespace-nowrap">
                        {log.durationMs}ms
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600 whitespace-nowrap">
                        {log.totalTokens}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  実行ログ詳細: {selectedLog.appName}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedLog.modelId} · {selectedLog.durationMs}ms · {selectedLog.totalTokens} tokens
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">入力プロンプト:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.inputSnippet}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">出力レスポンス:</span>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedLog.outputSnippet || '(出力なし)'}
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <span className="font-semibold block mb-0.5">エラー内容:</span>
                  <p className="font-mono">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
