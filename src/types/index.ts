export type AIProvider = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'groq' 
  | 'deepseek' 
  | 'openrouter' 
  | 'mistral' 
  | 'xai';

export interface ProviderInfo {
  id: AIProvider;
  name: string;
  badge: string;
  description: string;
  endpoint: string;
  modelsEndpoint: string;
  docsUrl: string;
  keyPrefix?: string;
  helpUrl: string;
  pricingNote: string;
  defaultModel: string;
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: string;
  inputPrice?: string;
  outputPrice?: string;
  recommendedFor?: string;
  features: string[];
  description?: string;
  isLiveFetched?: boolean;
}

export interface BYOKCredential {
  provider: AIProvider;
  apiKey: string;
  customEndpoint?: string;
  status: 'valid' | 'invalid' | 'untested';
  lastTestedAt?: string;
  testLatencyMs?: number;
  errorMessage?: string;
}

export type AppType = 'chat' | 'workflow' | 'agent' | 'completion';

export interface VariableDef {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'select';
  defaultValue?: string;
  options?: string[];
  required: boolean;
  description?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  updatedAt: string;
}

export interface AIApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AppType;
  provider: AIProvider;
  modelId: string;
  systemPrompt: string;
  initialMessage: string;
  temperature: number;
  maxTokens?: number;
  variables: VariableDef[];
  tools: string[];
  knowledgeDocs: KnowledgeDoc[];
  workflowGraph?: WorkflowGraph;
  isPublished: boolean;
  publishedUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
}

export type NodeType = 
  | 'start' 
  | 'llm' 
  | 'knowledge' 
  | 'condition' 
  | 'http_tool' 
  | 'transform' 
  | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  data: {
    // LLM node
    provider?: AIProvider;
    modelId?: string;
    systemPrompt?: string;
    userPrompt?: string;
    temperature?: number;
    // Condition node
    conditionVariable?: string;
    conditionOperator?: 'contains' | 'equals' | 'greater_than' | 'is_empty';
    conditionValue?: string;
    // Knowledge node
    queryVariable?: string;
    knowledgeSource?: string;
    // HTTP Tool node
    httpMethod?: 'GET' | 'POST';
    httpUrl?: string;
    httpHeaders?: string;
    httpBody?: string;
    // Transform node
    transformCode?: string;
    // Output node
    outputTemplate?: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  fromNodeId: string;
  fromPort: 'output' | 'true' | 'false';
  toNodeId: string;
  toPort: 'input';
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionLog {
  id: string;
  appId: string;
  appName: string;
  provider: AIProvider;
  modelId: string;
  status: 'success' | 'error';
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  inputSnippet: string;
  outputSnippet: string;
  errorMessage?: string;
  createdAt: string;
}

export interface TemplateApp {
  id: string;
  title: string;
  category: 'chatbot' | 'support' | 'research' | 'code' | 'writing' | 'rag' | 'workflow' | 'agent';
  description: string;
  icon: string;
  requiredProvider: AIProvider;
  recommendedModel: string;
  systemPrompt: string;
  initialMessage: string;
  variables: VariableDef[];
  tools: string[];
  knowledgeDocs: KnowledgeDoc[];
  defaultWorkflow?: WorkflowGraph;
  previewPrompt: string;
  previewOutput: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'api' | 'chat' | 'knowledge' | 'dev';
  icon: string;
  description: string;
  status: 'connected' | 'not_configured' | 'mock';
  config: Record<string, string>;
  authType: 'api_key' | 'webhook' | 'oauth_ready';
  lastPingAt?: string;
}
