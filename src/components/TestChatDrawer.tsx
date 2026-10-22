import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RotateCcw, Bot, User, Clock, Zap, AlertCircle } from 'lucide-react';
import { AIApp, BYOKCredential } from '../types';
import { addExecutionLog } from '../services/storage';

interface TestChatDrawerProps {
  app: AIApp | null;
  isOpen: boolean;
  onClose: () => void;
  byokList: Record<string, BYOKCredential>;
  onOpenBYOK: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  durationMs?: number;
  tokens?: number;
}

export const TestChatDrawer: React.FC<TestChatDrawerProps> = ({
  app,
  isOpen,
  onClose,
  byokList,
  onOpenBYOK,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when app opens
  useEffect(() => {
    if (app && isOpen) {
      const initialVars: Record<string, string> = {};
      app.variables.forEach((v) => {
        initialVars[v.name] = v.defaultValue || '';
      });
      setVariableValues(initialVars);

      setMessages([
        {
          id: 'init-msg',
          role: 'assistant',
          content: app.initialMessage || 'こんにちは！何かお手伝いできることはありますか？',
        },
      ]);
      setErrorMsg('');
    }
  }, [app, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen || !app) return null;

  const currentCred = byokList[app.provider];
  const hasKey = Boolean(currentCred?.apiKey);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setErrorMsg('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: app.provider,
          apiKey: currentCred?.apiKey || '',
          modelId: app.modelId,
          systemPrompt: app.systemPrompt,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          temperature: app.temperature,
          knowledgeDocs: app.knowledgeDocs,
          variables: variableValues,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'レスポンス取得に失敗しました');
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.output,
        durationMs: data.durationMs,
        tokens: data.tokenUsage?.totalTokens,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Record execution log
      addExecutionLog({
        appId: app.id,
        appName: app.name,
        provider: app.provider,
        modelId: app.modelId,
        status: 'success',
        durationMs: data.durationMs || 300,
        promptTokens: data.tokenUsage?.promptTokens || 0,
        completionTokens: data.tokenUsage?.completionTokens || 0,
        totalTokens: data.tokenUsage?.totalTokens || 0,
        inputSnippet: userText.slice(0, 100),
        outputSnippet: (data.output || '').slice(0, 120),
      });
    } catch (err: any) {
      const errMsg = err.message || '通信エラーが発生しました';
      setErrorMsg(errMsg);
      addExecutionLog({
        appId: app.id,
        appName: app.name,
        provider: app.provider,
        modelId: app.modelId,
        status: 'error',
        durationMs: 150,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        inputSnippet: userText.slice(0, 100),
        outputSnippet: '',
        errorMessage: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: app.initialMessage || 'こんにちは！',
      },
    ]);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs">
              <Bot className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {app.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>{app.provider}</span>
                <span>·</span>
                <span>{app.modelId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="会話履歴をリセット"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Variables strip if any */}
        {app.variables.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-500">変数入力:</span>
            {app.variables.map((v) => (
              <div key={v.id} className="flex items-center gap-1.5">
                <span className="text-slate-600">{v.label}:</span>
                {v.type === 'select' && v.options ? (
                  <select
                    value={variableValues[v.name] || ''}
                    onChange={(e) =>
                      setVariableValues({ ...variableValues, [v.name]: e.target.value })
                    }
                    className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {v.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={variableValues[v.name] || ''}
                    onChange={(e) =>
                      setVariableValues({ ...variableValues, [v.name]: e.target.value })
                    }
                    className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 w-28 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Missing API Key Alert */}
        {!hasKey && (
          <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">
                {app.provider} のAPIキーが未登録です。
              </span>
              <p className="mt-0.5 text-amber-700">
                本番実行を行うにはBYOK設定でAPIキーを保存してください（現在は安全なテストモードまたはサーバーキーを使用します）。
              </p>
              <button
                onClick={onOpenBYOK}
                className="mt-1.5 font-semibold text-blue-600 hover:underline"
              >
                BYOK設定を開く →
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 shrink-0 text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {m.content}
                  {!isUser && (m.durationMs || m.tokens) && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-3 text-[10px] text-slate-400 font-mono tabular-nums">
                      {m.durationMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{m.durationMs}ms</span>
                        </span>
                      )}
                      {m.tokens && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{m.tokens} トークン</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 text-slate-700 shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="bg-slate-100 text-slate-500 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-mono">思考中...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {errorMsg}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力してください..."
            disabled={isLoading}
            className="flex-1 text-xs md:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0 shadow-xs min-w-[44px]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
