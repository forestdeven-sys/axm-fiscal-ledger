import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export interface Transaction {
  id: string;
  transactionDate: string;
  clearingDate?: string;
  description: string;
  merchant?: string;
  category?: string;
  type: 'debit' | 'credit' | 'transfer' | 'payment' | 'refund' | 'interest' | 'fee';
  amount: number;
  currency: string;
  source: string;
  sourceFile?: string;
  userCategory?: string;
  tags?: string[];
  notes?: string;
  aiCategory?: string;
  aiConfidence?: number;
  isRecurring: boolean;
  accountId?: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  color?: string;
  icon?: string;
}

export interface Subscription {
  id: string;
  name: string;
  merchant?: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  nextChargeDate?: string;
  lastChargeDate?: string;
  isActive: boolean;
  accountId?: string;
  logo?: string;
  detectedFromTransactions: boolean;
}

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  type: 'stock' | 'crypto' | 'etf' | 'bond' | 'mutual_fund' | 'other';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  accountId?: string;
  logo?: string;
}

export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'brokerage' | 'retirement' | 'crypto';
  institution: string;
  balance: number;
  holdings: Investment[];
  connected: boolean;
}

export interface CreditScore {
  id: string;
  score: number;
  provider: string;
  date: string;
  previousScore?: number;
  factors?: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'custom';
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  icon?: string;
  color?: string;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'investment' | 'crypto_wallet';
  institution: string;
  accountNumber?: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSynced?: string;
  logo?: string;
  color?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'statement' | 'receipt' | 'tax_document' | 'contract' | 'other';
  size: number;
  uploadedAt: string;
  content?: string;
  embedding?: number[];
  tags?: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'budget_optimizer' | 'investment_advisor' | 'general';
  description: string;
  systemPrompt: string;
  model: string;
  isActive: boolean;
  hasWebSearch: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
  usedWebSearch?: boolean;
}

export interface ChatSession {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  agentId?: string;
}

export interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
  webSearchApiKey?: string;
  webSearchEnabled: boolean;
}

export interface ThemeSettings {
  mode: 'dark' | 'light';
  colorScheme: 'cyber' | 'mint' | 'ocean' | 'sunset' | 'purple' | 'rose';
  accentColor: string;
}

export interface LayoutSettings {
  sidebarPosition: 'left' | 'right';
  chatPanelPosition: 'left' | 'right';
  chatPanelOpen: boolean;
  chatPanelWidth: number;
}

// ============================================
// App Store
// ============================================

interface AppState {
  // UI State
  sidebarOpen: boolean;
  activeTab: string;
  
  // Theme & Layout
  themeSettings: ThemeSettings;
  layoutSettings: LayoutSettings;
  
  // User Settings
  settings: {
    currency: string;
    dateFormat: string;
    privacyMode: boolean;
    showCents: boolean;
  };
  
  // AI Settings
  aiSettings: AISettings;
  
  // Finance Data
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  investments: Investment[];
  investmentAccounts: InvestmentAccount[];
  creditScore?: CreditScore;
  creditScoreHistory: CreditScore[];
  financialGoals: FinancialGoal[];
  connectedAccounts: ConnectedAccount[];
  
  // Documents (for RAG)
  documents: Document[];
  
  // AI Agents
  agents: AIAgent[];
  activeAgentId?: string;
  
