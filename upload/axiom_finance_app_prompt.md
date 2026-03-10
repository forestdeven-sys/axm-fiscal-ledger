# AXIOM FINANCE — AI App Build Prompt

---

## MISSION

Build a personal AI-powered finance application called **Axiom Finance** (or let the user rename it). The app ingests transaction CSVs (Apple Card format initially, extendable to any bank statement format) and uses a multi-model AI architecture to deliver intelligent financial analysis, proactive suggestions, anomaly detection, and a live chat interface backed by specialized AI agents.

---

## DATA FORMAT (PRIMARY)

Apple Card CSV schema:
```
Transaction Date, Clearing Date, Description, Merchant, Category, Type, Amount (USD), Purchased By
```

- **Types**: `Purchase`, `Payment`, `Interest`
- **Categories**: Transportation, Grocery, Gas, Insurance, Utilities, Restaurants, Other, Interest
- **Payments are negative values** (credits to the card)
- **Interest charges appear as their own line items**
- Date range: multi-month to multi-year history
- Multiple cardholders possible via `Purchased By` column

Also support: generic bank statement CSVs, and PDF bank statements (via text extraction). User should be able to upload multiple files and the app merges/deduplicates them into a unified ledger.

---

## TECH STACK

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes or a separate FastAPI service (your choice, keep it simple)
- **Database**: SQLite (via Prisma or better-sqlite3) for local-first storage of all transactions, sessions, user settings, and AI outputs
- **File Parsing**: Papa Parse (CSV), pdf-parse or pdfjs-dist (PDFs)
- **Charts**: Recharts or Tremor
- **AI SDK**: Vercel AI SDK (`ai` package) for streaming multi-model support
- **Auth**: Optional — if included, use NextAuth.js with a local credentials provider (no external OAuth required for personal use)

---

## AI ARCHITECTURE — MULTI-MODEL SWARM

The app runs **two AI roles simultaneously** with clean separation of concerns:

### MODEL 1 — Primary Finance Assistant (Fast, Conversational)
- **Suggested models** (user picks one): `mimo-v2-flash`, `gemini-2.0-flash`, `gpt-4o-mini`, or any OpenAI-compatible endpoint
- **Role**: Real-time chat, quick answers, category explanations, spending summaries, merchant lookups
- **Context window injection**: Receives the user's full transaction history as structured JSON in the system prompt (last 90 days by default, configurable)
- **Tone**: Friendly, direct, no jargon. Like a sharp financial advisor who knows you personally.

### MODEL 2 — Reasoning / Analysis Model (Deep, Deliberate)
- **Suggested models**: `o3-mini`, `deepseek-r1`, `gemini-2.0-flash-thinking`, or any reasoning-capable model
- **Role**: Background analysis jobs — monthly reports, anomaly detection, budget recommendations, savings opportunity identification, subscription audit, debt payoff strategies
- **Triggered**: On upload of new data, on-demand via "Deep Analysis" button, or on a schedule
- **Output**: Structured JSON → rendered as insight cards in the UI

### Model Configuration
- User can set both models in a **Settings page** with provider + model name + API key per model
- Each model has its own API key field (user brings their own keys — no proxy needed)
- Models are called directly from the browser via API routes (keys stored in localStorage or a local `.env` — clearly documented)
- **Fallback**: If Model 2 is unavailable, Model 1 handles all requests with a visible degraded-mode banner

---

## CORE FEATURES

### 1. Transaction Ledger
- Full sortable/filterable table of all transactions
- Columns: Date, Merchant, Category, Amount, Type, Tags (user-editable), Notes (user-editable)
- Inline editing: user can correct merchant name, category, or add a tag
- Search bar with instant filtering
- Export to CSV button

