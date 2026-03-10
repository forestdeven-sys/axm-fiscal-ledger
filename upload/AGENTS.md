# DeFAI Trading Agent - AGENTS.MD

## Project Overview

**DeFAI (Decentralized Finance AI) Trading Agent** - A standalone trading system that uses AI to execute profitable arbitrage and trading strategies on DeFi protocols.

**Location:** `/Users/deven/Projects/finance_model`

**Status:** Independent project - connects to MCP/orchestration for tool access only.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DeFAI Trading Agent                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SIGNAL AGENT (Core)                 │   │
│  │                                                  │   │
│  │  • Market state analysis                         │   │
│  │  • Competitor tracking                           │   │
│  │  • Profit calculation                            │   │
│  │  • Decision making                               │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │            EXECUTION AGENT                       │   │
│  │                                                  │   │
│  │  • Trade execution                               │   │
│  │  • Flash loan management                         │   │
│  │  • Gas optimization                              │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │            SIMULATION AGENT                      │   │
│  │                                                  │   │
│  │  • Backtesting                                   │   │
│  │  • Experience replay                             │   │
│  │  • Learning from trades                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                           │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   NEON DB   │  │  BLOCKCHAIN │  │   ANVIL     │   │
│  │ (PostgreSQL)│  │   (RPC)     │  │ (Simulator) │   │
│  │             │  │             │  │             │   │
│  │ • Trades    │  │ • Prices    │  │ • Local     │   │
│  │ • Competing │  │ • Events    │  │   fork      │   │
│  │   bots      │  │ • Gas       │  │ • Zero risk │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                  EXTERNAL CONNECTIONS                   │
│                                                         │
│  MCP/orchestration - Tool access only (not core logic) │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Signal Agent (`src/agents/signal/`)

**Purpose:** Analyze market and make trading decisions.

**Inputs:**
- Token pair prices from multiple DEXs
- Gas prices
- Competitor activity
- Historical trades

**Outputs:**
- Trading decision (buy/sell/hold)
- Confidence score
- Expected profit
- Risk assessment

### 2. Execution Agent (`src/agents/execution/`)

**Purpose:** Execute trades on-chain.

**Features:**
- Flash loan execution (Aave)
- Multi-DEX routing
- Gas optimization
- Slippage protection

### 3. Simulation Agent (`src/agents/simulation/`)

**Purpose:** Learn from past trades.

**Features:**
- Experience replay database
- Backtesting engine
- Profit/loss analysis
- Strategy optimization

---

## Database Schema (Neon PostgreSQL)

### Tables:

```sql
-- Competitor tracking
mev_competitors (
    bot_address VARCHAR(42),
    total_wins INTEGER,
    total_profit_usd DECIMAL,
    active_hours INTEGER[]
)

-- Trade log
arbitrage_events (
    tx_hash VARCHAR(66),
    profit_usd DECIMAL,
    gas_paid_gwei DECIMAL,
    token_pair VARCHAR(50),
    winner_address VARCHAR(42)
)

-- Market data
market_states (
    token_pair VARCHAR(50),
    uniswap_price DECIMAL,
    sushiswap_price DECIMAL,
    spread_percent DECIMAL,
    gas_price_gwei DECIMAL
)

-- Learning data
trading_experiences (
    state_vector JSONB,
    action_type VARCHAR(20),
    reward DECIMAL,
    was_successful BOOLEAN
)
```

---

## Trading Strategies

### Flash Loan Arbitrage
- Borrow from Aave (no collateral)
- Execute cross-DEX arbitrage
- Repay loan + 0.09% fee
- Keep profit

### Cross-DEX Arbitrage
- Monitor Uniswap, SushiSwap, QuickSwap
- Execute when spread > gas + slippage
- Focus on Polygon (lowest gas)

---

## Quick Start

```bash
cd /Users/deven/Projects/finance_model

# 1. Install dependencies
pip install -e .

# 2. Set up environment
cp .env.example .env
# Edit .env with your RPC URL and database URL

# 3. Initialize database
psql $NEON_DATABASE_URL -f config/schema.sql

# 4. Run simulation
python -m src.agents.signal --simulation

# 5. Run live (after testing)
python -m src.agents.signal --live
```

---

## Configuration (.env)

```bash
# RPC URL (QuickNode/Alchemy for Polygon)
POLYGON_RPC_URL=https://your-endpoint.quiknode.pro/key/

# Neon Database
NEON_DATABASE_URL=postgresql://user:pass@host/db

# Optional: MongoDB for experience storage
MONGODB_URI=mongodb+srv://...

# Trading parameters
STARTING_CAPITAL=1000
MAX_GAS_PRICE_GWEI=50
SLIPPAGE_TOLERANCE=0.5
```

---

## File Structure

```
finance_model/
├── config/
│   └── schema.sql              # Database schema
├── src/
│   ├── blockchain/
│   │   └── mev_watcher.py      # Competitor tracking
│   ├── agents/
│   │   ├── signal/             # Decision agent
│   │   ├── execution/          # Trade execution
│   │   └── simulation/         # Learning system
│   ├── data/
│   └── utils/
├── scripts/
│   └── anvil_fork.sh           # Local blockchain
├── tests/
├── .env.example
├── pyproject.toml
└── README.md
```

---

## External Connections

This project connects to:
- **MCP/orchestration** - For tool access only
- **QuickNode** - Blockchain RPC
- **Neon** - PostgreSQL database

It does NOT depend on:
- SCIT
- Behavioral prediction from other projects
- Orchestration sub-agents

---

## Profitability Expectations

| Phase | Timeline | Expected Profit |
|-------|----------|-----------------|
| Learning | Month 1-2 | Break-even |
| Optimization | Month 3-4 | $100-500/month |
| Scaled | Month 5+ | $500-2000/month |

---

## Safety

1. **Always test on Anvil first** - Zero risk simulation
2. **Never commit private keys**
3. **Start with small amounts**
4. **Use flash loans** - No capital at risk

---

**Last Updated:** 2026-02-14
