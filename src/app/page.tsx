'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
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
    const checkAuth = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      setSession(supabaseSession);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== '/signin') {
        router.push('/signin');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, supabase]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (themeSettings.mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    root.setAttribute('data-color-scheme', themeSettings.colorScheme);
    root.style.setProperty('--axiom-primary', themeSettings.accentColor);
  }, [themeSettings]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !session && pathname !== '/signin') {
      router.push('/signin');
    }
  }, [loading, session, pathname, router]);

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
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
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
        setLayoutSettings={setLayoutSettings}
        session={session}
        supabase={supabase}
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
              <span>Signed in as {session.user?.email}</span>
              <span className="text-border">|</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