### 2. Dashboard Overview
Key metrics visible immediately on load:
- **Total Spent** (this month, last month, YTD)
- **Total Payments Made**
- **Interest Paid** (isolated — this is important)
- **Top 5 Categories** by spend (bar chart)
- **Top 10 Merchants** by spend (horizontal bar)
- **Spend Timeline** — area chart showing daily/weekly/monthly spend over the full history
- **Subscription Tracker** — auto-detected recurring charges (same merchant, similar amount, ~30 day cadence)

### 3. Category Intelligence
- Spending breakdown by category with month-over-month delta
- Clicking a category drills into all transactions for that category
- AI-generated insight per category ("Your grocery spending increased 34% in Feb vs Jan — $422 went to Vashon Thriftway on a single day")

### 4. AI Chat Interface
- Full-width chat panel (can be a slide-out drawer or dedicated route `/chat`)
- Streaming responses via Vercel AI SDK
- The AI has access to the full transaction history in its context
- **Suggested starter prompts** shown on first load:
  - "What am I spending the most on?"
  - "Find subscriptions I might be able to cancel"
  - "How much did I spend on AI tools last month?"
  - "What's my average weekly grocery spend?"
  - "Am I paying too much in interest? How do I fix it?"
- Chat history persisted in SQLite per session
- User can start a new chat or reference old ones
- AI can render structured responses (tables, lists, bullet points) formatted nicely in the chat

### 5. Deep Analysis (Reasoning Model)
Triggered via button or automatic on CSV upload. Produces a structured report with:
- **Subscription Audit**: All recurring charges, monthly cost, suggested cuts
- **Interest Analysis**: Total interest paid over history, effective APR estimate, payoff timeline if user provides balance
- **Anomaly Detection**: Unusual one-off charges, duplicate charges, charges in unusual locations
- **Savings Opportunities**: e.g., "You spent $180 at Shell/Chevron — consider rewards cards for gas"
- **Category Recommendations**: Specific, actionable suggestions per category
- **Month-over-Month Trends**: Where spend increased/decreased significantly
- **AI Spending Audit**: Detect all AI/developer tool subscriptions specifically (Anthropic, OpenAI, HuggingFace, Google Cloud, Mistral, etc.) and total them up — this user spends heavily in this category
- Report is saved and timestamped; user can view all past reports

### 6. Budget Planner
- User can set monthly budgets per category
- Progress bars show current month spend vs budget
- AI warns when approaching limits (proactive push notification or banner)
- Suggested budgets: AI uses historical averages to propose realistic budget targets

### 7. Subscription Tracker
- Auto-detect recurring charges by merchant + cadence + amount similarity
- Display as a card grid: Merchant, Estimated Monthly Cost, Last Charged, Frequency
- AI can comment on each: "You've paid HuggingFace $9-10/month for 14 months. Is this still active and useful?"
- One-click to mark as "Keep" / "Review" / "Cancel (remind me)"

### 8. File Upload & Parsing
- Drag-and-drop upload zone on the main page
- Accepts: `.csv` (Apple Card format + generic bank format auto-detected), `.pdf` (bank statements)
- On upload: parse → deduplicate against existing records → show preview before committing to DB
- Progress indicator during parse + AI analysis
- Support for multiple files in one upload session
- After commit: triggers Deep Analysis automatically (user can dismiss)

---

## UI / DESIGN DIRECTION

**Aesthetic**: Dark, terminal-adjacent but refined. Think financial data terminal meets modern SaaS. 
- Background: near-black (`#0a0a0f`) with subtle grid or noise texture
- Accent: electric cyan (`#00e5ff`) or sharp green (`#00ff88`) — pick one and commit
- Cards: dark glass / frosted (`bg-white/5 border border-white/10 backdrop-blur`)
- Typography: `JetBrains Mono` or `IBM Plex Mono` for numbers/data; `Inter` or `Geist` for prose
- Charts: monochromatic with single accent color. No rainbow pie charts.
- Animations: subtle fade-ins, chart line draws on mount, streaming chat text
- Layout: sidebar nav (collapsible), main content area, optional right drawer for chat

