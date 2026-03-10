'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Globe,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  "How can I save more money this month?",
  "What are my biggest spending categories?",
  "Find subscriptions I could cancel",
  "How much am I spending on food?",
  "Give me budget recommendations",
  "Where can I cut costs?",
];

export function AIChat() {
  const {
    currentChatSession,
    chatSessions,
    agents,
    activeAgentId,
    transactions,
    budgets,
    subscriptions,
    documents,
    createChatSession,
    addChatMessage,
    updateChatMessage,
    clearChatSessions,
    layoutSettings,
    aiSettings,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgent = agents.find(a => a.id === activeAgentId);

  // Create initial session if none exists
  useEffect(() => {
    if (!currentChatSession) {
      createChatSession(activeAgentId);
    }
  }, [currentChatSession, createChatSession, activeAgentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChatSession?.messages]);

  // Build financial context
  const buildFinancialContext = () => {
    const now = new Date();
    const thisMonthTx = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const totalSpent = thisMonthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = thisMonthTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);

    // Get category breakdown
    const categories: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === 'debit').forEach(t => {
      const cat = t.userCategory || t.aiCategory || t.category || 'Other';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Active subscriptions
    const activeSubs = subscriptions.filter(s => s.isActive);
    const monthlySubCost = activeSubs.reduce((sum, s) => {
      if (s.frequency === 'monthly') return sum + s.amount;
      if (s.frequency === 'weekly') return sum + (s.amount * 4.33);
      if (s.frequency === 'quarterly') return sum + (s.amount / 3);
      if (s.frequency === 'yearly') return sum + (s.amount / 12);
      return sum;
    }, 0);

    return `
User's Financial Snapshot:
- Date: ${now.toLocaleDateString()}
- Transactions this month: ${thisMonthTx.length}
- Total spent this month: $${totalSpent.toFixed(2)}
- Total income this month: $${totalIncome.toFixed(2)}
- Net cash flow: $${(totalIncome - totalSpent).toFixed(2)}

Top Spending Categories:
${topCategories.map(c => `- ${c.name}: $${c.amount.toFixed(2)}`).join('\n')}

Active Subscriptions: ${activeSubs.length} (${monthlySubCost.toFixed(2)}/month)
${activeSubs.slice(0, 5).map(s => `- ${s.name}: $${s.amount.toFixed(2)}/${s.frequency}`).join('\n')}

Budgets Set: ${budgets.length}
${budgets.map(b => `- ${b.name}: $${b.spent.toFixed(2)} / $${b.limit.toFixed(2)}`).join('\n')}

Documents Available: ${documents.length}
${documents.map(d => `- ${d.name} (${d.type})`).join('\n')}
    `.trim();
  };

  // Send message
  const sendMessage = async (message?: string) => {
    const messageText = message || input.trim();
    if (!messageText || isLoading) return;

    if (!currentChatSession) {
      createChatSession(activeAgentId);
    }

    addChatMessage({ role: 'user', content: messageText });
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          financialContext: buildFinancialContext(),
          agentPrompt: activeAgent?.systemPrompt,
          enableWebSearch: activeAgent?.hasWebSearch && aiSettings.webSearchEnabled,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to get response. Please try again.';
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        addChatMessage({ role: 'assistant', content: '' });
        const messages = useAppStore.getState().currentChatSession?.messages || [];
        const lastMessage = messages[messages.length - 1];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  const currentMessages = useAppStore.getState().currentChatSession?.messages || [];
                  const lastMsg = currentMessages[currentMessages.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    updateChatMessage(lastMsg.id, lastMsg.content + data.content);
                  }
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleNewChat = () => {
    createChatSession(activeAgentId);
    setInput('');
  };

  const messages = currentChatSession?.messages || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--axiom-primary)] to-[var(--axiom-secondary)] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{activeAgent?.name || 'Axiom AI'}</h2>
            <p className="text-xs text-muted-foreground">
              {activeAgent?.hasWebSearch && aiSettings.webSearchEnabled && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Web Search Enabled
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Agent Selector */}
      {agents.length > 1 && (
        <div className="flex gap-1 p-2 border-b border-border/30 overflow-x-auto">
          {agents.filter(a => a.isActive).map((agent) => (
            <Badge
              key={agent.id}
              variant={agent.id === activeAgentId ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer shrink-0 text-xs",
                agent.id === activeAgentId && "bg-[var(--axiom-primary)] text-background"
              )}
              onClick={() => useAppStore.getState().setActiveAgent(agent.id)}
            >
              {agent.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Bot className="h-10 w-10 text-[var(--axiom-primary)] mb-3" />
            <h3 className="font-semibold text-sm mb-1">How can I help?</h3>
            <p className="text-muted-foreground text-center text-xs mb-3 max-w-xs">
              Ask about your finances, get budget advice, or find ways to save
            </p>

            <div className="space-y-1.5 w-full max-w-xs">
              {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start h-auto py-2 px-3 text-left w-full"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  <span className="text-xs">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback
                    className={
                      msg.role === 'user'
                        ? 'bg-[var(--axiom-primary)] text-background text-xs'
                        : 'bg-[var(--axiom-secondary)] text-background text-xs'
                    }
                  >
                    {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 rounded-lg p-2.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-[var(--axiom-primary)]/10 ml-auto max-w-[85%]'
                      : 'bg-muted/50 max-w-[85%]'
                  }`}
                >
                  <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-[var(--axiom-secondary)] text-background text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <Loader2 className="h-3 w-3 animate-spin text-[var(--axiom-primary)]" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-9 text-sm"
          />
          <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Chat Panel Wrapper
export function ChatPanel() {
  const { layoutSettings, updateLayoutSettings } = useAppStore();

  const isRight = layoutSettings.chatPanelPosition === 'right';

  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 z-40 bg-background border-border/50",
        isRight ? "right-0 border-l" : "left-0 border-r"
      )}
      style={{ width: layoutSettings.chatPanelWidth }}
    >
      <AIChat />
    </div>
  );
}
