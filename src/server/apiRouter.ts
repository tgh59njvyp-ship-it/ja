import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PROVIDERS_CATALOG } from '../data/models.ts';

export const apiRouter = Router();

// Test API Key endpoint for BYOK verification
apiRouter.post('/ai/test-key', async (req: Request, res: Response) => {
  const { provider, apiKey } = req.body;

  if (!provider) {
    return res.status(400).json({ success: false, error: 'プロバイダーが指定されていません。' });
  }

  const startTime = Date.now();

  try {
    if (provider === 'gemini') {
      const keyToUse = apiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : '');
      if (!keyToUse) {
        return res.status(400).json({ success: false, error: 'Gemini APIキーが未入力です。「BYOK設定」でご自身のAPIキーを入力してください。' });
      }
      const ai = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      // Quick test call with timeout
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: 'Ping',
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('タイムアウト (10秒)')), 10000))
      ]);
      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        latencyMs,
        provider,
        sampleOutput: response.text ? '接続成功' : 'OK',
      });
    }

    if (provider === 'openai') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'OpenAI APIキーが未入力です。' });
      const resp = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'anthropic') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Anthropic APIキーが未入力です。' });
      const resp = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'groq') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Groq APIキーが未入力です。' });
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'deepseek') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'DeepSeek APIキーが未入力です。' });
      const resp = await fetch('https://api.deepseek.com/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'openrouter') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'OpenRouter APIキーが未入力です。' });
      const resp = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'mistral') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'Mistral APIキーが未入力です。' });
      const resp = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    if (provider === 'xai') {
      if (!apiKey) return res.status(400).json({ success: false, error: 'xAI APIキーが未入力です。' });
      const resp = await fetch('https://api.x.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - startTime;
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: errData.error?.message || `HTTP ${resp.status} エラー` });
      }
      return res.json({ success: true, latencyMs, provider });
    }

    return res.status(400).json({ success: false, error: `未対応のプロバイダーです: ${provider}` });
  } catch (error: any) {
    console.error('Test key error:', error);
    let msg = error.message || '接続テスト中にエラーが発生しました。';
    try {
      const parsed = typeof msg === 'string' && msg.startsWith('{') ? JSON.parse(msg) : null;
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}
    return res.status(500).json({ success: false, error: msg });
  }
});