**Pages / Routes**:
- `/` — Dashboard
- `/transactions` — Full ledger
- `/chat` — AI Chat (or slide-out drawer accessible everywhere)
- `/analysis` — Deep Analysis reports
- `/subscriptions` — Subscription tracker
- `/budget` — Budget planner
- `/settings` — Model config, API keys, preferences

---

## SETTINGS PAGE

User-configurable:
- **Primary Model**: Provider (OpenAI / Anthropic / Google / Custom OpenAI-compatible), Model name, API Key
- **Reasoning Model**: Same fields
- **Default date range** for dashboard
- **Currency** (default USD)
- **Privacy Mode**: toggle to prevent any data leaving the device (disables AI features, uses only local calculations)
- **Data Management**: Export all data as JSON, wipe all data button (with confirmation)

---

## SECURITY / PRIVACY NOTES (DOCUMENT IN README)

- All transaction data is stored **locally in SQLite only** — never sent to any external server except the AI provider APIs
- AI providers receive transaction data in API calls — user must consent to this on first run
- API keys stored in browser localStorage (not ideal for production but fine for personal use) — document this clearly
- No analytics, no telemetry, no third-party tracking

---

## IMPLEMENTATION NOTES & CONSTRAINTS

- **No hardcoded data** — everything driven by uploaded files
- **Deduplication logic**: Two transactions are duplicates if `Transaction Date + Merchant + Amount` match within 1 day window
- **Interest charges must be tracked separately** — never mixed into spending totals. Show a dedicated "Interest Paid" metric prominently because this is a real cost.
- **Payments (negative values) are credits** — subtract from balance tracking, don't count as "income"
- **Category `Other`** is heavily used in Apple Card exports — AI should attempt to re-categorize `Other` transactions based on merchant name heuristics (e.g., "Anthropic" → "AI Tools", "HuggingFace" → "AI Tools", "Google Cloud" → "Developer Tools", "Shell/Chevron" → "Gas")
- **AI context injection**: When calling the primary model for chat, inject the last 90 days of transactions as a JSON array in the system prompt. For the reasoning model, inject the full history. Always include: totals by category, top merchants, total interest paid, subscription list.
- The reasoning model's analysis should be **rate-limited** — don't trigger it on every message, only on explicit user request or new data upload.
- **Mobile responsive** — the app should work on phone screens (transaction list collapses, chat is full-screen modal)

---

## EXAMPLE SYSTEM PROMPT TEMPLATE (PRIMARY MODEL)

```
You are Axiom, a personal AI financial advisor. You have access to the user's complete transaction history below.

Your job:
1. Answer financial questions directly and specifically using the data provided
2. Identify patterns, anomalies, and opportunities the user may not notice
3. Give actionable, specific advice — not generic tips
4. Be honest: if spending patterns are concerning, say so directly but without judgment
5. Always cite specific numbers from the data when making claims

User's financial snapshot:
- Date range: {start_date} to {end_date}
- Total transactions: {count}
- Total spent: ${total_spend}
- Total interest paid: ${total_interest}
- Top categories: {top_categories_json}
- Recurring subscriptions detected: {subscriptions_json}

Full transaction history (last 90 days):
{transactions_json}

Respond concisely. Use markdown formatting for lists and tables when helpful. If you don't have enough data to answer something, say so.
```

---

## DELIVERABLE

A working Next.js application that:
1. Runs locally with `npm run dev`
2. Has a working file upload that parses Apple Card CSV format
3. Renders a dashboard with real charts from the parsed data
4. Has a working AI chat that queries the primary model with transaction context
5. Has a Deep Analysis page that calls the reasoning model
6. Has a settings page to configure both models and their API keys
7. Is visually polished with the dark terminal aesthetic described above
8. Has a README documenting setup, model configuration, and privacy model

Start with the data pipeline and dashboard first. Get the CSV parse → DB → dashboard working before touching AI features.
