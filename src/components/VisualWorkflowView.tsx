import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Save,
  Plus,
  Trash2,
  GitFork,
  Bot,
  Database,
  Globe,
  CheckCircle,
  HelpCircle,
  X,
  Clock,
  ArrowRight,
  Maximize2,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { AIApp, WorkflowGraph, WorkflowNode, WorkflowEdge, NodeType, BYOKCredential, AIProvider } from '../types';
import { PROVIDERS_CATALOG } from '../data/models';
import { getStoredModels } from '../services/storage';

interface VisualWorkflowViewProps {
  app: AIApp;
  onSave: (app: AIApp) => void;
  byokList: Record<string, BYOKCredential>;
  onOpenBYOK: () => void;
}

export const VisualWorkflowView: React.FC<VisualWorkflowViewProps> = ({
  app,
  onSave,
  byokList,
  onOpenBYOK,
}) => {
  // Graph state
  const defaultGraph: WorkflowGraph = app.workflowGraph || {
    nodes: [
      {
        id: 'node-start',
        type: 'start',
        title: '開始 (入力受付)',
        x: 80,
        y: 160,
        data: { label: 'ユーザーからの質問・データを受信' },
      },
      {
        id: 'node-llm',
        type: 'llm',
        title: 'LLM 生成モデル',
        x: 380,
        y: 160,
        data: {
          provider: 'gemini',
          modelId: 'gemini-3.8-flash',
          systemPrompt: 'あなたは優秀なAIエージェントです。ユーザーの入力を分析して回答してください。',
          userPrompt: '{{start_input}}',
          temperature: 0.7,
        },
      },
      {
        id: 'node-end',
        type: 'end',
        title: '完了 (出力)',
        x: 700,
        y: 160,
        data: { outputTemplate: '{{last_output}}' },
      },
    ],
    edges: [
      { id: 'e-1', fromNodeId: 'node-start', fromPort: 'output', toNodeId: 'node-llm', toPort: 'input' },
      { id: 'e-2', fromNodeId: 'node-llm', fromPort: 'output', toNodeId: 'node-end', toPort: 'input' },
    ],
  };

  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultGraph.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(defaultGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Connecting line state
  const [connectingStart, setConnectingStart] = useState<{
    nodeId: string;
    port: 'output' | 'true' | 'false';
    x: number;
    y: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Execution runner state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [testInput, setTestInput] = useState('商品が破損して届いたので、交換手続きを教えてください。');
  const [activeStepNodeId, setActiveStepNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Mouse move handler for canvas dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setMousePos({ x: curX, y: curY });

    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggingNodeId) {
            return {
              ...n,
              x: Math.max(20, curX - dragOffset.x),
              y: Math.max(20, curY - dragOffset.y),
            };
          }
          return n;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setConnectingStart(null);
  };

  // Node selection & drag initiation
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  };

  // Connect port handler
  const handleStartConnecting = (
    e: React.MouseEvent,
    nodeId: string,
    port: 'output' | 'true' | 'false'
  ) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setConnectingStart({
      nodeId,
      port,
      x: node.x + 220,
      y: node.y + (port === 'true' ? 35 : port === 'false' ? 65 : 45),
    });
  };

  const handleEndConnecting = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (!connectingStart || connectingStart.nodeId === targetNodeId) {
      setConnectingStart(null);
      return;
    }

    // Check if edge already exists
    const exists = edges.some(
      (edge) =>
        edge.fromNodeId === connectingStart.nodeId &&
        edge.fromPort === connectingStart.port &&
        edge.toNodeId === targetNodeId
    );

    if (!exists) {
      const newEdge: WorkflowEdge = {
        id: `e-${Date.now()}`,
        fromNodeId: connectingStart.nodeId,
        fromPort: connectingStart.port,
        toNodeId: targetNodeId,
        toPort: 'input',
      };
      setEdges((prev) => [...prev, newEdge]);
    }

    setConnectingStart(null);
  };

  // Edge removal
  const handleRemoveEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  // Add new node
  const handleAddNode = (type: NodeType) => {
    const id = `node-${type}-${Date.now().toString().slice(-4)}`;
    let title = 'ノード';
    let data: any = {};

    switch (type) {
      case 'llm':
        title = 'LLM 推論モデル';
        data = {
          provider: 'gemini',
          modelId: 'gemini-3.8-flash',
          systemPrompt: 'あなたは優秀なアシスタントです。',
          userPrompt: '{{input}}',
          temperature: 0.7,
        };
        break;
      case 'condition':
        title = '条件分岐 (If/Else)';
        data = {
          conditionVariable: 'last_output',
          conditionOperator: 'contains',
          conditionValue: '重要',
        };
        break;
      case 'knowledge':
        title = 'ナレッジ検索 (RAG)';
        data = { queryVariable: 'start_input' };
        break;
      case 'http_tool':
        title = '外部HTTPツール';
        data = { httpMethod: 'POST', httpUrl: 'https://api.example.com/webhook' };
        break;
      case 'end':
        title = '完了 (出力)';
        data = { outputTemplate: '{{last_output}}' };
        break;
    }

    const newNode: WorkflowNode = {
      id,
      type,
      title,
      x: 200 + nodes.length * 30,
      y: 120 + nodes.length * 30,
      data,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Remove node
  const handleRemoveNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Save graph to app
  const handleSaveGraph = () => {
    const updatedApp: AIApp = {
      ...app,
      workflowGraph: { nodes, edges },
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedApp);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Run Workflow execution simulation
  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const activeCred = byokList['gemini'];
      const res = await fetch('/api/ai/workflow-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          inputs: { user_inquiry: testInput, input: testInput },
          provider: 'gemini',
          apiKey: activeCred?.apiKey || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '実行に失敗しました');
      }

      setExecutionResult(data);

      // Flash nodes in sequence for execution animation
      if (data.stepLogs) {
        for (const step of data.stepLogs) {
          setActiveStepNodeId(step.nodeId);
          await new Promise((r) => setTimeout(r, 300));
        }
        setActiveStepNodeId(null);
      }
    } catch (err: any) {
      alert(`ワークフロー実行エラー: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Helper to calculate port coordinates
  const getNodePortPos = (nodeId: string, port: 'input' | 'output' | 'true' | 'false') => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    if (port === 'input') {
      return { x: node.x, y: node.y + 40 };
    }
    if (port === 'true') {
      return { x: node.x + 220, y: node.y + 30 };
    }
    if (port === 'false') {
      return { x: node.x + 220, y: node.y + 60 };
    }
    return { x: node.x + 220, y: node.y + 40 };
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* Workflow Canvas Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 px-4 md:px-6 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 text-purple-700">
              <GitFork className="w-4 h-4" />
            </span>
            <h2 className="text-xs md:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {app.name}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {nodes.length}ノード · {edges.length}接続
          </span>
        </div>

        {/* Node addition bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg overflow-x-auto pb-1 lg:pb-1">
          <button
            onClick={() => handleAddNode('llm')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px]"
          >
            <Bot className="w-3 h-3 text-blue-600" />
            <span>+ LLM</span>
          </button>
          <button
            onClick={() => handleAddNode('condition')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px]"
          >
            <GitFork className="w-3 h-3 text-amber-600" />
            <span>+ 条件分岐</span>
          </button>
          <button
            onClick={() => handleAddNode('knowledge')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px]"
          >
            <Database className="w-3 h-3 text-emerald-600" />
            <span>+ ナレッジ</span>
          </button>
          <button
            onClick={() => handleAddNode('http_tool')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px]"
          >
            <Globe className="w-3 h-3 text-indigo-600" />
            <span>+ HTTP</span>
          </button>
          <button
            onClick={() => handleAddNode('end')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px]"
          >
            <CheckCircle className="w-3 h-3 text-rose-600" />
            <span>+ 出力</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className="md:hidden px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[40px] whitespace-nowrap"
          >
            {isInspectorOpen ? 'パネルを閉じる' : '設定パネル'}
          </button>
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px] whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? '実行中...' : '実行'}</span>
          </button>
          <button
            onClick={handleSaveGraph}
            className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[40px] whitespace-nowrap ${
              isSaved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? '保存済' : '保存'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => setSelectedNodeId(null)}
          className="flex-1 canvas-grid bg-slate-50/70 overflow-auto relative cursor-crosshair min-h-full min-w-full"
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {edges.map((edge) => {
              const start = getNodePortPos(edge.fromNodeId, edge.fromPort);
              const end = getNodePortPos(edge.toNodeId, 'input');
              const deltaX = Math.abs(end.x - start.x) * 0.5;
              const pathD = `M ${start.x} ${start.y} C ${start.x + deltaX} ${start.y}, ${end.x - deltaX} ${end.y}, ${end.x} ${end.y}`;

              return (
                <g key={edge.id} className="pointer-events-auto group">
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    className="hover:stroke-blue-600 hover:stroke-[3.5] transition-all cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEdge(edge.id);
                    }}
                  />
                  {/* Small delete hover dot */}
                  <circle
                    cx={(start.x + end.x) / 2}
                    cy={(start.y + end.y) / 2}
                    r="6"
                    className="fill-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEdge(edge.id);
                    }}
                  />
                </g>
              );
            })}

            {/* Connecting in-progress line */}
            {connectingStart && (
              <path
                d={`M ${connectingStart.x} ${connectingStart.y} C ${
                  connectingStart.x + 80
                } ${connectingStart.y}, ${mousePos.x - 80} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
            )}
          </svg>

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isActiveStep = activeStepNodeId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                className={`absolute w-56 bg-white rounded-xl border shadow-sm transition-shadow z-20 cursor-move ${
                  isActiveStep
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                    : isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Node Input Port (except start node) */}
                {node.type !== 'start' && (
                  <div
                    onMouseUp={(e) => handleEndConnecting(e, node.id)}
                    className="absolute -left-2.5 top-9 w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-400 hover:bg-blue-500 hover:border-blue-600 transition-colors cursor-pointer flex items-center justify-center z-30"
                    title="入力ポート"
                  >
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full pointer-events-none" />
                  </div>
                )}

                {/* Node Output Port(s) */}
                {node.type === 'condition' ? (
                  <>
                    {/* True Port */}
                    <div
                      onMouseDown={(e) => handleStartConnecting(e, node.id, 'true')}
                      className="absolute -right-2.5 top-6 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center justify-center z-30"
                      title="Trueポート (ドラッグして接続)"
                    >
                      <span className="text-[8px] font-bold text-emerald-800 pointer-events-none">T</span>
                    </div>
                    {/* False Port */}
                    <div
                      onMouseDown={(e) => handleStartConnecting(e, node.id, 'false')}
                      className="absolute -right-2.5 top-14 w-5 h-5 rounded-full bg-rose-100 border-2 border-rose-500 hover:bg-rose-600 transition-colors cursor-pointer flex items-center justify-center z-30"
                      title="Falseポート (ドラッグして接続)"
                    >
                      <span className="text-[8px] font-bold text-rose-800 pointer-events-none">F</span>
                    </div>
                  </>
                ) : node.type !== 'end' ? (
                  <div
                    onMouseDown={(e) => handleStartConnecting(e, node.id, 'output')}
                    className="absolute -right-2.5 top-9 w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-400 hover:bg-blue-500 hover:border-blue-600 transition-colors cursor-pointer flex items-center justify-center z-30"
                    title="出力ポート (ドラッグして接続)"
                  >
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full pointer-events-none" />
                  </div>
                ) : null}

                {/* Node Card Content */}
                <div className="p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {node.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNode(node.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                    {node.type === 'start' && <p>ユーザー入力トリガー</p>}
                    {node.type === 'llm' && (
                      <p className="truncate">
                        {node.data.provider} · {node.data.modelId}
                      </p>
                    )}
                    {node.type === 'condition' && (
                      <p className="truncate">
                        IF {node.data.conditionOperator} &apos;{node.data.conditionValue}&apos;
                      </p>
                    )}
                    {node.type === 'knowledge' && <p>社内文書・FAQ検索</p>}
                    {node.type === 'http_tool' && <p className="truncate">{node.data.httpMethod} API</p>}
                    {node.type === 'end' && <p>最終レスポンス生成</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Node Inspector / Execution Drawer */}
        <div
          className={`${
            isInspectorOpen
              ? 'fixed inset-x-0 bottom-16 md:static md:w-80 h-80 md:h-auto z-30'
              : 'hidden md:flex md:w-80'
          } border-t md:border-t-0 md:border-l border-slate-200 bg-white flex flex-col justify-between overflow-hidden shadow-xl md:shadow-none shrink-0`}
        >
          <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>ノード設定 & テスト</span>
            </h3>
            {isInspectorOpen && (
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    ノード名
                  </label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) => (n.id === selectedNode.id ? { ...n, title: newTitle } : n))
                      );
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                  />
                </div>

                {selectedNode.type === 'llm' && (() => {
                  const nodeProvider = (selectedNode.data.provider || 'gemini') as AIProvider;
                  const provCatalog = PROVIDERS_CATALOG.find((p) => p.id === nodeProvider) || PROVIDERS_CATALOG[0];
                  const modelsForNode = getStoredModels(nodeProvider) || provCatalog.models;

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                            AIプロバイダー
                          </label>
                          <select
                            value={nodeProvider}
                            onChange={(e) => {
                              const newProv = e.target.value as AIProvider;
                              const newCat = PROVIDERS_CATALOG.find((p) => p.id === newProv);
                              const cached = getStoredModels(newProv);
                              const defaultModelId = cached?.[0]?.id || newCat?.defaultModel || 'gemini-3.8-flash';
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id
                                    ? {
                                        ...n,
                                        data: {
                                          ...n.data,
                                          provider: newProv,
                                          modelId: defaultModelId,
                                        },
                                      }
                                    : n
                                )
                              );
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                          >
                            {PROVIDERS_CATALOG.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                            推論モデル
                          </label>
                          <select
                            value={selectedNode.data.modelId || provCatalog.defaultModel}
                            onChange={(e) => {
                              const newModel = e.target.value;
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, modelId: newModel } }
                                    : n
                                )
                              );
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                          >
                            {modelsForNode.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                            {!modelsForNode.some((m) => m.id === selectedNode.data.modelId) && selectedNode.data.modelId && (
                              <option value={selectedNode.data.modelId}>
                                {selectedNode.data.modelId} (カスタム)
                              </option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          システム指示 (System Prompt)
                        </label>
                        <textarea
                          rows={4}
                          value={selectedNode.data.systemPrompt || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, systemPrompt: val } }
                                  : n
                              )
                            );
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          ユーザープロンプト (変数使用可: {'{{start_input}}'})
                        </label>
                        <input
                          type="text"
                          value={selectedNode.data.userPrompt || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, userPrompt: val } }
                                  : n
                              )
                            );
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]"
                        />
                      </div>
                    </>
                  );
                })()}

                {selectedNode.type === 'condition' && (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        判定条件 (Operator)
                      </label>
                      <select
                        value={selectedNode.data.conditionOperator || 'contains'}
                        onChange={(e) => {
                          const val = e.target.value as 'contains' | 'equals' | 'greater_than' | 'is_empty';
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, conditionOperator: val } }
                                : n
                            )
                          );
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                      >
                        <option value="contains">文字列を含む (contains)</option>
                        <option value="equals">完全一致 (equals)</option>
                        <option value="is_empty">未入力・空 (is_empty)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        一致キーワード
                      </label>
                      <input
                        type="text"
                        value={selectedNode.data.conditionValue || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, conditionValue: val } }
                                : n
                            )
                          );
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'end' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      出力テンプレート
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.data.outputTemplate || '{{last_output}}'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, outputTemplate: val } }
                              : n
                          )
                        );
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                キャンバス上のノードをクリックすると、パラメータを設定できます。
              </div>
            )}

            {/* Test Trigger Box */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-800 block">
                テスト実行入力
              </label>
              <textarea
                rows={2}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="ワークフローに流す問い合わせ内容..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              />
              <button
                onClick={handleRunWorkflow}
                disabled={isRunning}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>テスト実行</span>
              </button>
            </div>

            {/* Execution step result logs */}
            {executionResult && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>実行ステップトレース</span>
                  <span className="font-mono text-emerald-600 font-normal">
                    {executionResult.durationMs}ms
                  </span>
                </div>
                <div className="space-y-2">
                  {executionResult.stepLogs?.map((step: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                        <span>
                          Step {step.step}: {step.nodeTitle}
                        </span>
                        <span className="font-mono text-slate-400">{step.durationMs}ms</span>
                      </div>
                      <p className="text-slate-600 font-mono text-[10px] line-clamp-2">
                        {typeof step.output === 'object'
                          ? JSON.stringify(step.output)
                          : String(step.output)}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    最終出力:
                  </span>
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {executionResult.finalOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
