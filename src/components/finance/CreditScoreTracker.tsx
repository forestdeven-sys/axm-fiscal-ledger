'use client';

import { useState, useMemo } from 'react';
import { useAppStore, CreditScore, getCreditScoreInfo } from '@/store';
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
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CREDIT_PROVIDERS = ['Experian', 'Equifax', 'TransUnion', 'Credit Karma', 'Other'];

const SCORE_RANGES = [
  { min: 300, max: 579, label: 'Poor', color: '#ef4444', description: 'Needs significant improvement' },
  { min: 580, max: 669, label: 'Fair', color: '#eab308', description: 'Below average' },
  { min: 670, max: 739, label: 'Good', color: '#f97316', description: 'Average credit' },
  { min: 740, max: 799, label: 'Very Good', color: '#00e5ff', description: 'Above average' },
  { min: 800, max: 850, label: 'Excellent', color: '#00ff88', description: 'Exceptional credit' },
];

export function CreditScoreTracker() {
  const { creditScore, creditScoreHistory, setCreditScore, addCreditScoreToHistory } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newScore, setNewScore] = useState({
    score: '',
    provider: 'Experian',
  });

  const currentInfo = creditScore ? getCreditScoreInfo(creditScore.score) : null;

  const chartData = useMemo(() => {
    return creditScoreHistory
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12)
      .map((score) => ({
        date: new Date(score.date).toLocaleDateString('en-US', { month: 'short' }),
        score: score.score,
      }));
  }, [creditScoreHistory]);

  const formatScore = (score: number) => {
    return new Intl.NumberFormat('en-US').format(score);
  };

  const handleAddScore = () => {
    const scoreValue = parseInt(newScore.score);
    if (isNaN(scoreValue) || scoreValue < 300 || scoreValue > 850) return;

    const newCreditScore: CreditScore = {
      id: crypto.randomUUID(),
      score: scoreValue,
      provider: newScore.provider,
      date: new Date().toISOString(),
      previousScore: creditScore?.score,
    };

    addCreditScoreToHistory(newCreditScore);
    setCreditScore(newCreditScore);
    setNewScore({ score: '', provider: 'Experian' });
    setShowAddDialog(false);
  };

  const getScorePosition = (score: number) => {
    return ((score - 300) / (850 - 300)) * 100;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Credit Score</h1>
          <p className="text-muted-foreground mt-1">
            Track your credit health over time
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90">
              <Plus className="h-4 w-4" />
              Update Score
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credit Score</DialogTitle>
              <DialogDescription>
                Enter your latest credit score to track changes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit Score (300-850)</label>
                <Input
                  type="number"
                  placeholder="720"
                  min={300}
                  max={850}
                  value={newScore.score}
                  onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select
                  value={newScore.provider}
                  onValueChange={(v) => setNewScore({ ...newScore, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScore}>Save Score</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {creditScore && currentInfo ? (
        <>
          {/* Main Score Card */}
          <Card className="bg-gradient-to-br from-[var(--axiom-primary)]/10 to-transparent border-[var(--axiom-primary)]/20">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="relative">
                  <div 
                    className="h-48 w-48 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(${currentInfo.color} ${getScorePosition(creditScore.score)}%, #1a1a1f ${getScorePosition(creditScore.score)}%)`
                    }}
                  >
                    <div className="h-40 w-40 rounded-full bg-background flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold">{creditScore.score}</span>
                      <span 
                        className="text-lg font-medium mt-1"
                        style={{ color: currentInfo.color }}
                      >
                        {currentInfo.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{currentInfo.description}</h3>
                    <p className="text-muted-foreground">
                      Your credit score from {creditScore.provider}, updated{' '}
                      {new Date(creditScore.date).toLocaleDateString()}
                    </p>
                  </div>

                  {creditScore.previousScore && (
                    <div className="flex items-center gap-2">
                      {creditScore.score > creditScore.previousScore ? (
                        <>
                          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-500">
                              +{creditScore.score - creditScore.previousScore} points
                            </p>
                            <p className="text-sm text-muted-foreground">Since last update</p>
                          </div>
                        </>
                      ) : creditScore.score < creditScore.previousScore ? (
                        <>
                          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-red-500">
                              {creditScore.score - creditScore.previousScore} points
                            </p>
                            <p className="text-sm text-muted-foreground">Since last update</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                            <Minus className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-semibold">No change</p>
                            <p className="text-sm text-muted-foreground">Since last update</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Score Range Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>300</span>
                      <span>500</span>
                      <span>650</span>
                      <span>750</span>
                      <span>850</span>
                    </div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-[var(--axiom-primary)]">
                      <div 
                        className="relative h-full"
                        style={{ width: `${getScorePosition(creditScore.score)}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Chart */}
          {creditScoreHistory.length > 1 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[var(--axiom-primary)]" />
                  Score History
                </CardTitle>
                <CardDescription>Your credit score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis domain={[300, 850]} stroke="#888" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: '#1a1a1f', border: '1px solid #333' }}
                        formatter={(value: number) => [formatScore(value), 'Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#00e5ff"
                        strokeWidth={3}
                        dot={{ fill: '#00e5ff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Ranges */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[var(--axiom-primary)]" />
                Credit Score Ranges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {SCORE_RANGES.map((range) => (
                  <div
                    key={range.label}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      creditScore.score >= range.min && creditScore.score <= range.max
                        ? "border-2"
                        : "border-border/50 opacity-60"
                    )}
                    style={{
                      borderColor: creditScore.score >= range.min && creditScore.score <= range.max 
                        ? range.color 
                        : undefined
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: range.color }}
                      />
                      <span className="font-medium">{range.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {range.min} - {range.max}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Credit Score Tracked</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Add your credit score to track changes over time and understand your credit health.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your Credit Score
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400">Why Track Your Credit Score?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoring your credit score helps you understand your financial health and identify 
                areas for improvement. A higher score can lead to better loan rates and credit offers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
