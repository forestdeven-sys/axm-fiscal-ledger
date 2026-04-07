'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PiggyBank,
  Repeat,
  TrendingUp,
  Target,
  Link2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  LogOut,
  UserCircle,
} from 'lucide-react';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'accounts', label: 'Connected Accounts', icon: Link2 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'credit', label: 'Credit Score', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

interface AppSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  layoutSettings: {
    sidebarPosition: 'left' | 'right';
    chatPanelOpen: boolean;
    chatPanelWidth: number;
    chatPanelPosition: 'left' | 'right';
  };
  updateLayoutSettings: (settings: Partial<typeof layoutSettings>) => void;
  onSignOut: () => void;
}

export function AppSidebar({ 
  open, 
  setOpen, 
  activeTab, 
  setActiveTab,
  layoutSettings,
  updateLayoutSettings,
  onSignOut,
}: AppSidebarProps) {
  const isRight = layoutSettings.sidebarPosition === 'right';
  const chatPanelOpen = layoutSettings.chatPanelOpen;
  const chatPanelPosition = layoutSettings.chatPanelPosition;

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 h-screen border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300',
        isRight ? 'right-0 border-l' : 'left-0 border-r',
        open ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex h-14 items-center justify-between border-b border-border/50 px-3',
        isRight && 'flex-row-reverse'
      )}>
        {open && (
          <div className={cn('flex items-center gap-2', isRight && 'flex-row-reverse')}>
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
              <span className="font-bold text-background text-xs">A</span>
            </div>
            <span className="font-semibold text-sm">
              <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">Axiom</span>
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          {open ? (
            isRight ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            isRight ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto py-2 px-2">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                  'hover:bg-accent/50 hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  !open && 'justify-center',
                  isRight && 'flex-row-reverse'
                )}
                title={!open ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-cyan-500')} />
                {open && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer - FIXED AT BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-sm p-2">
        {/* Toggle Chat Button */}
        {open && (
          <button
            onClick={() => updateLayoutSettings({ chatPanelOpen: !chatPanelOpen })}
            className={cn(
              'w-full flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all mb-1',
              isRight && 'flex-row-reverse'
            )}
          >
            {isRight ? (
              chatPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />
            ) : (
              chatPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />
            )}
            <span className="truncate">{chatPanelOpen ? 'Hide' : 'Show'} AI Chat</span>
          </button>
        )}
        
        {/* Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
            'hover:bg-accent/50 hover:text-accent-foreground',
            activeTab === 'settings'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground',
            !open && 'justify-center',
            isRight && 'flex-row-reverse'
          )}
          title={!open ? 'Settings' : undefined}
        >
          <Settings className={cn('h-4 w-4 shrink-0', activeTab === 'settings' && 'text-cyan-500')} />
          {open && <span>Settings</span>}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className={cn(
            'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
            'hover:bg-accent/50 hover:text-accent-foreground text-muted-foreground',
            !open && 'justify-center',
            isRight && 'flex-row-reverse'
          )}
          title={!open ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {open && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
