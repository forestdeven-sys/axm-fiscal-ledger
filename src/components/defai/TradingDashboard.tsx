'use client';

import { useState, useEffect } from 'react';
import { useAppStore, DeFAITrade, DeFAIAgent } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Activity,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const DEFAULT_AGENTS: DeFAIAgent[] = [
  {
    id: 'signal-1',
    name: 'Signal Agent',
    agentType: 'signal',
    status: 'idle',
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
  },
  {
    id: 'execution-1',
    name: 'Execution Agent',
    agentType: 'execution',
    status: 'idle',
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
  },
  {
    id: 'sim-1',
    name: 'Simulation Agent',
    agentType: 'simulation',
    status: 'idle',
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
  },
];

export function TradingDashboard() {
  const { 
    defaiAgents, 
    defaiTrades, 
    addDeFAIAgent, 
    updateDeFAIAgent,
    addDeFAITrade,
    settings,
    updateSettings,
    aiSettings,
  } = useAppStore();
  
  const [isRunning, setIsRunning] = useState(false);
  const [paperTrading, setPaperTrading] = useState(settings.paperTradingMode);
  const [simulationStats, setSimulationStats] = useState({
    balance: settings.startingCapital,
    totalTrades: 0,
    winRate: 0,
    profitLoss: 0,
    lastTrade: null as DeFAITrade | null,
  });

  // Initialize agents if not present
  useEffect(() => {
    if (defaiAgents.length === 0) {
      DEFAULT_AGENTS.forEach(agent => addDeFAIAgent(agent));
    }
  }, [defaiAgents, addDeFAIAgent]);

  // Run paper trading simulation
  const runSimulation = async () => {
    setIsRunning(true);
    updateDeFAIAgent('signal-1', { status: 'running' });
    updateDeFAIAgent('execution-1', { status: 'running' });
    
    try {
      const response = await fetch('/api/defai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capital: simulationStats.balance,
          rounds: 10,
          settings: aiSettings,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update stats
        setSimulationStats({
          balance: data.finalBalance,
          totalTrades: data.totalTrades,
          winRate: data.winRate,
          profitLoss: data.finalBalance - settings.startingCapital,
          lastTrade: data.lastTrade,
        });
        
        // Add trades to history
        data.trades.forEach((trade: DeFAITrade) => addDeFAITrade(trade));
        
        // Update agents
        updateDeFAIAgent('signal-1', { 
          status: 'idle',
          totalTrades: data.totalTrades,
          winRate: data.winRate,
          totalProfit: data.finalBalance - settings.startingCapital,
        });
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsRunning(false);
      updateDeFAIAgent('signal-1', { status: 'idle' });
      updateDeFAIAgent('execution-1', { status: 'idle' });
    }
  };

  // Stop trading
  const stopTrading = () => {
    setIsRunning(false);
    defaiAgents.forEach(agent => {
      if (agent.status === 'running') {
        updateDeFAIAgent(agent.id, { status: 'paused' });
      }
    });
  };

  // Generate performance chart data
  const generateChartData = () => {
    let balance = settings.startingCapital;
    return defaiTrades.slice(-50).map((trade, i) => {
      balance += trade.profitUsd || 0;
      return {
        round: i + 1,
        balance,
        profit: trade.profitUsd || 0,
      };
    });
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan">DeFAI Trading Agents</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered DeFi trading with paper trading simulation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={paperTrading}
              onCheckedChange={(v) => {
                setPaperTrading(v);
                updateSettings({ paperTradingMode: v });
              }}
            />
            <Label>Paper Trading</Label>
          </div>
          <Badge
            variant={paperTrading ? 'outline' : 'default'}
            className={paperTrading ? 'text-[var(--axiom-yellow)] border-[var(--axiom-yellow)]/30' : 'bg-[var(--axiom-red)]'}
          >
            {paperTrading ? 'Simulation Mode' : 'LIVE TRADING'}
          </Badge>
        </div>
      </div>

      {/* Warning Banner for Live Trading */}
      {!paperTrading && (
        <Card className="bg-[var(--axiom-red)]/10 border-[var(--axiom-red)]/30">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-[var(--axiom-red)]" />
            <div>
              <p className="font-semibold text-[var(--axiom-red)]">Live Trading Mode Active</p>
              <p className="text-sm text-muted-foreground">
                Real money is at risk. Ensure you understand the risks before proceeding.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold number-mono">
                  ${simulationStats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[var(--axiom-cyan)]" />
            </div>
            <Progress 
              value={(simulationStats.balance / settings.startingCapital) * 100} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold number-mono">{simulationStats.totalTrades}</p>
              </div>
              <Activity className="h-8 w-8 text-[var(--axiom-cyan)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold number-mono">
                  {(simulationStats.winRate * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text={simulationStats.winRate > 0.5 ? 'var(--axiom-green)' : 'var(--axiom-red)'}" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`text-2xl font-bold number-mono ${simulationStats.profitLoss >= 0 ? 'text-[var(--axiom-green)]' : 'text-[var(--axiom-red)]'}`}>
                  {simulationStats.profitLoss >= 0 ? '+' : ''}${simulationStats.profitLoss.toFixed(2)}
                </p>
              </div>
              {simulationStats.profitLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-[var(--axiom-green)]" />
              ) : (
                <TrendingDown className="h-8 w-8 text-[var(--axiom-red)]" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Controls & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Panel */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[var(--axiom-cyan)]" />
              Trading Agents
            </CardTitle>
            <CardDescription>AI agents working together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaiAgents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    agent.status === 'running' ? 'bg-[var(--axiom-green)] animate-pulse' :
                    agent.status === 'paused' ? 'bg-[var(--axiom-yellow)]' :
                    'bg-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.agentType}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
            
            <div className="pt-4 space-y-2">
              <Button
                className="w-full gap-2"
                onClick={runSimulation}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Simulation (10 rounds)
                  </>
                )}
              </Button>
              
              {isRunning && (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={stopTrading}
                >
                  <Pause className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--axiom-cyan)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--axiom-cyan)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="round" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="var(--axiom-cyan)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBalance)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Run a simulation to see performance data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trade History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Recent simulated trades</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount In</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaiTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No trades yet. Run a simulation to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  defaiTrades.slice(-20).reverse().map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-sm">
                        {new Date(trade.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="number-mono">{trade.tokenPair}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{trade.tradeType}</Badge>
                      </TableCell>
                      <TableCell className="number-mono">
                        ${trade.amountIn.toFixed(2)}
                      </TableCell>
                      <TableCell className={`number-mono font-medium ${trade.profitUsd && trade.profitUsd >= 0 ? 'text-[var(--axiom-green)]' : 'text-[var(--axiom-red)]'}`}>
                        {trade.profitUsd ? `${trade.profitUsd >= 0 ? '+' : ''}$${trade.profitUsd.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.status === 'executed' ? 'default' : 'secondary'}>
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Model Configuration Info */}
      <Card className="glass-card border-glow-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--axiom-cyan)]" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Trading Model</p>
              <p className="font-medium">{aiSettings.tradingModelName || aiSettings.primaryModelName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Provider</p>
              <p className="font-medium capitalize">{aiSettings.tradingModelProvider || aiSettings.primaryModelProvider}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Starting Capital</p>
              <p className="font-medium number-mono">${settings.startingCapital}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Gas (Gwei)</p>
              <p className="font-medium number-mono">{settings.maxGasPriceGwei}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
