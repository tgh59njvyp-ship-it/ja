import { AIApp, BYOKCredential, ExecutionLog, IntegrationConnector, ModelInfo, AIProvider } from '../types';
import { TEMPLATES_LIBRARY } from '../data/templates';

const APPS_STORAGE_KEY = 'dify_studio_apps_v1';
const BYOK_STORAGE_KEY = 'dify_studio_byok_v1';
const LOGS_STORAGE_KEY = 'dify_studio_logs_v1';
const INTEGRATIONS_STORAGE_KEY = 'dify_studio_integrations_v1';
const DYNAMIC_MODELS_PREFIX = 'dify_dynamic_models_v1_';

export function getInitialApps(): AIApp[] {
  const stored = localStorage.getItem(APPS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse apps storage', e);
    }
  }

  // Seed default apps from templates
  const seededApps: AIApp[] = [
    {
      id: 'app-support-1',
      name: 'Webサイト用サポートAI',
      description: 'FAQ・利用規約を遵守しながら、お客様の疑問に迅速に回答する接客チャットボット。',
      icon: 'Headphones',
      type: 'chat',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      systemPrompt: TEMPLATES_LIBRARY[1].systemPrompt,
      initialMessage: TEMPLATES_LIBRARY[1].initialMessage,
      temperature: 0.3,
      variables: TEMPLATES_LIBRARY[1].variables,
      tools: ['knowledge_search'],
      knowledgeDocs: TEMPLATES_LIBRARY[1].knowledgeDocs,
      isPublished: true,
      publishedUrl: 'https://ais-dev-ydt5pz7wuc5m5i5524xohk-58338577398.asia-northeast1.run.app/share/app-support-1',
      version: 1,
      createdAt: '2026-03-10T10:00:00Z',
      updatedAt: '2026-03-12T14:20:00Z',
      executionCount: 142,
    },
    {
      id: 'app-rag-2',
      name: '社内ナレッジRAGアシスタント',
      description: '社内マニュアルや規程から関連箇所を検索し、正確な社内情報のみを回答。',
      icon: 'Database',
      type: 'agent',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      systemPrompt: TEMPLATES_LIBRARY[6].systemPrompt,
      initialMessage: TEMPLATES_LIBRARY[6].initialMessage,
      temperature: 0.2,
      variables: TEMPLATES_LIBRARY[6].variables,
      tools: ['knowledge_search'],
      knowledgeDocs: TEMPLATES_LIBRARY[6].knowledgeDocs,
      isPublished: true,
      publishedUrl: 'https://ais-dev-ydt5pz7wuc5m5i5524xohk-58338577398.asia-northeast1.run.app/share/app-rag-2',
      version: 2,
      createdAt: '2026-03-08T09:15:00Z',
      updatedAt: '2026-03-15T11:45:00Z',
      executionCount: 89,
    },
    {
      id: 'app-workflow-3',
      name: '問い合わせ自動分類＆回答パイプライン',
      description: '入力受付から意図分類、条件分岐、担当LLM振り分けまでを全自動化。',
      icon: 'GitFork',
      type: 'workflow',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      systemPrompt: TEMPLATES_LIBRARY[11].systemPrompt,
      initialMessage: TEMPLATES_LIBRARY[11].initialMessage,
      temperature: 0.5,
      variables: TEMPLATES_LIBRARY[11].variables,
      tools: [],
      knowledgeDocs: [],
      workflowGraph: TEMPLATES_LIBRARY[11].defaultWorkflow,
      isPublished: false,
      version: 1,
      createdAt: '2026-03-05T16:00:00Z',
      updatedAt: '2026-03-16T18:00:00Z',
      executionCount: 56,
    },
    {
      id: 'app-code-4',
      name: 'TypeScriptコード生成＆レビュー',
      description: '型安全で保守性の高いコード実装、テストコード作成、リファクタリング。',
      icon: 'Code',
      type: 'chat',
      provider: 'gemini',
      modelId: 'gemini-4-argon',
      systemPrompt: TEMPLATES_LIBRARY[3].systemPrompt,
      initialMessage: TEMPLATES_LIBRARY[3].initialMessage,
      temperature: 0.4,
      variables: TEMPLATES_LIBRARY[3].variables,
      tools: ['syntax_validator'],
      knowledgeDocs: [],
      isPublished: false,
      version: 1,
      createdAt: '2026-03-02T13:30:00Z',
      updatedAt: '2026-03-02T13:30:00Z',
      executionCount: 34,
    },
  ];

  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(seededApps));
  return seededApps;
}

