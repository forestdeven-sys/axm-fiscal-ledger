'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';

export default function AxiomFinance() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [layoutSettings, setLayoutSettings] = useState({
    sidebarPosition: 'left' as 'left' | 'right',
    chatPanelOpen: false,
    chatPanelWidth: 320,
    chatPanelPosition: 'right' as 'left' | 'right',
  });
  const [themeSettings, setThemeSettings] = useState({
    mode: 'dark' as 'light' | 'dark',
    colorScheme: 'cyan',
    accentColor: '#00e5ff',
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.setAttribute('data-color-scheme', 'cyan');
    root.style.setProperty('--axiom-primary', '#00e5ff');
  }, []);

  // Redirect to signin if no session (only after loading completes)
  useEffect(() => {
    if (!loading && !session) {
      router.push('/signin');
    }
  }, [loading, session, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const updateLayoutSettings = (newSettings: Partial<typeof layoutSettings>) => {
    setLayoutSettings(prev => ({ ...prev, ...newSettings }));
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const isRight = layoutSettings.sidebarPosition === 'right';
  const sidebarWidth = sidebarOpen ? 256 : 64;
  const chatWidth = layoutSettings.chatPanelOpen ? layoutSettings.chatPanelWidth : 0;
  const chatIsRight = layoutSettings.chatPanelPosition === 'right';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        layoutSettings={layoutSettings}
        updateLayoutSettings={updateLayoutSettings}
        onSignOut={handleSignOut}
      />

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
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Axiom Finance</span>
              <span className="text-border">|</span>
              <span>Personal Financial Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{session.user?.email}</span>
              <span className="text-border">|</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
