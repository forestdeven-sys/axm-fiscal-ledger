'use client';

import { useState, useMemo } from 'react';
import { useAppStore, FinancialGoal } from '@/store';
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
  Target,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Calendar,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GOAL_TYPES: FinancialGoal['type'][] = ['savings', 'debt_payoff', 'investment', 'emergency_fund', 'custom'];

const GOAL_ICONS: Record<FinancialGoal['type'], React.ElementType> = {
  savings: PiggyBank,
  debt_payoff: DollarSign,
  investment: TrendingUp,
  emergency_fund: Zap,
  custom: Target,
};

const GOAL_COLORS: Record<FinancialGoal['type'], string> = {
  savings: '#22c55e',
  debt_payoff: '#ef4444',
  investment: '#3b82f6',
  emergency_fund: '#f97316',
  custom: '#a855f7',
};

export function GoalsTracker() {
  const { financialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'savings' as FinancialGoal['type'],
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const totalSaved = financialGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = financialGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const end = new Date(deadline);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;

    addFinancialGoal({
      id: crypto.randomUUID(),
      name: newGoal.name,
      type: newGoal.type,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline || undefined,
      color: GOAL_COLORS[newGoal.type],
    });

    setNewGoal({
      name: '',
      type: 'savings',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
    });
    setShowAddDialog(false);
  };

  const handleContribute = (goalId: string) => {
    const amount = parseFloat(prompt('Enter contribution amount:') || '0');
    if (amount > 0) {
      const goal = financialGoals.find(g => g.id === goalId);
      if (goal) {
        updateFinancialGoal(goalId, {
          currentAmount: goal.currentAmount + amount,
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set targets and track your progress
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Financial Goal</DialogTitle>
              <DialogDescription>
                Set a target and track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Name</label>
                <Input
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Type</label>
                <Select
                  value={newGoal.type}
                  onValueChange={(v) => setNewGoal({ ...newGoal, type: v as FinancialGoal['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Goal</SelectItem>
                    <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                    <SelectItem value="investment">Investment Goal</SelectItem>
                    <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Amount</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Amount</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Date (Optional)</label>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview */}
      {financialGoals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-[var(--axiom-primary)]/10 to-transparent border-[var(--axiom-primary)]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[var(--axiom-primary)]/20 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-[var(--axiom-primary)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {financialGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isComplete = progress >= 100;
            const daysRemaining = getDaysRemaining(goal.deadline);
            const Icon = GOAL_ICONS[goal.type];
            const color = goal.color || GOAL_COLORS[goal.type];

            return (
              <Card
                key={goal.id}
                className={cn(
                  "bg-card/50 border-border/50 transition-all hover:shadow-lg",
                  isComplete && "border-green-500/50"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {goal.name}
                          {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {goal.type.replace('_', ' ')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{ borderColor: color, color }}
                    >
                      {progress.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="font-medium" style={{ color }}>
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} to go
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between">
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {daysRemaining !== null && (
                          daysRemaining > 0 
                            ? `${daysRemaining} days left`
                            : daysRemaining === 0 
                              ? "Due today!"
                              : `${Math.abs(daysRemaining)} days overdue`
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContribute(goal.id)}
                        disabled={isComplete}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Funds
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => deleteFinancialGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Goals Set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first financial goal to start tracking
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {financialGoals.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  Set up automatic transfers to your savings goals each payday for consistent progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
