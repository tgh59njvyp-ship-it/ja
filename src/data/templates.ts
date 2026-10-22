import { TemplateApp } from '../types';

export const TEMPLATES_LIBRARY: TemplateApp[] = [
  {
    id: 'tpl-chatbot',
    title: 'AIチャットボット',
    category: 'chatbot',
    description: '自然で親しみやすい会話を実現する汎用AI対話ボット。トーンやキャラクター設定を自由に変更可能。',
    icon: 'MessageSquare',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは親切で博識、かつ礼儀正しいAIアシスタントです。
ユーザーの質問や相談に対して、明確で分かりやすい日本語で回答してください。
回答は要点を簡潔にまとめ、必要に応じて箇条書きや具体例を交えてください。`,
    initialMessage: 'こんにちは！何かお手伝いできることはありますか？調べ物や日常の疑問、文章の作成など何でもお気軽にどうぞ。',
    variables: [
      { id: 'v1', name: 'user_name', label: 'ユーザー名', type: 'string', defaultValue: 'ゲスト', required: false },
      { id: 'v2', name: 'tone', label: '対話トーン', type: 'select', defaultValue: '親切丁寧', options: ['親切丁寧', 'カジュアル', '専門的・ビジネス'], required: true },
    ],
    tools: ['calculator'],
    knowledgeDocs: [],
    previewPrompt: '最近注目のAI技術のトレンドについて、初心者向けに3行で教えてください。',
    previewOutput: `1. **生成AIの軽量化・高速化**: スマホや小型PCでも動く高効率モデルが普及し、応答速度が劇的に向上しています。
2. **AIエージェントの台頭**: 人の指示を待つだけでなく、自律的にツールを使って調査やタスクをこなすAIが増加しています。
3. **推論特化型モデルの進化**: 考えながら解答するモデル（CoT）により、複雑な数学やプログラミングの精度が飛躍しました。`,
  },
  {
    id: 'tpl-support',
    title: 'Webサイト用サポートAI',
    category: 'support',
    description: 'ECやSaaSのカスタマーサポート向け。FAQや利用規約を遵守しながら、顧客の疑問を即座に解決。',
    icon: 'Headphones',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは「クラウドサービス・カスタマーサポート窓口」のAIスタッフです。
ナレッジベースおよび以下のポリシーを厳格に順守して回答してください。
【ポリシー】
- 丁寧で安心感を与えるカスタマーサポートの敬語を使用します。
- 分からない点や個別のアカウント調査が必要な場合は、「担当オペレーターにお繋ぎいたします」と案内してください。
- 返品期限は購入後30日以内、送料は初期不良時のみ当社負担です。`,
    initialMessage: 'いらっしゃいませ！サポートAIがお手伝いします。ご注文の確認、返品方法、プラン変更などについてご質問ください。',
    variables: [
      { id: 'v_site', name: 'company_name', label: '会社/サービス名', type: 'string', defaultValue: 'Acme Cloud', required: true },
    ],
    tools: ['knowledge_search'],
    knowledgeDocs: [
      {
        id: 'doc-faq-1',
        title: '注文キャンセル・返品ポリシー',
        content: '商品の発送前であればマイページから即時キャンセル可能です。発送後は未開封の場合に限り、到着後30日以内の返品を受付いたします。',
        updatedAt: '2026-03-01',
      },
      {
        id: 'doc-faq-2',
        title: '領収書の発行方法',
        content: '領収書はご注文完了メール記載のURL、またはログイン後マイページの「注文履歴」からPDF形式でダウンロードいただけます。インボイス制度対応です。',
        updatedAt: '2026-03-01',
      },
    ],
    previewPrompt: '注文した商品を返品したいのですが、どのような手続きが必要ですか？',
    previewOutput: 'お問い合わせありがとうございます！商品の返品につきましてご案内いたします。\n\n未開封の商品であれば、お届け後30日以内に限りご返品を承っております。\n1. マイページの「注文履歴」を開きます。\n2. 対象のご注文から「返品申請」を選択してください。\n3. 自動発行される返送コードを貼付し、ご返送をお願いいたします。\n\nなお、初期不良の場合は返送料金を当社にて負担いたしますので、ご安心ください。',
  },
  {
    id: 'tpl-research',
    title: 'AI検索・リサーチエージェント',
    category: 'research',
    description: '市場調査、競合比較、最新トレンドの多角的リサーチとエグゼクティブサマリー作成を実行。',
    icon: 'Search',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたはハイレベルな戦略コンサルタント兼リサーチエージェントです。
与えられた調査テーマについて、客観的な事実に基づき体系的なリサーチレポートを作成してください。
構成：
1. エグゼクティブサマリー
2. 主要な市場トレンドと背景
3. メリットとリスク・課題
4. 今後の展望・アクション提言`,
    initialMessage: 'リサーチエージェントを起動しました。調査したい市場、企業、技術テーマ、競合製品を入力してください。',
    variables: [
      { id: 'v_depth', name: 'research_depth', label: '調査深度', type: 'select', defaultValue: '標準レポート', options: ['要約速報', '標準レポート', '深層分析'], required: true },
    ],
    tools: ['web_search', 'citation_check'],
    knowledgeDocs: [],
    previewPrompt: '2026年におけるローコード・ノーコードAI開発市場の成長要因を調査してください。',
    previewOutput: `## エグゼクティブサマリー
2026年、ノーコードAI開発市場は年平均成長率（CAGR）35%以上で拡大を続けています。最大の牽引役は「BYOK（独自APIキー持ち込み）型のマルチモデル採用」と「業務部門主導の自動化ニーズ」です。

### 主要な成長要因
- **モデルの低価格化・高性能化**: フラッシュ系モデルの普及により、低コストで高精度なカスタムAIの大量運用が可能に。
- **直感的なビジュアルワークフロー**: 開発者がコードを書かずに、APIとLLMを視覚的につなぐインターフェースが標準化。
- **データプライバシーの担保**: 社内データを安全に保持したまま自社専用プロンプトで制御できる環境への需要拡大。`,
  },
  {
    id: 'tpl-code',
    title: 'コード生成AI',
    category: 'code',
    description: 'TypeScript, Python, SQLなどの高品質コード生成、バグ修正、リファクタリング、単体テスト作成を支援。',
    icon: 'Code',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-4-argon',
    systemPrompt: `あなたはシニアソフトウェアエンジニア兼テックリードです。
堅牢で読みやすく、保守性の高いコードを作成してください。
- 原則として型安全（TypeScript等）で、エッジケースのハンドリングを必ず含めます。
- コードブロックには適切なコメントを付与し、設計判断の理由を解説してください。
- 脆弱性（SQLインジェクション、XSS等）への配慮を徹底してください。`,
    initialMessage: 'コード生成・レビューアシスタントです。実装したい機能、言語、または既存コードの修正要望を教えてください。',
    variables: [
      { id: 'v_lang', name: 'target_lang', label: '主要言語', type: 'select', defaultValue: 'TypeScript', options: ['TypeScript', 'Python', 'SQL', 'Go', 'Rust'], required: true },
    ],
    tools: ['syntax_validator'],
    knowledgeDocs: [],
    previewPrompt: 'TypeScriptで、指数バックオフ付きのリトライ処理を行う汎用フェッチ関数を書いてください。',
    previewOutput: `\`\`\`typescript
/**
 * 指数バックオフ付きでPromiseを実行する汎用リトライ関数
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw new Error(\`Max retries (\${maxRetries}) exceeded: \${(error as Error).message}\`);
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
\`\`\``,
  },
  {
    id: 'tpl-summary',
    title: '文書要約・翻訳AI',
    category: 'writing',
    description: '長文記事や議事録、海外ニュースの重要ポイント抽出、自然な日本語・多言語への高精度翻訳。',
    icon: 'FileText',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたはプロフェッショナルな編集者兼多言語翻訳者です。
入力された文章を正確に理解し、以下の形式で出力してください：
1. 【1行要約】
2. 【重要キーポイント（箇条書き3〜5点）】
3. 【指定言語への高精度な自然訳】（原文が外国語の場合は日本語、日本語の場合は自然な英語）`,
    initialMessage: '文書要約・翻訳アシスタントです。要約したい長文や、翻訳したい外国語テキストを貼り付けてください。',
    variables: [
      { id: 'v_len', name: 'summary_length', label: '要約の粒度', type: 'select', defaultValue: '標準（3〜5行）', options: ['超短縮（1行）', '標準（3〜5行）', '詳細な箇条書き'], required: true },
    ],
    tools: [],
    knowledgeDocs: [],
    previewPrompt: '英語の製品アナウンス文を要約・翻訳してください。',
    previewOutput: `【1行要約】新バージョンv2.4のリリースにより、API応答速度が40%向上し、マルチリージョン対応が追加されました。

【重要キーポイント】
- 応答レイテンシの40%削減による高スループット化
- 東京・フランクフルト・オハイオの3リージョンでの分散運用開始
- 既存のREST APIとの完全な後方互換性を維持`,
  },
  {
    id: 'tpl-pdf',
    title: 'PDF・ファイル分析AI',
    category: 'rag',
    description: '契約書、決算書、仕様書などの文書ファイルから重要条項や数値を抽出し、質問に答える分析エージェント。',
    icon: 'Layers',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは専門性の高い文書・ファイルアナリストです。
提供されたドキュメントの記述に厳密に基づいて分析・回答を行ってください。
推測による回答は避け、根拠となる記載箇所（条項番号やページ等）を明示してください。`,
    initialMessage: 'ドキュメント分析AIです。アップロードしたテキストや契約書、仕様書の内容について何でもご質問ください。',
    variables: [
      { id: 'v_strict', name: 'strict_mode', label: '根拠の厳密さ', type: 'select', defaultValue: '高（明記情報のみ回答）', options: ['高（明記情報のみ回答）', '中（常識的推論を含む）'], required: true },
    ],
    tools: ['knowledge_search'],
    knowledgeDocs: [
      {
        id: 'doc-contract-sample',
        title: '秘密保持契約書（サンプル要項）',
        content: '第5条（秘密保持義務）：受領者は本秘密情報を厳重に管理し、開示者の事前書面承諾なく第三者に開示してはならない。本契約の有効期間は締結日より2年間とする。',
        updatedAt: '2026-02-15',
      },
    ],
    previewPrompt: 'この契約における秘密保持義務の有効期間は何年ですか？',
    previewOutput: 'ご提示の文書（第5条：秘密保持義務）によると、秘密情報の保持および本契約の有効期間は**締結日より2年間**と定められています。',
  },
  {
    id: 'tpl-rag',
    title: 'RAG対応の社内ナレッジAI',
    category: 'rag',
    description: '社内規程、業務マニュアル、議事録などのドキュメントを検索し、正確な社内情報だけを回答するセキュアAI。',
    icon: 'Database',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは社内ナレッジ検索アシスタントです。
提供された「社内ナレッジベース」のテキストのみを参照して回答を作成してください。
社内ナレッジに記載がない内容については、「社内マニュアルに記載がございません。総務・情報システム部にご確認ください」と誠実に答えてください。`,
    initialMessage: '社内ナレッジAIです。経費精算ルール、有給申請、セキュリティ規程、リモートワークガイドについて質問できます。',
    variables: [
      { id: 'v_dept', name: 'department', label: '所属部署', type: 'string', defaultValue: '全社共通', required: false },
    ],
    tools: ['knowledge_search'],
    knowledgeDocs: [
      {
        id: 'rag-1',
        title: '経費精算ガイドライン',
        content: '出張旅費および交際費は、発生月の翌月5日までに経費システムより領収書PDFを添付して申請してください。1回3万円以上の支出は事前稟議が必要です。',
        updatedAt: '2026-01-10',
      },
      {
        id: 'rag-2',
        title: 'リモートワーク運用ルール',
        content: '週3日までの在宅勤務を原則許可します。業務開始・終了時はSlackの#timesチャンネルにて報告を行い、社用PC以外の端末からのアクセスは禁止です。',
        updatedAt: '2026-01-10',
      },
    ],
    previewPrompt: '出張で3万5千円の宿泊費がかかりました。事前申請していませんが精算できますか？',
    previewOutput: '「経費精算ガイドライン」によると、1回3万円以上の支出には**事前の稟議承認**が必要と規定されています。\n\n事前申請がない場合は例外承認の手続きが必要となりますので、直属の上長および経理部門へ速やかにご相談ください。なお、通常精算は翌月5日までのシステム申請が必要です。',
  },
  {
    id: 'tpl-sns',
    title: 'SNS投稿生成AI',
    category: 'writing',
    description: 'X (Twitter), LinkedIn, Instagram向けに、エンゲージメントが高まるキャッチーな投稿とハッシュタグを自動生成。',
    icon: 'Share2',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは敏腕SNSマーケターです。
与えられたテーマや告知内容をもとに、ターゲット層の目を引き、クリックや拡散を生む魅力的な投稿を作成してください。
【必須ルール】
- 冒頭1行で強力なフック（興味付け）
- 読みやすい改行と絵文字の適切な配置
- 関連性の高いハッシュタグ（3〜5個）`,
    initialMessage: 'SNSコピーライターです！宣伝したい新サービス、記事のリンク、イベント情報などを入力してください。',
    variables: [
      { id: 'v_platform', name: 'platform', label: '投稿先SNS', type: 'select', defaultValue: 'X (Twitter)', options: ['X (Twitter)', 'LinkedIn', 'Instagram', 'Threads'], required: true },
      { id: 'v_goal', name: 'goal', label: '目的', type: 'select', defaultValue: '拡散・認知獲得', options: ['拡散・認知獲得', 'リンク誘導', '親近感・雑談'], required: true },
    ],
    tools: [],
    knowledgeDocs: [],
    previewPrompt: '新しいノーコードAIビルダーツールを公開した告知ポストを作って！',
    previewOutput: `「AIアプリ、誰でも5分で作れる時代へ。」🚀

本日、Dify風の本格AIビルダーをリリースしました！
プログラミング不要で、あなただけの特化型Botや自動化ワークフローが直感的に完成します。

✨ 特徴:
・GeminiやClaudeなど最新モデルに対応
・ドラッグ＆ドロップのノードエディタ
・Webサイトへの埋め込みも1行で完了

まずは無料デモを触ってみてください👇
#AIツール #ノーコード #業務効率化 #生成AI`,
  },
  {
    id: 'tpl-writing',
    title: 'AIライティングアシスタント',
    category: 'writing',
    description: 'ブログ記事、プレスリリース、メルマガ、ビジネス提案書の構成案から本文執筆までをフルサポート。',
    icon: 'Edit3',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたはプロフェッショナルなビジネスライターです。
読者にとって価値が高く、論理的で説得力のある文章を作成します。
見出し構成（H2, H3）を整え、結論ファースト（PREP法）を意識して執筆してください。`,
    initialMessage: 'ライティングアシスタントです。執筆したい記事のテーマ、想定読者、文字数などのご要望をお聞かせください。',
    variables: [
      { id: 'v_fmt', name: 'format', label: '記事形式', type: 'select', defaultValue: 'ブログ・オウンドメディア', options: ['ブログ・オウンドメディア', 'プレスリリース', '提案書', 'メールマガジン'], required: true },
    ],
    tools: [],
    knowledgeDocs: [],
    previewPrompt: '新入社員向け「業務効率化のための生成AI活用法」の構成案を作成してください。',
    previewOutput: `## 記事構成案：新入社員のための生成AI仕事術

### 1. 導入：なぜ新人が今すぐAIを使うべきなのか？
- 先輩への質問前に「壁打ち」で思考を整理するメリット
- 単なる答え合わせではなく「仮説検証」の相棒にする姿勢

### 2. 明日から使える！3大定番ユースケース
- **メール・日報の推敲**: 敬語マナーと簡潔さのダブルチェック
- **長文資料のサマリー**: 議事録や業界ニュースの要点把握
- **アイデア出し**: 新規企画のブレインストーミング

### 3. 注意すべきセキュリティと注意点
- 機密情報・個人情報の入力厳禁ルール
- ハルシネーション（嘘の回答）を見抜くファクトチェックの習慣`,
  },
  {
    id: 'tpl-agent',
    title: '複数AIを組み合わせたエージェント',
    category: 'agent',
    description: '「企画担当AI」「リサーチ担当AI」「校閲・レビューAI」が自律的に協調して高品質な成果物を出すマルチエージェント。',
    icon: 'Cpu',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-4-argon',
    systemPrompt: `あなたはオーケストレーターAIです。
ユーザーからのリクエストを受けたら、内部で3つの役割（プランナー、クリエイター、批評家）を順次実行し、多角的なフィードバックを反映した最終成果物を作成してください。
【出力形式】
【ステップ1: 企画・骨子】
【ステップ2: 初稿作成】
【ステップ3: 批評と改善点】
【最終成果物】`,
    initialMessage: 'マルチエージェント・オーケストレーターです。複雑な検討が必要な企画や課題を入力してください。複数AIの視点で検証します。',
    variables: [],
    tools: ['calculator', 'web_search'],
    knowledgeDocs: [],
    previewPrompt: '地方自治体向けの健康促進アプリの新規企画を立案してください。',
    previewOutput: `【ステップ1: 企画・骨子】
ターゲットは運動不足を感じる40〜60代市民。歩数に応じた地域振興ポイント付与と地元の健康診断リマインドを連動。

【ステップ2: 初稿作成】
アプリ名「健幸ウォーク＆地域応援」。商店街と提携したクーポン付与機能を主軸とする。

【ステップ3: 批評と改善点】
批評家AI「ポイント原資の持続可能性と、デジタル弱者への配慮が不足している」。改善案：紙のスタンプラリーとの併用窓口の設置。

【最終成果物】
自治体・住民・地元商店街の三方よしを実現する官民連携ヘルスケア基盤案を策定しました。`,
  },
  {
    id: 'tpl-api',
    title: 'Web API連携AI',
    category: 'workflow',
    description: '外部の天気情報APIや社内データベースREST APIと接続し、最新データを動的に取り込んで回答するAI。',
    icon: 'Globe',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたは外部APIおよびライブデータと接続されたインテリジェントBotです。
ユーザーからのリクエストに応じて適切なAPIパラメータを構成し、取得したJSONレスポンスを人間にとって分かりやすい自然言語に整形して回答してください。`,
    initialMessage: 'Web API連携AIです。外部REST APIやWebhookとの通信を行い、リアルタイムデータを反映した回答を提供します。',
    variables: [
      { id: 'v_endpoint', name: 'api_endpoint', label: '対象API URL', type: 'string', defaultValue: 'https://api.example.com/v1/data', required: false },
    ],
    tools: ['http_request'],
    knowledgeDocs: [],
    previewPrompt: '現在のサーバーの負荷ステータスを取得して、分かりやすく報告してください。',
    previewOutput: `📡 **外部APIからの最新ステータス受信完了**

- **CPU使用率**: 24.5%（正常）
- **メモリ消費**: 4.1GB / 16GB（余裕あり）
- **APIレスポンス平均時間**: 48ms
- **稼働状態**: すべての主要マイクロサービスが正常稼働（Nominal）しています。`,
  },
  {
    id: 'tpl-workflow',
    title: '自動化ワークフロー',
    category: 'workflow',
    description: '入力受付 → LLMによる意図分類 → 条件分岐 → データ処理 → 最終回答までをシームレスにパイプライン実行。',
    icon: 'GitFork',
    requiredProvider: 'gemini',
    recommendedModel: 'gemini-3.8-flash',
    systemPrompt: `あなたはワークフロー実行エンジンです。各ステップの入力を確実に次へ引き渡します。`,
    initialMessage: 'ビジュアルワークフローが設定されたパイプラインアプリです。質問を入力すると、定義されたノード群が順次処理を行います。',
    variables: [
      { id: 'v_input', name: 'user_inquiry', label: '問い合わせ文', type: 'string', defaultValue: '', required: true },
    ],
    tools: [],
    knowledgeDocs: [],
    defaultWorkflow: {
      nodes: [
        {
          id: 'node-start',
          type: 'start',
          title: '開始 (入力受付)',
          x: 60,
          y: 120,
          data: { label: 'ユーザーの問い合わせを入力' },
        },
        {
          id: 'node-llm-classify',
          type: 'llm',
          title: '意図分類 LLM',
          x: 320,
          y: 120,
          data: {
            provider: 'gemini',
            modelId: 'gemini-3.8-flash',
            systemPrompt: 'ユーザーの文章が「技術的質問」か「料金・契約質問」かを判定し、「TECH」または「BILLING」とだけ出力してください。',
            userPrompt: '{{user_inquiry}}',
          },
        },
        {
          id: 'node-condition',
          type: 'condition',
          title: '条件分岐 (TECH判定)',
          x: 580,
          y: 120,
          data: {
            conditionVariable: 'node-llm-classify',
            conditionOperator: 'contains',
            conditionValue: 'TECH',
          },
        },
        {
          id: 'node-llm-tech',
          type: 'llm',
          title: 'エンジニア回答生成',
          x: 840,
          y: 40,
          data: {
            provider: 'gemini',
            modelId: 'gemini-3.8-flash',
            systemPrompt: 'あなたはシニアエンジニアです。技術的な疑問にコード例を含めて回答してください。',
            userPrompt: '{{user_inquiry}}',
          },
        },
        {
          id: 'node-llm-billing',
          type: 'llm',
          title: 'サポート回答生成',
          x: 840,
          y: 220,
          data: {
            provider: 'gemini',
            modelId: 'gemini-3.8-flash',
            systemPrompt: 'あなたは料金担当です。契約・支払い・プランについて案内してください。',
            userPrompt: '{{user_inquiry}}',
          },
        },
        {
          id: 'node-end',
          type: 'end',
          title: '完了 (出力)',
          x: 1100,
          y: 120,
          data: {
            outputTemplate: '{{result}}',
          },
        },
      ],
      edges: [
        { id: 'e1', fromNodeId: 'node-start', fromPort: 'output', toNodeId: 'node-llm-classify', toPort: 'input' },
        { id: 'e2', fromNodeId: 'node-llm-classify', fromPort: 'output', toNodeId: 'node-condition', toPort: 'input' },
        { id: 'e3', fromNodeId: 'node-condition', fromPort: 'true', toNodeId: 'node-llm-tech', toPort: 'input' },
        { id: 'e4', fromNodeId: 'node-condition', fromPort: 'false', toNodeId: 'node-llm-billing', toPort: 'input' },
        { id: 'e5', fromNodeId: 'node-llm-tech', fromPort: 'output', toNodeId: 'node-end', toPort: 'input' },
        { id: 'e6', fromNodeId: 'node-llm-billing', fromPort: 'output', toNodeId: 'node-end', toPort: 'input' },
      ],
    },
    previewPrompt: 'APIのレートリミットに達した際のエラーハンドリング方法を教えてください。',
    previewOutput: `[ワークフロー実行完了: 4ステップ / 1,120ms]
判定: TECHルート実行

APIのレートリミット（HTTP 429 Too Many Requests）発生時は、以下のようにHTTPヘッダーの \`Retry-After\` を取得して待機する実装が推奨されます。

\`\`\`typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const delaySec = retryAfter ? parseInt(retryAfter, 10) : 5;
  await new Promise(r => setTimeout(r, delaySec * 1000));
}
\`\`\``,
  },
];
