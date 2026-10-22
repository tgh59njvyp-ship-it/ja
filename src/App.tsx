import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudioView } from './components/StudioView';
import { VisualWorkflowView } from './components/VisualWorkflowView';
import { TemplatesView } from './components/TemplatesView';
import { BYOKSettingsView } from './components/BYOKSettingsView';
import { IntegrationsView } from './components/IntegrationsView';
import { LogsView } from './components/LogsView';
import { QuickCreateModal } from './components/QuickCreateModal';
import { TestChatDrawer } from './components/TestChatDrawer';
import { PublishShareModal } from './components/PublishShareModal';
import { BottomTabBar } from './components/BottomTabBar';

import { AIApp, BYOKCredential, ExecutionLog, IntegrationConnector, TemplateApp } from './types';
import {
  getInitialApps,
  saveApps,
  saveOrUpdateApp,
  deleteApp,
  duplicateApp,
  getStoredBYOK,
  saveBYOKCredential,
  removeBYOKCredential,
  getExecutionLogs,
  clearExecutionLogs,
  getIntegrations,
  saveIntegrations,
  exportWorkspaceData,
  importWorkspaceData,
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apps, setApps] = useState<AIApp[]>([]);
  const [byokList, setByokList] = useState<Record<string, BYOKCredential>>({});
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  // Selected app for Studio or Workflow
  const [activeStudioApp, setActiveStudioApp] = useState<AIApp | null>(null);
  const [activeWorkflowApp, setActiveWorkflowApp] = useState<AIApp | null>(null);

  // Modals and Drawers
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [testChatApp, setTestChatApp] = useState<AIApp | null>(null);
  const [publishModalApp, setPublishModalApp] = useState<AIApp | null>(null);

  // Load initial data on mount
  useEffect(() => {
    const loadedApps = getInitialApps();
    setApps(loadedApps);
    setByokList(getStoredBYOK());
    setIntegrations(getIntegrations());
    setLogs(getExecutionLogs());

    if (loadedApps.length > 0) {
      setActiveStudioApp(loadedApps[0]);
      setActiveWorkflowApp(loadedApps.find((a) => a.type === 'workflow') || loadedApps[0]);
    }
  }, []);

  // Handlers
  const handleSaveApp = (updated: AIApp) => {
    const newApps = saveOrUpdateApp(updated);
    setApps(newApps);
    if (activeStudioApp?.id === updated.id) {
      setActiveStudioApp(updated);
    }
    if (activeWorkflowApp?.id === updated.id) {
      setActiveWorkflowApp(updated);
    }
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('このAIアプリを削除してもよろしいですか？')) {
      const remaining = deleteApp(id);
      setApps(remaining);
      if (activeStudioApp?.id === id) {
        setActiveStudioApp(remaining[0] || null);
      }
      if (activeWorkflowApp?.id === id) {
        setActiveWorkflowApp(remaining.find((a) => a.type === 'workflow') || remaining[0] || null);
      }
    }
  };

  const handleDuplicateApp = (id: string) => {
    const cloned = duplicateApp(id);
    if (cloned) {
      setApps(getInitialApps());
      setActiveStudioApp(cloned);
      setActiveTab('studio');
    }
  };

  const handleCreateEmptyApp = () => {
    const newApp: AIApp = {
      id: `app-${Date.now()}`,
      name: '新規AIアシスタント',
      description: 'ゼロから構成するカスタムAIチャットアプリケーション。',
      icon: 'MessageSquare',
      type: 'chat',
      provider: 'gemini',
      modelId: 'gemini-3.8-flash',
      systemPrompt: 'あなたは親切で有能なAIアシスタントです。',
      initialMessage: 'こんにちは！どのようなことでもお気軽にお尋ねください。',
      temperature: 0.7,
      variables: [],
      tools: ['calculator'],
      knowledgeDocs: [],
      isPublished: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
    };
    saveOrUpdateApp(newApp);
    setApps(getInitialApps());
    setActiveStudioApp(newApp);
    setActiveTab('studio');
  };

  const handleSelectTemplate = (tpl: TemplateApp) => {
    const newApp: AIApp = {
      id: `app-tpl-${Date.now()}`,
      name: tpl.title,
      description: tpl.description,
      icon: tpl.icon,
      type: tpl.category === 'workflow' ? 'workflow' : tpl.category === 'agent' ? 'agent' : 'chat',
      provider: tpl.requiredProvider,
      modelId: tpl.recommendedModel,
      systemPrompt: tpl.systemPrompt,
      initialMessage: tpl.initialMessage,
      temperature: 0.5,
      variables: tpl.variables,
      tools: tpl.tools,
      knowledgeDocs: tpl.knowledgeDocs,
      workflowGraph: tpl.defaultWorkflow,
      isPublished: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
    };

    saveOrUpdateApp(newApp);
    setApps(getInitialApps());

    if (newApp.type === 'workflow') {
      setActiveWorkflowApp(newApp);
      setActiveTab('workflow');
    } else {
      setActiveStudioApp(newApp);
      setActiveTab('studio');
    }
  };

  const handleSaveCredential = (cred: BYOKCredential) => {
    saveBYOKCredential(cred);
    setByokList(getStoredBYOK());
  };

  const handleRemoveCredential = (provider: string) => {
    removeBYOKCredential(provider);
    setByokList(getStoredBYOK());
  };

  const handleSaveConnectors = (newConnectors: IntegrationConnector[]) => {
    saveIntegrations(newConnectors);
    setIntegrations(newConnectors);
  };

  const handleClearLogs = () => {
    if (confirm('実行ログをすべて消去しますか？')) {
      clearExecutionLogs();
      setLogs([]);
    }
  };

  const handleExportWorkspace = () => {
    const jsonStr = exportWorkspaceData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dify-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportWorkspace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importWorkspaceData(content)) {
            alert('ワークスペースのインポートが完了しました！');
            setApps(getInitialApps());
            setByokList(getStoredBYOK());
            setIntegrations(getIntegrations());
            setLogs(getExecutionLogs());
          } else {
            alert('ファイルの読み込みに失敗しました。JSON形式をご確認ください。');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleTogglePublish = (appToToggle: AIApp) => {
    const updated: AIApp = {
      ...appToToggle,
      isPublished: !appToToggle.isPublished,
      publishedUrl: !appToToggle.isPublished
        ? `${window.location.origin}/share/${appToToggle.id}`
        : undefined,
    };
    handleSaveApp(updated);
    setPublishModalApp(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        byokList={byokList}
        onNewApp={handleCreateEmptyApp}
        onExport={handleExportWorkspace}
        onImport={handleImportWorkspace}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          appCount={apps.length}
          byokCount={Object.keys(byokList).length}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area with clearance for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              apps={apps}
              byokList={byokList}
              onOpenStudio={(app) => {
                setActiveStudioApp(app);
                setActiveTab('studio');
              }}
              onOpenWorkflow={(app) => {
                setActiveWorkflowApp(app);
                setActiveTab('workflow');
              }}
              onTestChat={(app) => setTestChatApp(app)}
              onDuplicateApp={handleDuplicateApp}
              onDeleteApp={handleDeleteApp}
              onOpenPublish={(app) => setPublishModalApp(app)}
              onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
              onOpenTemplates={() => setActiveTab('templates')}
              onNewEmptyApp={handleCreateEmptyApp}
            />
          )}

          {activeTab === 'studio' && (
            activeStudioApp ? (
              <StudioView
                app={activeStudioApp}
                onSave={handleSaveApp}
                onDuplicate={handleDuplicateApp}
                onOpenPublish={(app) => setPublishModalApp(app)}
                byokList={byokList}
                onOpenBYOK={() => setActiveTab('byok')}
              />
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                アプリを選択してください。
              </div>
            )
          )}

          {activeTab === 'workflow' && (
            activeWorkflowApp ? (
              <VisualWorkflowView
                app={activeWorkflowApp}
                onSave={handleSaveApp}
                byokList={byokList}
                onOpenBYOK={() => setActiveTab('byok')}
              />
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                ワークフローアプリを選択してください。
              </div>
            )
          )}

          {activeTab === 'templates' && (
            <TemplatesView onSelectTemplate={handleSelectTemplate} />
          )}

          {activeTab === 'byok' && (
            <BYOKSettingsView
              byokList={byokList}
              onSaveCredential={handleSaveCredential}
              onRemoveCredential={handleRemoveCredential}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView
              connectors={integrations}
              onSaveConnectors={handleSaveConnectors}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView logs={logs} onClearLogs={handleClearLogs} />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        byokList={byokList}
        onAppCreated={(newApp) => {
          saveOrUpdateApp(newApp);
          setApps(getInitialApps());
          setActiveStudioApp(newApp);
          setActiveTab('studio');
        }}
      />

      <TestChatDrawer
        app={testChatApp}
        isOpen={Boolean(testChatApp)}
        onClose={() => setTestChatApp(null)}
        byokList={byokList}
        onOpenBYOK={() => {
          setTestChatApp(null);
          setActiveTab('byok');
        }}
      />

      <PublishShareModal
        app={publishModalApp}
        isOpen={Boolean(publishModalApp)}
        onClose={() => setPublishModalApp(null)}
        onTogglePublish={handleTogglePublish}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        byokCount={Object.keys(byokList).length}
      />
    </div>
  );
}
