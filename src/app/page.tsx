'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Dashboard } from '@/components/finance/Dashboard';
import { TransactionsTable } from '@/components/finance/TransactionsTable';
import { ChatPanel } from '@/components/finance/AIChat';
import { Settings } from '@/components/finance/Settings';
import { FileUpload } from '@/components/finance/FileUpload';
import { SubscriptionsManager } from '@/components/finance/SubscriptionsManager';
import { BudgetManager } from '@/components/finance/BudgetManager';
import { InvestmentsTracker } from '@/components/finance/InvestmentsTracker';
import { GoalsTracker } from '@/components/finance/GoalsTracker';
import { CreditScoreTracker } from '@/components/finance/CreditScoreTracker';
import { DocumentsManager } from '@/components/finance/DocumentsManager';
import { ConnectedAccounts } from '@/components/finance/ConnectedAccounts';

export default function AxiomFinance() {
  const { 
    sidebarOpen, 
    activeTab, 
    layoutSettings, 
    themeSettings,
  } = useAppStore();

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply mode
    if (themeSettings.mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', themeSettings.colorScheme);
    
    // Apply accent color as CSS variable
    if (themeSettings.accentColor) {
      root.style.setProperty('--axiom-primary', themeSettings.accentColor);
    }
  }, [themeSettings]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionsTable />;
      case 'upload':
        return <FileUpload />;
      case 'subscriptions':
        return <SubscriptionsManager />;
      case 'budgets':
        return <BudgetManager />;
      case 'investments':
        return <InvestmentsTracker />;
      case 'goals':
        return <GoalsTracker />;
      case 'accounts':
        return <ConnectedAccounts />;
      case 'documents':
        return <DocumentsManager />;
      case 'credit':
        return <CreditScoreTracker />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const isRight = layoutSettings.sidebarPosition === 'right';
  const sidebarWidth = sidebarOpen ? 256 : 64;
  const chatWidth = layoutSettings.chatPanelOpen ? layoutSettings.chatPanelWidth : 0;
  const chatIsRight = layoutSettings.chatPanelPosition === 'right';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Chat Panel */}
      {layoutSettings.chatPanelOpen && <ChatPanel />}

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isRight 
            ? (chatIsRight ? 0 : chatWidth)
            : sidebarWidth + (chatIsRight ? 0 : chatWidth),
          marginRight: isRight 
            ? sidebarWidth + (chatIsRight ? chatWidth : 0)
            : (chatIsRight ? chatWidth : 0),
        }}
      >
        <div className="min-h-screen">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="border-t border-border/30 py-4 px-6 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--axiom-primary)] animate-pulse" />
              <span>Axiom Finance</span>
              <span className="text-border">|</span>
              <span>Personal Financial Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Data stored locally</span>
              <span className="text-border">|</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