export function saveApps(apps: AIApp[]): void {
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
}

export function getAppById(id: string): AIApp | undefined {
  const apps = getInitialApps();
  return apps.find(a => a.id === id);
}

export function saveOrUpdateApp(app: AIApp): AIApp[] {
  const apps = getInitialApps();
  const index = apps.findIndex(a => a.id === app.id);
  let updated: AIApp[];
  if (index >= 0) {
    updated = [...apps];
    updated[index] = { ...app, updatedAt: new Date().toISOString() };
  } else {
    updated = [app, ...apps];
  }
  saveApps(updated);
  return updated;
}

export function deleteApp(id: string): AIApp[] {
  const apps = getInitialApps();
  const filtered = apps.filter(a => a.id !== id);
  saveApps(filtered);
  return filtered;
}

export function duplicateApp(id: string): AIApp | null {
  const apps = getInitialApps();
  const target = apps.find(a => a.id === id);
  if (!target) return null;

  const clone: AIApp = {
    ...target,
    id: `app-copy-${Date.now()}`,
    name: `${target.name} (コピー)`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 0,
    isPublished: false,
    publishedUrl: undefined,
  };

  const updated = [clone, ...apps];
  saveApps(updated);
  return clone;
}

// BYOK Credentials
export function getStoredBYOK(): Record<string, BYOKCredential> {
  const stored = localStorage.getItem(BYOK_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse byok storage', e);
    }
  }
  return {};
}

export function saveBYOKCredential(cred: BYOKCredential): void {
  const current = getStoredBYOK();
  current[cred.provider] = cred;
  localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(current));
}

export function removeBYOKCredential(provider: string): void {
  const current = getStoredBYOK();
  delete current[provider];
  localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(current));
}

// Execution Logs
export function getExecutionLogs(): ExecutionLog[] {
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse logs storage', e);
    }
  }
  // Default seeded sample logs for realistic analytics
  const sampleLogs: ExecutionLog[] = [
    {
      id: 'log-1',
      appId: 'app-support-1',
      appName: 'Webサイト用サポートAI',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      status: 'success',
      durationMs: 384,
      promptTokens: 245,
      completionTokens: 89,
      totalTokens: 334,
      inputSnippet: '領収書の発行方法を教えてください。',
      outputSnippet: '領収書はご注文完了メールまたはマイページの「注文履歴」からPDF形式でダウンロードいただけます。',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'log-2',
      appId: 'app-rag-2',
      appName: '社内ナレッジRAGアシスタント',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      status: 'success',
      durationMs: 512,
      promptTokens: 410,
      completionTokens: 120,
      totalTokens: 530,
      inputSnippet: 'リモートワークの運用ルールはどうなっていますか？',
      outputSnippet: '「リモートワーク運用ルール」によると、週3日までの在宅勤務が原則許可されています。',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'log-3',
      appId: 'app-workflow-3',
      appName: '問い合わせ自動分類＆回答パイプライン',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      status: 'success',
      durationMs: 1120,
      promptTokens: 620,
      completionTokens: 210,
      totalTokens: 830,
      inputSnippet: 'APIのレート制限に達した際のエラーハンドリング方法',
      outputSnippet: '[ワークフロー実行完了: 4ステップ / TECHルート]',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(sampleLogs));
  return sampleLogs;
}

export function addExecutionLog(log: Omit<ExecutionLog, 'id' | 'createdAt'>): ExecutionLog {
  const current = getExecutionLogs();
  const newLog: ExecutionLog = {
    ...log,
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newLog, ...current].slice(0, 100); // keep last 100
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  return newLog;
}

export function clearExecutionLogs(): void {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
}

