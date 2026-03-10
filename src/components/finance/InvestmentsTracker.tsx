'use client';

import { useState, useMemo } from 'react';
import { useAppStore, Investment, InvestmentAccount, getInvestmentSummary } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INVESTMENT_TYPES: Investment['type'][] = ['stock', 'crypto', 'etf', 'bond', 'mutual_fund', 'other'];

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
];

const POPULAR_CRYPTO = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOT', name: 'Polkadot' },
];

export function InvestmentsTracker() {
  const { investments, investmentAccounts, addInvestment, updateInvestment, deleteInvestment, addInvestmentAccount } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [investmentType, setInvestmentType] = useState<Investment['type']>('stock');
  
  const summary = useMemo(() => getInvestmentSummary(investments), [investments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAddInvestment = () => {
    const name = document.getElementById('inv-name') as HTMLInputElement;
    const symbol = document.getElementById('inv-symbol') as HTMLInputElement;
    const quantity = document.getElementById('inv-quantity') as HTMLInputElement;
    const purchasePrice = document.getElementById('inv-purchase-price') as HTMLInputElement;
    const currentPrice = document.getElementById('inv-current-price') as HTMLInputElement;

    if (!name.value || !symbol.value || !quantity.value || !purchasePrice.value) return;

    addInvestment({
      id: crypto.randomUUID(),
      name: name.value,
      symbol: symbol.value.toUpperCase(),
      type: investmentType,
      quantity: parseFloat(quantity.value),
      purchasePrice: parseFloat(purchasePrice.value),
      currentPrice: currentPrice.value ? parseFloat(currentPrice.value) : parseFloat(purchasePrice.value),
      purchaseDate: new Date().toISOString(),
    });

    setShowAddDialog(false);
  };

  const refreshPrices = () => {
    // Simulate price refresh
    investments.forEach(inv => {
      const change = (Math.random() - 0.5) * 0.1; // ±5%
      const newPrice = inv.currentPrice * (1 + change);
      updateInvestment(inv.id, { currentPrice: newPrice });
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Investments</h1>
          <p className="text-muted-foreground mt-1">
            Track your portfolio performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={refreshPrices}>
            <RefreshCw className="h-4 w-4" />
            Refresh Prices
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[var(--axiom-primary)] hover:bg-[var(--axiom-primary)]/90">
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Investment</DialogTitle>
                <DialogDescription>
                  Track a stock, crypto, or other investment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={investmentType} onValueChange={(v) => setInvestmentType(v as Investment['type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol</label>
                    <Input id="inv-symbol" placeholder="AAPL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input id="inv-name" placeholder="Apple Inc." />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input id="inv-quantity" type="number" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buy Price</label>
                    <Input id="inv-purchase-price" type="number" placeholder="150.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Price</label>
                    <Input id="inv-current-price" type="number" placeholder="175.00" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddInvestment}>Add Investment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[var(--axiom-primary)]/10 to-transparent border-[var(--axiom-primary)]/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[var(--axiom-primary)]/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[var(--axiom-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-card/50 border-border/50",
          summary.totalGain >= 0 ? "border-green-500/30" : "border-red-500/30"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className={cn(
                  "text-2xl font-bold",
                  summary.totalGain >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {summary.totalGain >= 0 ? '+' : ''}{formatCurrency(summary.totalGain)}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center",
                summary.totalGain >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {summary.totalGain >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Holdings</p>
                <p className="text-2xl font-bold">{summary.holdings}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      {investments.length > 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--axiom-primary)]" />
              Your Holdings
            </CardTitle>
            <CardDescription>Track individual investment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Quantity</th>
                    <th className="pb-3 font-medium text-right">Avg Cost</th>
                    <th className="pb-3 font-medium text-right">Current Price</th>
                    <th className="pb-3 font-medium text-right">Value</th>
                    <th className="pb-3 font-medium text-right">Gain/Loss</th>
                    <th className="pb-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const value = inv.currentPrice * inv.quantity;
                    const cost = inv.purchasePrice * inv.quantity;
                    const gain = value - cost;
                    const gainPercent = (gain / cost) * 100;

                    return (
                      <tr key={inv.id} className="border-b border-border/30">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold",
                              inv.type === 'crypto' ? "bg-orange-500/20 text-orange-500" :
                              inv.type === 'stock' ? "bg-blue-500/20 text-blue-500" :
                              "bg-purple-500/20 text-purple-500"
                            )}>
                              {inv.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{inv.symbol}</p>
                              <p className="text-xs text-muted-foreground">{inv.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">{inv.quantity}</td>
                        <td className="py-4 text-right">{formatCurrency(inv.purchasePrice)}</td>
                        <td className="py-4 text-right">{formatCurrency(inv.currentPrice)}</td>
                        <td className="py-4 text-right font-medium">{formatCurrency(value)}</td>
                        <td className="py-4 text-right">
                          <div className={cn(
                            "font-medium",
                            gain >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            <p>{gain >= 0 ? '+' : ''}{formatCurrency(gain)}</p>
                            <p className="text-xs">{gain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%</p>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-400"
                            onClick={() => deleteInvestment(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Investments Tracked</h3>
            <p className="text-muted-foreground mb-4">
              Add your first investment to start tracking your portfolio
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Investment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="py-4">
          <p className="text-sm text-yellow-500/80">
            <strong>Note:</strong> This is for tracking purposes only. Price data is simulated. 
            For real-time data, connect to a financial data API in Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