  // Chat
  currentChatSession: ChatSession | null;
  chatSessions: ChatSession[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  
  // Transaction Actions
  addTransaction: (transaction: Transaction) => void;
  addTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  
  // Budget Actions
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Subscription Actions
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  
  // Investment Actions
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addInvestmentAccount: (account: InvestmentAccount) => void;
  updateInvestmentAccount: (id: string, updates: Partial<InvestmentAccount>) => void;
  
  // Credit Score Actions
  setCreditScore: (score: CreditScore) => void;
  addCreditScoreToHistory: (score: CreditScore) => void;
  
  // Financial Goal Actions
  addFinancialGoal: (goal: FinancialGoal) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  
  // Connected Account Actions
  addConnectedAccount: (account: ConnectedAccount) => void;
  updateConnectedAccount: (id: string, updates: Partial<ConnectedAccount>) => void;
  deleteConnectedAccount: (id: string) => void;
  syncConnectedAccount: (id: string) => Promise<void>;
  
  // Document Actions
  addDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  
  // Agent Actions
  addAgent: (agent: AIAgent) => void;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  setActiveAgent: (id: string | undefined) => void;
  
  // Chat Actions
  createChatSession: (agentId?: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateChatMessage: (id: string, content: string) => void;
  switchChatSession: (sessionId: string) => void;
  clearChatSessions: () => void;
}

// ============================================
// Defaults
// ============================================

const defaultThemeSettings: ThemeSettings = {
  mode: 'dark',
  colorScheme: 'cyber',
  accentColor: '#00e5ff',
};

const defaultLayoutSettings: LayoutSettings = {
  sidebarPosition: 'left',
  chatPanelPosition: 'right',
  chatPanelOpen: false,
  chatPanelWidth: 380,
};

const defaultAISettings: AISettings = {
  provider: 'openrouter',
  model: 'xiaomi/mimo-v2-flash',
  apiKey: '',
  webSearchApiKey: '',
  webSearchEnabled: false,
};

const defaultAgents: AIAgent[] = [
  {
    id: 'budget-optimizer',
    name: 'Budget Optimizer',
    type: 'budget_optimizer',
    description: 'Analyzes your spending patterns and suggests ways to save money',
    systemPrompt: `You are the Axiom Budget Optimizer, an expert financial assistant focused on helping users save money and optimize their budget.

Your approach:
1. **Data-Driven Analysis**: Base all recommendations on actual spending data
2. **Actionable Advice**: Provide specific, concrete steps to save money
3. **Alternative Suggestions**: Recommend more affordable alternatives when possible
4. **Goal-Oriented**: Tailor advice to the user's financial goals

When analyzing spending:
- Identify unnecessary subscriptions or recurring charges
- Find categories where spending is higher than average
- Suggest specific merchants or services that offer better value
- Calculate potential savings from recommended changes

Always be helpful, specific, and focused on measurable outcomes.`,
    model: 'xiaomi/mimo-v2-flash',
    isActive: true,
    hasWebSearch: true,
  },
  {
    id: 'investment-advisor',
    name: 'Investment Advisor',
    type: 'investment_advisor',
    description: 'Provides investment insights and portfolio recommendations',
    systemPrompt: `You are the Axiom Investment Advisor, a knowledgeable guide for personal investing.

Your approach:
1. **Risk-Aware**: Always consider the user's risk tolerance and timeline
2. **Diversification**: Emphasize the importance of portfolio diversification
3. **Long-Term Focus**: Encourage patient, long-term investing strategies
4. **Education First**: Explain concepts clearly before making recommendations

Important disclaimer: You provide educational information only, not personalized financial advice. Always encourage users to consult with licensed professionals for major financial decisions.`,
    model: 'xiaomi/mimo-v2-flash',
    isActive: false,
    hasWebSearch: true,
  },
];

// ============================================
// Store Implementation
// ============================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: true,
      activeTab: 'dashboard',
      
      // Theme & Layout
      themeSettings: defaultThemeSettings,
      layoutSettings: defaultLayoutSettings,
      
      // User Settings
      settings: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        privacyMode: false,
        showCents: true,
      },
      
      // AI Settings
      aiSettings: defaultAISettings,
      
      // Finance Data
      transactions: [],
      budgets: [],
      subscriptions: [],
      investments: [],
      investmentAccounts: [],
      creditScore: undefined,
      creditScoreHistory: [],
      financialGoals: [],
      connectedAccounts: [],
      
      // Documents
      documents: [],
      
      // AI Agents
      agents: defaultAgents,
      activeAgentId: 'budget-optimizer',
      
      // Chat
      currentChatSession: null,
      chatSessions: [],
      