// Integrations Connectors
export function getIntegrations(): IntegrationConnector[] {
  const stored = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse integrations storage', e);
    }
  }

  const defaultConnectors: IntegrationConnector[] = [
    {
      id: 'conn-rest-api',
      name: 'カスタムREST API / Webhook',
      category: 'api',
      icon: 'Globe',
      description: '任意の外部エンドポイントへGET/POSTリクエストを送信し、データを取得またはトリガー。',
      status: 'not_configured',
      config: { endpointUrl: '', authHeader: '', method: 'POST' },
      authType: 'webhook',
    },
    {
      id: 'conn-slack',
      name: 'Slack',
      category: 'chat',
      icon: 'MessageCircle',
      description: 'Slackの特定チャンネルへの自動通知、またはSlackボットとしての双方向会話連携。',
      status: 'not_configured',
      config: { webhookUrl: '', channelName: '#general', botToken: '' },
      authType: 'webhook',
    },
    {
      id: 'conn-discord',
      name: 'Discord',
      category: 'chat',
      icon: 'Radio',
      description: 'DiscordサーバーのWebhook URLにAIの回答やアラートを即時ポスト。',
      status: 'not_configured',
      config: { webhookUrl: '', botName: 'AI Studio Bot' },
      authType: 'webhook',
    },
    {
      id: 'conn-notion',
      name: 'Notion',
      category: 'knowledge',
      icon: 'FileSpreadsheet',
      description: 'Notionデータベースやページから社内ドキュメントを定期同期し、RAGナレッジとして活用。',
      status: 'not_configured',
      config: { apiSecret: '', databaseId: '' },
      authType: 'api_key',
    },
    {
      id: 'conn-github',
      name: 'GitHub',
      category: 'dev',
      icon: 'Github',
      description: 'リポジトリのIssue自動要約、Pull Requestのコードレビュー、コミットログ取得。',
      status: 'not_configured',
      config: { personalAccessToken: '', repoOwner: '', repoName: '' },
      authType: 'api_key',
    },
    {
      id: 'conn-google-drive',
      name: 'Google Drive',
      category: 'knowledge',
      icon: 'Folder',
      description: 'Google Docsやスプレッドシートのテキストをインデックス化し、AIの参照データとして読み込み。',
      status: 'not_configured',
      config: { folderId: '', serviceAccountKey: '' },
      authType: 'oauth_ready',
    },
  ];

  localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(defaultConnectors));
  return defaultConnectors;
}

export function saveIntegrations(connectors: IntegrationConnector[]): void {
  localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(connectors));
}

// Workspace Export / Import
export function exportWorkspaceData(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    apps: getInitialApps(),
    byok: getStoredBYOK(),
    integrations: getIntegrations(),
    logs: getExecutionLogs(),
  };
  return JSON.stringify(data, null, 2);
}

export function importWorkspaceData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.apps && Array.isArray(data.apps)) {
      saveApps(data.apps);
    }
    if (data.byok) {
      localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(data.byok));
    }
    if (data.integrations && Array.isArray(data.integrations)) {
      saveIntegrations(data.integrations);
    }
    return true;
  } catch (e) {
    console.error('Import error', e);
    return false;
  }
}

export interface ModelFetchMeta {
  fetchedAt: string;
  count: number;
  isLive: boolean;
  endpoint: string;
}

const DYNAMIC_MODELS_META_PREFIX = 'dify_models_meta_v1_';

export function getStoredModels(provider: AIProvider): ModelInfo[] | null {
  const raw = localStorage.getItem(`${DYNAMIC_MODELS_PREFIX}${provider}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error(`Failed to parse cached models for ${provider}`, e);
  }
  return null;
}

export function getStoredModelFetchMeta(provider: AIProvider): ModelFetchMeta | null {
  const raw = localStorage.getItem(`${DYNAMIC_MODELS_META_PREFIX}${provider}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveStoredModels(
  provider: AIProvider,
  models: ModelInfo[],
  meta?: { endpoint: string; isLive: boolean }
): void {
  localStorage.setItem(`${DYNAMIC_MODELS_PREFIX}${provider}`, JSON.stringify(models));
  if (meta) {
    const fetchMeta: ModelFetchMeta = {
      fetchedAt: new Date().toISOString(),
      count: models.length,
      isLive: meta.isLive,
      endpoint: meta.endpoint,
    };
    localStorage.setItem(`${DYNAMIC_MODELS_META_PREFIX}${provider}`, JSON.stringify(fetchMeta));
  }
}

export function clearStoredModels(provider: AIProvider): void {
  localStorage.removeItem(`${DYNAMIC_MODELS_PREFIX}${provider}`);
  localStorage.removeItem(`${DYNAMIC_MODELS_META_PREFIX}${provider}`);
}
