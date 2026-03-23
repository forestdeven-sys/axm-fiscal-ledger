import { NextRequest, NextResponse } from 'next/server';

interface SimulateRequest {
  capital: number;
  rounds: number;
  modelName?: string;
}

interface SimulatedTrade {
  id: string;
  tokenPair: string;
  tradeType: string;
  direction: string;
  amountIn: number;
  amountOut: number;
  profitUsd: number;
  status: string;
  isSimulation: boolean;
  modelUsed?: string;
  confidence: number;
  reasoning: string;
  createdAt: string;
}

// Token pairs for simulation
const TOKEN_PAIRS = [
  'SOL/USDC',
  'RAY/SOL',
  'JUP/SOL',
  'BONK/SOL',
  'WIF/SOL',
];

// Simulate trading decision
function simulateTrade(
  pair: string,
  balance: number,
  confidence: number
): { profit: number; success: boolean } {
  // Simulate spread (0.5% - 3%)
  const spread = Math.random() * 2.5 + 0.5;

  // Simulate slippage (0.1% - 0.5%)
  const slippage = Math.random() * 0.4 + 0.1;

  // Simulate gas cost (0.1% - 0.3%)
  const gasCost = Math.random() * 0.2 + 0.1;

  // Calculate net profit potential
  const netSpread = spread - slippage - gasCost;

  // Trade succeeds if net spread is positive and we have enough confidence
  const success = netSpread > 0 && confidence > 0.5 && Math.random() < (confidence + 0.1);

  // Calculate profit
  const tradeAmount = balance * 0.1; // 10% of balance per trade
  const profit = success ? tradeAmount * netSpread / 100 : -tradeAmount * 0.1;

  return { profit, success };
}

export async function POST(request: NextRequest) {
  try {
    const { capital, rounds, modelName } = await request.json() as SimulateRequest;

    if (!capital || capital <= 0) {
      return NextResponse.json({ error: 'Invalid capital amount' }, { status: 400 });
    }

    const roundCount = Math.min(rounds || 10, 100); // Cap at 100 rounds
    let balance = capital;
    const trades: SimulatedTrade[] = [];
    let wins = 0;

    // Simulate trading rounds
    for (let i = 0; i < roundCount; i++) {
      const pair = TOKEN_PAIRS[Math.floor(Math.random() * TOKEN_PAIRS.length)];

      // Generate AI confidence (simulated)
      const confidence = 0.6 + Math.random() * 0.3; // 60-90% confidence

      // Execute trade
      const { profit, success } = simulateTrade(pair, balance, confidence);

      if (success) wins++;

      const tradeAmount = balance * 0.1;
      balance += profit;

      // Record trade
      const trade: SimulatedTrade = {
        id: crypto.randomUUID(),
        tokenPair: pair,
        tradeType: 'arbitrage',
        direction: 'buy',
        amountIn: tradeAmount,
        amountOut: tradeAmount + profit,
        profitUsd: profit,
        status: 'executed',
        isSimulation: true,
        modelUsed: modelName || 'simulation',
        confidence,
        reasoning: success
          ? `Spread detected on ${pair}. Confidence: ${(confidence * 100).toFixed(1)}%`
          : `Trade failed due to slippage on ${pair}`,
        createdAt: new Date().toISOString(),
      };

      trades.push(trade);
    }

    const winRate = roundCount > 0 ? wins / roundCount : 0;
    const profitLoss = balance - capital;

    return NextResponse.json({
      finalBalance: balance,
      totalTrades: roundCount,
      winRate,
      profitLoss,
      trades,
      lastTrade: trades[trades.length - 1] || null,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    );
  }
}