      // UI Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      updateThemeSettings: (newSettings) => set((state) => ({
        themeSettings: { ...state.themeSettings, ...newSettings }
      })),
      updateLayoutSettings: (newSettings) => set((state) => ({
        layoutSettings: { ...state.layoutSettings, ...newSettings }
      })),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      updateAISettings: (newSettings) => set((state) => ({
        aiSettings: { ...state.aiSettings, ...newSettings }
      })),
      
      // Transaction Actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      addTransactions: (newTransactions) => set((state) => ({
        transactions: [...newTransactions, ...state.transactions]
      })),
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      })),
      clearTransactions: () => set({ transactions: [] }),
      
      // Budget Actions
      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, budget]
      })),
      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, ...updates } : b
        )
      })),
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id)
      })),
      
      // Subscription Actions
      addSubscription: (subscription) => set((state) => ({
        subscriptions: [...state.subscriptions, subscription]
      })),
      updateSubscription: (id, updates) => set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      deleteSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id)
      })),
      
      // Investment Actions
      addInvestment: (investment) => set((state) => ({
        investments: [...state.investments, investment]
      })),
      updateInvestment: (id, updates) => set((state) => ({
        investments: state.investments.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        )
      })),
      deleteInvestment: (id) => set((state) => ({
        investments: state.investments.filter((i) => i.id !== id)
      })),
      addInvestmentAccount: (account) => set((state) => ({
        investmentAccounts: [...state.investmentAccounts, account]
      })),
      updateInvestmentAccount: (id, updates) => set((state) => ({
        investmentAccounts: state.investmentAccounts.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      
      // Credit Score Actions
      setCreditScore: (score) => set({ creditScore: score }),
      addCreditScoreToHistory: (score) => set((state) => ({
        creditScoreHistory: [...state.creditScoreHistory, score]
      })),
      
      // Financial Goal Actions
      addFinancialGoal: (goal) => set((state) => ({
        financialGoals: [...state.financialGoals, goal]
      })),
      updateFinancialGoal: (id, updates) => set((state) => ({
        financialGoals: state.financialGoals.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        )
      })),
      deleteFinancialGoal: (id) => set((state) => ({
        financialGoals: state.financialGoals.filter((g) => g.id !== id)
      })),
      
      // Connected Account Actions
      addConnectedAccount: (account) => set((state) => ({
        connectedAccounts: [...state.connectedAccounts, account]
      })),
      updateConnectedAccount: (id, updates) => set((state) => ({
        connectedAccounts: state.connectedAccounts.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      deleteConnectedAccount: (id) => set((state) => ({
        connectedAccounts: state.connectedAccounts.filter((a) => a.id !== id)
      })),
      syncConnectedAccount: async (id) => {
        // Simulate sync
        await new Promise(resolve => setTimeout(resolve, 1500));
        set((state) => ({
          connectedAccounts: state.connectedAccounts.map((a) =>
            a.id === id ? { ...a, lastSynced: new Date().toISOString() } : a
          )
        }));
      },
      
      // Document Actions
      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document]
      })),
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== id)
      })),
      
      // Agent Actions
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      deleteAgent: (id) => set((state) => ({
        agents: state.agents.filter((a) => a.id !== id)
      })),
      setActiveAgent: (id) => set({ activeAgentId: id }),
      
      // Chat Actions
      createChatSession: (agentId) => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          messages: [],
          createdAt: new Date().toISOString(),
          agentId,
        };
        set((state) => ({
          currentChatSession: newSession,
          chatSessions: [...state.chatSessions, newSession]
        }));
      },
      addChatMessage: (message) => set((state) => {
        if (!state.currentChatSession) return state;
        
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };
        
        const updatedSession = {
          ...state.currentChatSession,
          messages: [...state.currentChatSession.messages, newMessage],
        };
        
        return {
          currentChatSession: updatedSession,
          chatSessions: state.chatSessions.map((s) =>
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      }),
      updateChatMessage: (id, content) => set((state) => {
        if (!state.currentChatSession) return state;
        
        const updatedSession = {
          ...state.currentChatSession,
          messages: state.currentChatSession.messages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        };
        
        return {
          currentChatSession: updatedSession,
          chatSessions: state.chatSessions.map((s) =>
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      }),
      switchChatSession: (sessionId) => set((state) => ({
        currentChatSession: state.chatSessions.find((s) => s.id === sessionId) || null
      })),
      clearChatSessions: () => set({ chatSessions: [], currentChatSession: null }),
    }),
    {
      name: 'axiom-personal-finance-store',
      partialize: (state) => ({
        themeSettings: state.themeSettings,
        layoutSettings: state.layoutSettings,
        settings: state.settings,
        aiSettings: state.aiSettings,
        transactions: state.transactions,
        budgets: state.budgets,
        subscriptions: state.subscriptions,
        investments: state.investments,
        investmentAccounts: state.investmentAccounts,
        creditScore: state.creditScore,
        creditScoreHistory: state.creditScoreHistory,
        financialGoals: state.financialGoals,
        connectedAccounts: state.connectedAccounts,
        documents: state.documents,
        agents: state.agents,
        activeAgentId: state.activeAgentId,
        chatSessions: state.chatSessions,
      }),
    }
  )
);

// ============================================
// Helper Functions
// ============================================

