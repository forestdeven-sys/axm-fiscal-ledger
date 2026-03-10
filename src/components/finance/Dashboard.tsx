'use client';

import { useMemo } from 'react';
import { useAppStore, getFinancialSummary, getCategoryBreakdown, getMonthlySpendingTrend, getInvestmentSummary, getCreditScoreInfo } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  CreditCard,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Repeat,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#00e5ff', '#00ff88', '#a855f7', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#ec4899'];

export function Dashboard() {
  const { 
    transactions, 
    subscriptions, 
    investments, 
    budgets,
    creditScore,
    financialGoals,
    connectedAccounts,
    setActiveTab 
  } = useAppStore();

  // Calculate financial summary
  const summary = useMemo(() => getFinancialSummary(transactions), [transactions]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(transactions), [transactions]);
  const monthlyTrend = useMemo(() => getMonthlySpendingTrend(transactions, 6), [transactions]);
  const investmentSummary = useMemo(() => getInvestmentSummary(investments), [investments]);
  const creditInfo = creditScore ? getCreditScoreInfo(creditScore.score) : null;

  // Active subscriptions total
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const monthlySubscriptionCost = activeSubscriptions.reduce((sum, s) => {
    if (s.frequency === 'monthly') return sum + s.amount;
    if (s.frequency === 'weekly') return sum + (s.amount * 4.33);
    if (s.frequency === 'quarterly') return sum + (s.amount / 3);
    if (s.frequency === 'yearly') return sum + (s.amount / 12);
    return sum;
  }, 0);

  // Total balance across connected accounts
  const totalBalance = connectedAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get trend direction
  const getTrendDirection = (value: number) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your complete financial overview at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <Activity className="h-4 w-4 mr-2 text-[var(--axiom-primary)]" />
            Live Updates
          </Badge>
          <Button 
            onClick={() => setActiveTab('accounts')}
            className="gap-2 bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90"
          >
            <Wallet className="h-4 w-4" />
            Link Account
          </Button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-[var(--axiom-primary)]/10 to-transparent border-[var(--axiom-primary)]/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalBalance + investmentSummary.totalValue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {investmentSummary.totalGain >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">+{investmentSummary.totalGainPercent.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">{investmentSummary.totalGainPercent.toFixed(1)}%</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground ml-1">this month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-[var(--axiom-primary)]/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[var(--axiom-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spending</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalSpentThisMonth)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {summary.spendingChange > 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">+{summary.spendingChange.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                    </>
                  ) : summary.spendingChange < 0 ? (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">{summary.spendingChange.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Same as last month</span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(monthlySubscriptionCost)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Repeat className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investments</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(investmentSummary.totalValue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {investmentSummary.totalGain >= 0 ? (
                    <span className="text-sm text-green-500">
                      +{formatCurrency(investmentSummary.totalGain)} all time
                    </span>
                  ) : (
                    <span className="text-sm text-red-500">
                      {formatCurrency(investmentSummary.totalGain)} all time
                    </span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--axiom-primary)]" />
              Spending vs Income
            </CardTitle>
            <CardDescription>Last 6 months cash flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1f', border: '1px solid #333' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="#ef4444" 
                    fill="url(#spendGradient)" 
                    name="Spent"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#00ff88" 
                    fill="url(#incomeGradient)" 
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[var(--axiom-primary)]" />
              Spending by Category
            </CardTitle>
            <CardDescription>This month's breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryBreakdown.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="name"
                    >
                      {categoryBreakdown.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#1a1a1f', border: '1px solid #333' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-sm">{value}</span>}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No spending data yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => setActiveTab('transactions')}>
                    Import Transactions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 5 transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        tx.type === 'credit' ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        {tx.type === 'credit' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[150px]">
                          {tx.merchant || tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      tx.type === 'credit' ? "text-green-500" : "text-red-500"
                    )}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Recurring payments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('subscriptions')}>
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            {activeSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {activeSubscriptions.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Repeat className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sub.frequency}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-400">
                      -{formatCurrency(sub.amount)}
                    </span>
                  </div>
                ))}
                {activeSubscriptions.length > 4 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{activeSubscriptions.length - 4} more subscriptions
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Repeat className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No subscriptions tracked</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Score & Goals */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--axiom-primary)]" />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Credit Score */}
            {creditScore ? (
              <div className="p-4 rounded-lg bg-gradient-to-r from-[var(--axiom-primary)]/10 to-transparent border border-[var(--axiom-primary)]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Credit Score</span>
                  <Badge 
                    style={{ backgroundColor: creditInfo?.color + '20', color: creditInfo?.color }}
                  >
                    {creditInfo?.rating}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{creditScore.score}</span>
                  {creditScore.previousScore && (
                    <span className={cn(
                      "text-sm mb-1",
                      creditScore.score > creditScore.previousScore ? "text-green-500" : "text-red-500"
                    )}>
                      {creditScore.score > creditScore.previousScore ? '+' : ''}
                      {creditScore.score - creditScore.previousScore} pts
                    </span>
                  )}
                </div>
                <Progress 
                  value={(creditScore.score / 850) * 100} 
                  className="mt-2 h-2"
                />
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('credit')}
                className="w-full p-4 rounded-lg border border-dashed border-border/50 hover:border-[var(--axiom-primary)]/50 transition-colors text-center"
              >
                <CreditCard className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Add Credit Score</p>
              </button>
            )}

            {/* Financial Goals Progress */}
            {financialGoals.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Goals Progress</p>
                {financialGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{goal.name}</span>
                      <span className="text-muted-foreground">
                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(goal.currentAmount / goal.targetAmount) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setActiveTab('goals')}
              >
                <Target className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setActiveTab('budgets')}
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-[var(--axiom-primary)]/5 via-[var(--axiom-secondary)]/5 to-[var(--axiom-primary)]/5 border-[var(--axiom-primary)]/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--axiom-primary)] to-[var(--axiom-secondary)] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <div>
                <p className="font-medium">Get AI-Powered Insights</p>
                <p className="text-sm text-muted-foreground">
                  Ask about spending patterns, get budget recommendations, and find savings opportunities
                </p>
              </div>
            </div>
            <Button 
              onClick={() => useAppStore.getState().updateLayoutSettings({ chatPanelOpen: true })}
              className="bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90"
            >
              Open AI Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
