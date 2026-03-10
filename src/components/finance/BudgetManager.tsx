'use client';

import { useState, useMemo } from 'react';
import { useAppStore, Budget, getCategoryBreakdown } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PiggyBank,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BUDGET_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
  'Healthcare', 'Entertainment', 'Personal Care', 'Education', 
  'Shopping', 'Travel', 'Subscriptions', 'Other'
];

const CATEGORY_COLORS: Record<string, string> = {
  'Housing': '#ef4444',
  'Transportation': '#f97316',
  'Food': '#eab308',
  'Utilities': '#22c55e',
  'Insurance': '#14b8a6',
  'Healthcare': '#06b6d4',
  'Entertainment': '#3b82f6',
  'Personal Care': '#8b5cf6',
  'Education': '#a855f7',
  'Shopping': '#ec4899',
  'Travel': '#f43f5e',
  'Subscriptions': '#6366f1',
  'Other': '#71717a',
};

export function BudgetManager() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Calculate spending by category this month
  const categorySpending = useMemo(() => {
    const now = new Date();
    const thisMonthTx = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear() &&
             t.type === 'debit';
    });
    
    const breakdown: Record<string, number> = {};
    thisMonthTx.forEach(t => {
      const cat = t.userCategory || t.aiCategory || t.category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + t.amount;
    });
    
    return breakdown;
  }, [transactions]);

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + categorySpending[b.category] || 0, 0);
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleAddBudget = () => {
    const name = document.getElementById('budget-name') as HTMLInputElement;
    const category = document.getElementById('budget-category') as HTMLSelectElement;
    const limit = document.getElementById('budget-limit') as HTMLInputElement;
    const period = document.getElementById('budget-period') as HTMLSelectElement;

    if (!category.value || !limit.value) return;

    addBudget({
      id: crypto.randomUUID(),
      name: name.value || category.value,
      category: category.value,
      limit: parseFloat(limit.value),
      spent: categorySpending[category.value] || 0,
      period: period.value as Budget['period'],
      startDate: new Date().toISOString(),
      color: CATEGORY_COLORS[category.value],
    });

    setShowAddDialog(false);
  };

  const handleEditBudget = (budget: Budget) => {
    const limit = parseFloat(prompt('New budget limit:', budget.limit.toString()) || '0');
    if (limit > 0) {
      updateBudget(budget.id, { limit });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Budget Planner</h1>
          <p className="text-muted-foreground mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90">
              <Plus className="h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Name (Optional)</label>
                <Input id="budget-name" placeholder="e.g., Monthly Groceries" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select defaultValue="Food">
                  <SelectTrigger id="budget-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Limit</label>
                <Input id="budget-limit" type="number" placeholder="500.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="budget-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-card/50 border-border/50",
          overallProgress > 100 && "border-red-500/50"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">
                  {overallProgress.toFixed(0)}%
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center",
                overallProgress > 100 ? "bg-red-500/20" : overallProgress > 80 ? "bg-yellow-500/20" : "bg-green-500/20"
              )}>
                {overallProgress > 100 ? (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                ) : overallProgress > 80 ? (
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = categorySpending[budget.category] || 0;
            const remaining = budget.limit - spent;
            const progress = (spent / budget.limit) * 100;
            const isOverBudget = progress > 100;
            const isNearLimit = progress > 80 && progress <= 100;
            const color = budget.color || CATEGORY_COLORS[budget.category] || '#71717a';

            return (
              <Card 
                key={budget.id} 
                className={cn(
                  "bg-card/50 border-border/50 transition-all hover:shadow-lg",
                  isOverBudget && "border-red-500/50"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <PiggyBank className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{budget.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {budget.category} • {budget.period}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(spent)} of {formatCurrency(budget.limit)}
                    </span>
                    <span className={cn(
                      "font-medium",
                      isOverBudget ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-green-500"
                    )}>
                      {isOverBudget ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Over by {formatCurrency(Math.abs(remaining))}
                        </span>
                      ) : (
                        `${formatCurrency(remaining)} left`
                      )}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className={cn(
                      "h-3",
                      isOverBudget && "[&>div]:bg-red-500",
                      isNearLimit && "[&>div]:bg-yellow-500"
                    )}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% used</span>
                    {isOverBudget && (
                      <Badge variant="destructive" className="text-xs">
                        Over Budget
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Budgets Set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {budgets.length > 0 && (
        <Card className="bg-gradient-to-r from-[var(--axiom-primary)]/5 to-transparent border-[var(--axiom-primary)]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--axiom-primary)]/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[var(--axiom-primary)]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Budget Tip</p>
                <p className="text-sm text-muted-foreground">
                  Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Adjust your budgets accordingly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