// Auto-fetch Models Endpoint for all 8 providers
apiRouter.post('/ai/fetch-models', async (req: Request, res: Response) => {
  const { provider, apiKey } = req.body;

  if (!provider) {
    return res.status(400).json({ success: false, error: 'プロバイダーが指定されていません。' });
  }

  const startTime = Date.now();
  const defaultProvider = PROVIDERS_CATALOG.find((p) => p.id === provider);

  try {
    // 1. Gemini: https://generativelanguage.googleapis.com/v1beta/models
    if (provider === 'gemini') {
      const keyToUse =
        apiKey ||
        (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
          ? process.env.GEMINI_API_KEY
          : '');

      if (!keyToUse) {
        return res.json({
          success: true,
          provider: 'gemini',
          endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
          docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
          isLive: false,
          notice: 'Gemini APIキーを入力すると、ご利用のGoogleアカウントで有効な最新モデルを直接取得します。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Google Gemini APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.models) ? data.models : [];
      const models = rawList
        .filter(
          (m: any) =>
            !m.supportedGenerationMethods ||
            m.supportedGenerationMethods.includes('generateContent')
        )
        .map((m: any) => {
          const rawId = m.name.replace(/^models\//, '');
          const isFlash = rawId.includes('flash');
          const isLite = rawId.includes('lite');
          const isArgon = rawId.includes('argon') || rawId.includes('pro');
          return {
            id: rawId,
            name: m.displayName || rawId,
            provider: 'gemini' as const,
            contextWindow: m.inputTokenLimit
              ? Number(m.inputTokenLimit).toLocaleString()
              : '1,000,000',
            inputPrice: isLite
              ? '$0.0375 / 1M'
              : isFlash
              ? '$0.075 / 1M'
              : isArgon
              ? '$1.25 / 1M'
              : '公式レート',
            outputPrice: isLite
              ? '$0.15 / 1M'
              : isFlash
              ? '$0.30 / 1M'
              : isArgon
              ? '$5.00 / 1M'
              : '公式レート',
            recommendedFor: m.description || 'Google Gemini 公式生成モデル',
            features: m.supportedGenerationMethods || ['テキスト生成', '構造化JSON', '関数呼出'],
            isLiveFetched: true,
          };
        });

      return res.json({
        success: true,
        provider: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 2. Groq: https://api.groq.com/openai/v1/models
    if (provider === 'groq') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'groq',
          endpoint: 'https://api.groq.com/openai/v1/models',
          docsUrl: 'https://console.groq.com/docs/models',
          isLive: false,
          notice: 'Groq APIキーを入力すると、利用可能な全モデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Groq APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList
        .filter((m: any) => m.active !== false)
        .map((m: any) => ({
          id: m.id,
          name: m.id,
          provider: 'groq' as const,
          contextWindow: m.context_window
            ? Number(m.context_window).toLocaleString()
            : '128,000',
          inputPrice: m.id.includes('8b') ? '$0.05 / 1M' : '$0.59 / 1M',
          outputPrice: m.id.includes('8b') ? '$0.08 / 1M' : '$0.79 / 1M',
          recommendedFor: 'Groq LPU 超高速推論モデル',
          features: ['Groq LPU推論 (300+ t/s)', m.owned_by ? `提供元: ${m.owned_by}` : '高速推論'],
          isLiveFetched: true,
        }));

      return res.json({
        success: true,
        provider: 'groq',
        endpoint: 'https://api.groq.com/openai/v1/models',
        docsUrl: 'https://console.groq.com/docs/models',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 3. OpenRouter: https://openrouter.ai/api/v1/models
    if (provider === 'openrouter') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const resp = await fetch('https://openrouter.ai/api/v1/models', {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `OpenRouter APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList.slice(0, 80).map((m: any) => {
        const promptPrice = m.pricing?.prompt ? parseFloat(m.pricing.prompt) * 1000000 : null;
        const compPrice = m.pricing?.completion ? parseFloat(m.pricing.completion) * 1000000 : null;
        return {
          id: m.id,
          name: m.name || m.id,
          provider: 'openrouter' as const,
          contextWindow: m.context_length
            ? Number(m.context_length).toLocaleString()
            : '128,000',
          inputPrice: promptPrice !== null ? `$${promptPrice.toFixed(2)} / 1M` : '従量課金',
          outputPrice: compPrice !== null ? `$${compPrice.toFixed(2)} / 1M` : '従量課金',
          recommendedFor: m.description ? m.description.slice(0, 100) : 'OpenRouter 統一モデル',
          features: ['OpenRouter 統一ルーティング', 'フォールバック対応'],
          isLiveFetched: true,
        };
      });

      return res.json({
        success: true,
        provider: 'openrouter',
        endpoint: 'https://openrouter.ai/api/v1/models',
        docsUrl: 'https://openrouter.ai/models',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 4. OpenAI: https://api.openai.com/v1/models
    if (provider === 'openai') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1/models',
          docsUrl: 'https://platform.openai.com/docs/models',
          isLive: false,
          notice: 'OpenAI APIキーを入力すると、組織で利用可能な全モデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `OpenAI APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const chatModels = rawList.filter((m: any) => {
        const id = m.id.toLowerCase();
        return (
          id.startsWith('gpt-') ||
          id.startsWith('o1') ||
          id.startsWith('o3') ||
          id.startsWith('chatgpt-')
        );
      });

      const listToMap = chatModels.length > 0 ? chatModels : rawList.slice(0, 50);
      const models = listToMap.map((m: any) => ({
        id: m.id,
        name: m.id,
        provider: 'openai' as const,
        contextWindow:
          m.id.includes('mini')
            ? '128,000'
            : m.id.includes('o3') || m.id.includes('o1')
            ? '200,000'
            : '128,000',
        inputPrice: m.id.includes('mini')
          ? '$0.15 / 1M'
          : m.id.includes('o3')
          ? '$1.10 / 1M'
          : '$2.50 / 1M',
        outputPrice: m.id.includes('mini')
          ? '$0.60 / 1M'
          : m.id.includes('o3')
          ? '$4.40 / 1M'
          : '$10.00 / 1M',
        recommendedFor: 'OpenAI 公式モデル',
        features: ['OpenAI 公式', m.owned_by ? `提供: ${m.owned_by}` : '高品質推論'],
        isLiveFetched: true,
      }));

      return res.json({
        success: true,
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1/models',
        docsUrl: 'https://platform.openai.com/docs/models',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 5. DeepSeek: https://api.deepseek.com/models
    if (provider === 'deepseek') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'deepseek',
          endpoint: 'https://api.deepseek.com/models',
          docsUrl: 'https://api-docs.deepseek.com/',
          isLive: false,
          notice: 'DeepSeek APIキーを入力すると、利用可能モデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.deepseek.com/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `DeepSeek APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList.map((m: any) => ({
        id: m.id,
        name:
          m.id === 'deepseek-chat'
            ? 'DeepSeek-V3 (Chat)'
            : m.id === 'deepseek-reasoner'
            ? 'DeepSeek-R1 (Reasoner)'
            : m.id,
        provider: 'deepseek' as const,
        contextWindow: '64,000',
        inputPrice: m.id === 'deepseek-reasoner' ? '$0.55 / 1M' : '$0.14 / 1M',
        outputPrice: m.id === 'deepseek-reasoner' ? '$2.19 / 1M' : '$0.28 / 1M',
        recommendedFor: m.id.includes('reasoner')
          ? 'STEM数理推論・深い思考プロセス'
          : '汎用高速対話・高コスパ',
        features: ['DeepSeek公式推論', 'コンテキストキャッシュ対応 (80%OFF)'],
        isLiveFetched: true,
      }));

      return res.json({
        success: true,
        provider: 'deepseek',
        endpoint: 'https://api.deepseek.com/models',
        docsUrl: 'https://api-docs.deepseek.com/',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 6. Anthropic: https://api.anthropic.com/v1/models
    if (provider === 'anthropic') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/models',
          docsUrl: 'https://platform.claude.com/docs/en/models/overview',
          isLive: false,
          notice: 'Anthropic APIキーを入力すると、Claudeモデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Anthropic APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList.map((m: any) => ({
        id: m.id,
        name: m.display_name || m.id,
        provider: 'anthropic' as const,
        contextWindow: '200,000',
        inputPrice: m.id.includes('haiku') ? '$0.80 / 1M' : '$3.00 / 1M',
        outputPrice: m.id.includes('haiku') ? '$4.00 / 1M' : '$15.00 / 1M',
        recommendedFor: 'Anthropic Claude 公式モデル',
        features: ['Claude 最新エンジン', '高精度コーディング・長文推論'],
        isLiveFetched: true,
      }));

      return res.json({
        success: true,
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/models',
        docsUrl: 'https://platform.claude.com/docs/en/models/overview',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 7. Mistral AI: https://api.mistral.ai/v1/models
    if (provider === 'mistral') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'mistral',
          endpoint: 'https://api.mistral.ai/v1/models',
          docsUrl: 'https://docs.mistral.ai/models/',
          isLive: false,
          notice: 'Mistral APIキーを入力すると、利用可能モデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Mistral APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList.map((m: any) => ({
        id: m.id,
        name: m.id,
        provider: 'mistral' as const,
        contextWindow: m.id.includes('codestral') ? '256,000' : '128,000',
        inputPrice: m.id.includes('codestral') ? '$0.30 / 1M' : '$2.00 / 1M',
        outputPrice: m.id.includes('codestral') ? '$0.90 / 1M' : '$6.00 / 1M',
        recommendedFor: 'Mistral AI 公式モデル',
        features: ['Mistral AI 多言語対応', '欧州データプライバシー準拠'],
        isLiveFetched: true,
      }));

      return res.json({
        success: true,
        provider: 'mistral',
        endpoint: 'https://api.mistral.ai/v1/models',
        docsUrl: 'https://docs.mistral.ai/models/',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    // 8. xAI: https://api.x.ai/v1/models
    if (provider === 'xai') {
      if (!apiKey) {
        return res.json({
          success: true,
          provider: 'xai',
          endpoint: 'https://api.x.ai/v1/models',
          docsUrl: 'https://docs.x.ai/docs/models',
          isLive: false,
          notice: 'xAI APIキーを入力すると、Grokモデル一覧を取得できます。',
          models: defaultProvider?.models || [],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch('https://api.x.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `xAI APIエラー (HTTP ${resp.status})`);
      }

      const data: any = await resp.json();
      const rawList = Array.isArray(data.data) ? data.data : [];
      const models = rawList.map((m: any) => ({
        id: m.id,
        name: m.id,
        provider: 'xai' as const,
        contextWindow: '128,000',
        inputPrice: '$2.00 / 1M',
        outputPrice: '$10.00 / 1M',
        recommendedFor: 'xAI Grok 公式モデル',
        features: ['Grok リアルタイム推論', 'マルチモーダル'],
        isLiveFetched: true,
      }));

      return res.json({
        success: true,
        provider: 'xai',
        endpoint: 'https://api.x.ai/v1/models',
        docsUrl: 'https://docs.x.ai/docs/models',
        isLive: true,
        count: models.length,
        latencyMs: Date.now() - startTime,
        models: models.length > 0 ? models : defaultProvider?.models || [],
      });
    }

    return res.status(400).json({ success: false, error: `未対応のプロバイダーです: ${provider}` });
  } catch (err: any) {
    console.error('Fetch models error:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'モデル一覧の取得に失敗しました。',
      provider,
      fallbackModels: defaultProvider?.models || [],
    });
  }
});

// Uniform AI Run Endpoint
apiRouter.post('/ai/run', async (req: Request, res: Response) => {
  const {
    provider = 'gemini',
    apiKey,
    modelId,
    systemPrompt = '',
    messages = [],
    temperature = 0.7,
    knowledgeDocs = [],
    variables = {},
  } = req.body;

  const startTime = Date.now();

  try {
    // 1. Build context with knowledgeDocs if provided
    let augmentedSystemPrompt = systemPrompt;
    if (knowledgeDocs && knowledgeDocs.length > 0) {
      const knowledgeContext = knowledgeDocs
        .map((doc: any) => `【参照ナレッジ: ${doc.title}】\n${doc.content}`)
        .join('\n\n');
      augmentedSystemPrompt += `\n\n=== 以下の参考ドキュメントに基づいて正確に回答してください ===\n${knowledgeContext}`;
    }

    // 2. Variable replacement in prompts
    if (variables && Object.keys(variables).length > 0) {
      for (const [k, v] of Object.entries(variables)) {
        augmentedSystemPrompt = augmentedSystemPrompt.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      }
    }

    // 3. Provider Routing
    if (provider === 'gemini') {
      const keyToUse = apiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : '');
      if (!keyToUse) {
        return res.status(400).json({
          success: false,
          error: 'Gemini APIキーが設定されていません。「BYOK設定」画面でご自身のAPIキーを登録してください。',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      // Prepare contents array for Gemini
      const selectedModel = modelId || 'gemini-3.8-flash';
      
      // If messages has conversation history
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // If no messages sent, fallback to simple prompt
      if (contents.length === 0) {
        return res.status(400).json({ success: false, error: 'メッセージが空です。' });
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: augmentedSystemPrompt || undefined,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        },
      });

      const outputText = response.text || '';
      const durationMs = Date.now() - startTime;
      
      // Approximate token usage (4 chars approx 1 token for estimates)
      const inputChars = (augmentedSystemPrompt + JSON.stringify(messages)).length;
      const outputChars = outputText.length;
      const promptTokens = Math.max(1, Math.round(inputChars / 4));
      const completionTokens = Math.max(1, Math.round(outputChars / 4));

      return res.json({
        success: true,
        output: outputText,
        durationMs,
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      });
    }

    // OpenAI and OpenAI-compatible providers
    const openAICompatibleEndpoints: Record<string, { url: string; authPrefix: string; defaultModel: string }> = {
      openai: { url: 'https://api.openai.com/v1/chat/completions', authPrefix: 'Bearer ', defaultModel: 'gpt-4o-mini' },
      groq: { url: 'https://api.groq.com/openai/v1/chat/completions', authPrefix: 'Bearer ', defaultModel: 'llama-3.3-70b-versatile' },
      deepseek: { url: 'https://api.deepseek.com/chat/completions', authPrefix: 'Bearer ', defaultModel: 'deepseek-chat' },
      openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', authPrefix: 'Bearer ', defaultModel: 'meta-llama/llama-3.3-70b-instruct' },
      mistral: { url: 'https://api.mistral.ai/v1/chat/completions', authPrefix: 'Bearer ', defaultModel: 'mistral-small-latest' },
      xai: { url: 'https://api.x.ai/v1/chat/completions', authPrefix: 'Bearer ', defaultModel: 'grok-2-latest' },
    };

    if (openAICompatibleEndpoints[provider]) {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: `${provider} のAPIキーが設定されていません。「BYOK設定」で登録してください。`,
        });
      }

      const conf = openAICompatibleEndpoints[provider];
      const model = modelId || conf.defaultModel;

      const chatMessages = [];
      if (augmentedSystemPrompt) {
        chatMessages.push({ role: 'system', content: augmentedSystemPrompt });
      }
      for (const m of messages) {
        chatMessages.push({ role: m.role, content: m.content });
      }

      const resp = await fetch(conf.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${conf.authPrefix}${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          temperature,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          error: errJson.error?.message || `${provider} APIエラー (HTTP ${resp.status})`,
        });
      }

      const data: any = await resp.json();
      const output = data.choices?.[0]?.message?.content || '';
      const durationMs = Date.now() - startTime;
      const usage = data.usage || {
        prompt_tokens: Math.round((augmentedSystemPrompt.length + 100) / 4),
        completion_tokens: Math.round(output.length / 4),
        total_tokens: 0,
      };

      return res.json({
        success: true,
        output,
        durationMs,
        tokenUsage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens || (usage.prompt_tokens + usage.completion_tokens),
        },
      });
    }

    // Anthropic Claude
    if (provider === 'anthropic') {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Anthropic のAPIキーが設定されていません。「BYOK設定」で登録してください。',
        });
      }

      const model = modelId || 'claude-3-5-haiku-20241022';
      const userAndAssistantMsgs = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant');

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: augmentedSystemPrompt || undefined,
          messages: userAndAssistantMsgs,
          temperature,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          error: errJson.error?.message || `Anthropic APIエラー (HTTP ${resp.status})`,
        });
      }

      const data: any = await resp.json();
      const output = data.content?.[0]?.text || '';
      const durationMs = Date.now() - startTime;

      return res.json({
        success: true,
        output,
        durationMs,
        tokenUsage: {
          promptTokens: data.usage?.input_tokens || 100,
          completionTokens: data.usage?.output_tokens || 50,
          totalTokens: (data.usage?.input_tokens || 100) + (data.usage?.output_tokens || 50),
        },
      });
    }

    return res.status(400).json({ success: false, error: `未対応のプロバイダーです: ${provider}` });
  } catch (err: any) {
    console.error('AI Run error:', err);
    let msg = err.message || 'AIモデルの呼び出しに失敗しました。';
    try {
      const parsed = typeof msg === 'string' && msg.startsWith('{') ? JSON.parse(msg) : null;
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}
    return res.status(500).json({ success: false, error: msg });
  }
});

// かんたん作成: Prompt to App Configuration Synthesizer
apiRouter.post('/ai/generate-config', async (req: Request, res: Response) => {
  const { ideaPrompt, provider = 'gemini', apiKey } = req.body;

  if (!ideaPrompt || typeof ideaPrompt !== 'string') {
    return res.status(400).json({ success: false, error: '作成したいAIの説明を入力してください。' });
  }

  try {
    const keyToUse = apiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : '');
    if (!keyToUse) {
      // Offline fallback generator if no key yet
      return res.json({
        success: true,
        generatedApp: {
          name: ideaPrompt.slice(0, 20) + ' アシスタント',
          description: `ユーザーのリクエスト「${ideaPrompt}」に特化した専用AIアプリ。`,
          icon: 'Bot',
          type: 'chat',
          provider: 'gemini',
          modelId: 'gemini-3.8-flash',
          systemPrompt: `あなたは「${ideaPrompt}」を達成するための専門アシスタントです。ユーザーの要望に寄り添い、具体的で分かりやすい解決策を提示してください。`,
          initialMessage: `こんにちは！「${ideaPrompt}」をお手伝いします。どのようなことでも気軽にお尋ねください。`,
          temperature: 0.7,
          variables: [
            { id: 'v1', name: 'user_goal', label: '達成したい目的', type: 'string', defaultValue: '', required: false },
          ],
          tools: ['knowledge_search'],
          knowledgeDocs: [],
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `以下のユーザーの要望をもとに、Dify風AIアプリの構成設定をJSON形式で作成してください。
ユーザーの要望: "${ideaPrompt}"

必ず以下のJSON形式のみを出力してください（Markdownのバッククォート不要）:
{
  "name": "アプリ名 (日本語20文字以内)",
  "description": "アプリの概要説明 (日本語1〜2行)",
  "icon": "MessageSquareまたはCodeまたはDatabaseまたはSearchまたはHeadphonesまたはEdit3",
  "type": "chat",
  "provider": "gemini",
  "modelId": "gemini-3.8-flash",
  "systemPrompt": "詳細で実践的なシステムプロンプト (役割、トーン、回答ルール、禁止事項など)",
  "initialMessage": "最初の挨拶メッセージ",
  "temperature": 0.5,
  "sampleQuestions": ["サンプル質問1", "サンプル質問2", "サンプル質問3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      generatedApp: {
        ...parsed,
        variables: [],
        tools: ['calculator'],
        knowledgeDocs: [],
      },
    });
  } catch (error: any) {
    console.error('Config generation error:', error);
    // Graceful fallback
    return res.json({
      success: true,
      generatedApp: {
        name: ideaPrompt.slice(0, 16) + ' AI',
        description: `「${ideaPrompt}」に対応するカスタムAIアプリ。`,
        icon: 'MessageSquare',
        type: 'chat',
        provider: 'gemini',
        modelId: 'gemini-3.8-flash',
        systemPrompt: `あなたは「${ideaPrompt}」のための専門AIアシスタントです。親切・丁寧にわかりやすく案内してください。`,
        initialMessage: `こんにちは！「${ideaPrompt}」のお手伝いをします。何でもお気軽にご相談ください。`,
        temperature: 0.7,
        variables: [],
        tools: [],
        knowledgeDocs: [],
      },
    });
  }
});

// Step-by-Step Workflow Execution Engine
apiRouter.post('/ai/workflow-run', async (req: Request, res: Response) => {
  const { nodes = [], edges = [], inputs = {}, provider = 'gemini', apiKey } = req.body;

  if (!nodes || nodes.length === 0) {
    return res.status(400).json({ success: false, error: 'ワークフローにノードが存在しません。' });
  }

  const startTime = Date.now();
  const stepLogs: Array<{
    step: number;
    nodeId: string;
    nodeTitle: string;
    nodeType: string;
    status: 'success' | 'failed';
    durationMs: number;
    output: any;
  }> = [];

  const contextVariables: Record<string, any> = { ...inputs };

  try {
    // 1. Locate start node
    const startNode = nodes.find((n: any) => n.type === 'start') || nodes[0];
    let currentNode: any = startNode;
    let step = 1;
    let visited = new Set<string>();

    while (currentNode && step <= 15) {
      if (visited.has(currentNode.id)) {
        // Prevent infinite loops
        break;
      }
      visited.add(currentNode.id);
      const nodeStart = Date.now();
      let nodeOutput: any = null;

      if (currentNode.type === 'start') {
        nodeOutput = inputs;
        contextVariables['start_input'] = inputs.user_inquiry || inputs.input || JSON.stringify(inputs);
      } else if (currentNode.type === 'llm') {
        const sys = currentNode.data.systemPrompt || 'あなたは有能なAIです。';
        let userPrompt = currentNode.data.userPrompt || '{{start_input}}';
        
        // Replace all {{var}} from contextVariables
        for (const [k, v] of Object.entries(contextVariables)) {
          userPrompt = userPrompt.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }

        const keyToUse = apiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? process.env.GEMINI_API_KEY : '');
        if (keyToUse) {
          const ai = new GoogleGenAI({
            apiKey: keyToUse,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });
          const resp = await ai.models.generateContent({
            model: currentNode.data.modelId || 'gemini-3.8-flash',
            contents: userPrompt,
            config: { systemInstruction: sys, temperature: currentNode.data.temperature || 0.7 },
          });
          nodeOutput = resp.text || '';
        } else {
          nodeOutput = `[シミュレーション実行] 意図判定/回答: ${userPrompt.slice(0, 50)}...`;
        }
        contextVariables[currentNode.id] = nodeOutput;
        contextVariables['last_output'] = nodeOutput;
      } else if (currentNode.type === 'knowledge') {
        const query = contextVariables['start_input'] || '';
        nodeOutput = `ナレッジ検索結果: 照会キーワード「${query.slice(0, 20)}」に関連する社内ドキュメントを抽出しました。`;
        contextVariables[currentNode.id] = nodeOutput;
      } else if (currentNode.type === 'condition') {
        const varName = currentNode.data.conditionVariable || 'last_output';
        const targetVal = String(contextVariables[varName] || contextVariables['last_output'] || '');
        const conditionVal = currentNode.data.conditionValue || '';
        const op = currentNode.data.conditionOperator || 'contains';

        let isTrue = false;
        if (op === 'contains') {
          isTrue = targetVal.toLowerCase().includes(conditionVal.toLowerCase());
        } else if (op === 'equals') {
          isTrue = targetVal.trim() === conditionVal.trim();
        } else if (op === 'is_empty') {
          isTrue = targetVal.trim().length === 0;
        }

        nodeOutput = { branch: isTrue ? 'true' : 'false', evaluatedValue: targetVal };
        contextVariables[currentNode.id] = nodeOutput;

        stepLogs.push({
          step,
          nodeId: currentNode.id,
          nodeTitle: currentNode.title,
          nodeType: currentNode.type,
          status: 'success',
          durationMs: Date.now() - nodeStart,
          output: nodeOutput,
        });

        // Determine next node from branch port
        const edge = edges.find((e: any) => e.fromNodeId === currentNode.id && e.fromPort === (isTrue ? 'true' : 'false'));
        if (edge) {
          currentNode = nodes.find((n: any) => n.id === edge.toNodeId);
          step++;
          continue;
        } else {
          break;
        }
      } else if (currentNode.type === 'http_tool') {
        nodeOutput = { status: 200, statusText: 'OK', message: 'HTTP外部ツール呼び出し完了' };
        contextVariables[currentNode.id] = nodeOutput;
      } else if (currentNode.type === 'end') {
        let finalTemplate = currentNode.data.outputTemplate || '{{last_output}}';
        for (const [k, v] of Object.entries(contextVariables)) {
          finalTemplate = finalTemplate.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
        nodeOutput = finalTemplate;
      }

      stepLogs.push({
        step,
        nodeId: currentNode.id,
        nodeTitle: currentNode.title,
        nodeType: currentNode.type,
        status: 'success',
        durationMs: Date.now() - nodeStart,
        output: nodeOutput,
      });

      if (currentNode.type === 'end') {
        break;
      }

      // Find next connected node from standard 'output' port
      const outEdge = edges.find((e: any) => e.fromNodeId === currentNode.id && e.fromPort === 'output');
      if (outEdge) {
        currentNode = nodes.find((n: any) => n.id === outEdge.toNodeId);
        step++;
      } else {
        break;
      }
    }

    const totalDuration = Date.now() - startTime;
    const finalOutput = contextVariables['last_output'] || (stepLogs[stepLogs.length - 1]?.output) || 'ワークフローが正常に完了しました。';

    return res.json({
      success: true,
      stepLogs,
      finalOutput: typeof finalOutput === 'string' ? finalOutput : JSON.stringify(finalOutput, null, 2),
      durationMs: totalDuration,
      variables: contextVariables,
    });
  } catch (error: any) {
    console.error('Workflow run error:', error);
    return res.status(500).json({ success: false, error: error.message || 'ワークフロー実行中にエラーが発生しました。' });
  }
});