export function getFinancialSummary(transactions: Transaction[]) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const date = new Date(t.transactionDate);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  
  const lastMonth = transactions.filter(t => {
    const date = new Date(t.transactionDate);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && 
           date.getFullYear() === lastMonthDate.getFullYear();
  });
  
  const totalSpent = thisMonth.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = thisMonth.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const lastMonthSpent = lastMonth.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalSpentThisMonth: totalSpent,
    totalIncomeThisMonth: totalIncome,
    totalSpentLastMonth: lastMonthSpent,
    netCashFlow: totalIncome - totalSpent,
    transactionCountThisMonth: thisMonth.length,
    transactionCountLastMonth: lastMonth.length,
    spendingChange: lastMonthSpent > 0 ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100 : 0,
  };
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const categories: Record<string, number> = {};
  
  transactions.filter(t => t.type === 'debit').forEach(t => {
    const category = t.userCategory || t.aiCategory || t.category || 'Other';
    categories[category] = (categories[category] || 0) + t.amount;
  });
  
  return Object.entries(categories)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlySpendingTrend(transactions: Transaction[], months: number = 6) {
  const now = new Date();
  const trends: { month: string; spent: number; income: number }[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i);
    const monthTx = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === monthDate.getMonth() && 
             date.getFullYear() === monthDate.getFullYear();
    });
    
    trends.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      spent: monthTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
      income: monthTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
    });
  }
  
  return trends;
}

export function detectSubscriptions(transactions: Transaction[]): Omit<Subscription, 'id' | 'isActive' | 'accountId' | 'logo' | 'detectedFromTransactions'>[] {
  const merchantMap: Record<string, Transaction[]> = {};
  
  transactions.forEach(t => {
    const merchant = t.merchant || t.description;
    if (!merchantMap[merchant]) {
      merchantMap[merchant] = [];
    }
    merchantMap[merchant].push(t);
  });
  
  const subscriptions: Omit<Subscription, 'id' | 'isActive' | 'accountId' | 'logo' | 'detectedFromTransactions'>[] = [];
  
  Object.entries(merchantMap).forEach(([merchant, txs]) => {
    if (txs.length < 2) return;
    
    const sorted = txs.sort((a, b) => 
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );
    
    const amounts = sorted.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, a) => sum + Math.abs(a - avgAmount), 0) / amounts.length;
    
    if (variance / avgAmount < 0.15 && sorted.length >= 2) {
      const dates = sorted.map(t => new Date(t.transactionDate));
      const avgDaysBetween = dates.length > 1 
        ? (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24 * (dates.length - 1))
        : 0;
      
      let frequency: Subscription['frequency'] = 'monthly';
      if (avgDaysBetween >= 6 && avgDaysBetween <= 8) frequency = 'weekly';
      else if (avgDaysBetween >= 28 && avgDaysBetween <= 31) frequency = 'monthly';
      else if (avgDaysBetween >= 85 && avgDaysBetween <= 95) frequency = 'quarterly';
      else if (avgDaysBetween >= 355 && avgDaysBetween <= 375) frequency = 'yearly';
      else return; // Not a regular subscription
      
      subscriptions.push({
        name: merchant,
        merchant,
        amount: avgAmount,
        frequency,
        category: sorted[0].userCategory || sorted[0].aiCategory || sorted[0].category || 'Other',
        nextChargeDate: new Date(dates[dates.length - 1].getTime() + avgDaysBetween * 24 * 60 * 60 * 1000).toISOString(),
        lastChargeDate: sorted[sorted.length - 1].transactionDate,
      });
    }
  });
  
  return subscriptions.sort((a, b) => b.amount - a.amount);
}

export function getInvestmentSummary(investments: Investment[]) {
  const totalValue = investments.reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0);
  const totalCost = investments.reduce((sum, i) => sum + (i.purchasePrice * i.quantity), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  
  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    holdings: investments.length,
  };
}

export function getCreditScoreInfo(score: number) {
  if (score >= 800) return { rating: 'Excellent', color: '#00ff88', description: 'You have exceptional credit' };
  if (score >= 740) return { rating: 'Very Good', color: '#00e5ff', description: 'You have very good credit' };
  if (score >= 670) return { rating: 'Good', color: '#f97316', description: 'You have good credit' };
  if (score >= 580) return { rating: 'Fair', color: '#eab308', description: 'Your credit needs improvement' };
  return { rating: 'Poor', color: '#ef4444', description: 'Your credit needs significant improvement' };
}
