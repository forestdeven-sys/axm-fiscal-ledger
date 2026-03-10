# DeFAI Trading Agent

Decentralized Finance AI Trading system with simulation mode, competitor tracking, and experience-based learning.

## Quick Start

### 1. Set Up Infrastructure

**Get QuickNode RPC URL (Free):**
1. Go to https://www.quicknode.com/
2. Sign up and create an endpoint for Polygon Mainnet
3. Copy your HTTP Provider URL

**Set Up Neon Database (Free):**
1. Go to https://neon.tech/
2. Create a new project called `defai-trading`
3. Copy the connection string

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your RPC URL and database URL
```

### 3. Initialize Database

```bash
# Connect to Neon and run the schema
psql $NEON_DATABASE_URL -f config/schema.sql
```

### 4. Install Dependencies

```bash
pip install -e .
```

### 5. Run in Simulation Mode

**Start Anvil Fork (simulates mainnet locally):**
```bash
chmod +x scripts/anvil_fork.sh
./scripts/anvil_fork.sh YOUR_QUICKNODE_URL
```

**Run MEV Watcher (tracks competitors):**
```bash
python -m src.blockchain.mev_watcher \
    --rpc-url YOUR_QUICKNODE_URL \
    --database-url YOUR_NEON_URL \
    --chain 137
```

**Run Trading Agent (simulation mode):**
```bash
python -m src.agents.trading_agent \
    --rpc-url http://localhost:8545 \
    --database-url YOUR_NEON_URL \
    --simulation
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DeFAI Trading System                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐     ┌─────────────┐                   │
│  │   Anvil     │────▶│  Trading    │                   │
│  │  (Forked    │     │   Agent     │                   │
│  │   Mainnet)  │     │ (Strands)   │                   │
│  └─────────────┘     └──────┬──────┘                   │
│                             │                           │
│  ┌─────────────┐           │          ┌─────────────┐ │
│  │    MEV      │           │          │   Neon DB   │ │
│  │  Watcher    │───────────┼─────────▶│ (PostgreSQL)│ │
│  │             │           │          │             │ │
│  └─────────────┘           │          │ • Trades    │ │
│                            │          │ • Competing │ │
│                            │          │   bots      │ │
│                            │          │ • Learning  │ │
│                            │          └─────────────┘ │
│                            │                           │
│                      ┌─────▼─────┐                     │
│                      │ Experience │                    │
│                      │  Replay   │                     │
│                      └───────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Key Tables

- **mev_competitors**: Tracks competitor bot addresses and performance
- **arbitrage_events**: Logs all detected arbitrage opportunities
- **market_states**: Time-series market data for training
- **trading_experiences**: RL training data (state, action, reward)
- **agent_decisions**: AI agent decision history

## Strategies

| Strategy | Capital | Risk | Expected ROI |
|----------|---------|------|--------------|
| Flash Loan Arbitrage | $0 | Medium | 5-20%/month |
| Cross-DEX Arbitrage | $1-10k | Medium | 10-30%/month |
| Yield Optimization | $5k+ | Low | 5-15%/month |

## Safety

- **Always test on Anvil fork first**
- **Never commit private keys**
- **Start with simulation mode**
- **Use flash loans to avoid capital risk**

## License

MIT
