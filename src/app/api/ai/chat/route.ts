import { NextRequest, NextResponse } from 'next/server';
import { AISettings, Transaction } from '@/store';

interface ChatRequest {
  message: string;
  transactions: Transaction[];
  settings: AISettings;
}

// System prompt for Axiom Financial Architect
const SYSTEM_PROMPT = `You are the Axiom Financial Architect, an expert-level autonomous financial planner. Your goal is to maximize the user's net worth and liquidity while maintaining total transparency.

**Operational Rules:**

1. **Data-Driven Logic:** Every financial suggestion must be grounded in the user's actual inflow/outflow data. If data is missing to make a claim, state the missing data point clearly.
2. **Efficiency First:** Optimize for tax efficiency, high-yield growth, and debt minimization.
3. **The 'Axiom' Perspective:** You view all financial decisions as measurable scientific data points. Avoid fluff or sugarcoating. If a spending habit is sub-optimal, analyze the math and explain why objectively.
4. **Agentic Autonomy:** You are authorized to manage categorization, suggest budget adjustments, and forecast future cash flows based on current trends.
5. **Contextual Awareness:** You prioritize the user's long-term project viability and recognize the necessity of reinvesting profits into system growth.

**Response Structure:**

* **Executive Summary:** The 'Bottom Line' (e.g., current burn rate vs. runway).
* **Data Analysis:** Evidence-based breakdown of recent transactions.
* **Optimization Recommendation:** A 1-to-100 actionable efficiency rating for proposed changes.
* **Next Logical Step:** A clear, singular action the user should take immediately.`;

export async function POST(request: NextRequest) {
  try {
    const { message, transactions, settings } = await request.json() as ChatRequest;
    
    // Check if privacy mode is enabled
    if (!settings.primaryApiKey && !settings.openRouterApiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'No API key configured. Please add an API key in Settings.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build financial context from transactions
    const now = new Date();
    const thisMonthTx = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const totalSpent = thisMonthTx.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = thisMonthTx.filter(t => t.type === 'Payment').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalInterest = thisMonthTx.filter(t => t.type === 'Interest').reduce((sum, t) => sum + t.amount, 0);
    
    // Get top categories
    const categories: Record<string, number> = {};
    thisMonthTx.forEach(t => {
      const cat = t.userCategory || t.aiCategory || t.category || 'Other';
      if (t.amount > 0) {
        categories[cat] = (categories[cat] || 0) + t.amount;
      }
    });
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Get top merchants
    const merchants: Record<string, number> = {};
    thisMonthTx.forEach(t => {
      const merchant = t.merchant || t.description;
      if (t.amount > 0) {
        merchants[merchant] = (merchants[merchant] || 0) + t.amount;
      }
    });
    const topMerchants = Object.entries(merchants)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Build context
    const financialContext = `
User's financial snapshot:
- Date range: Last 90 days
- Total transactions: ${transactions.length}
- This month's transactions: ${thisMonthTx.length}
- Total spent this month: $${totalSpent.toFixed(2)}
- Total payments this month: $${totalPayments.toFixed(2)}
- Total interest paid this month: $${totalInterest.toFixed(2)}

Top 5 categories by spend:
${topCategories.map(c => `- ${c.name}: $${c.amount.toFixed(2)}`).join('\n')}

Top 10 merchants by spend:
${topMerchants.map(m => `- ${m[0]}: $${m[1].toFixed(2)}`).join('\n')}

Recent transactions (last 20):
${transactions.slice(0, 20).map(t => 
  `- ${t.transactionDate}: ${t.merchant || t.description} | $${t.amount.toFixed(2)} | ${t.type} | ${t.userCategory || t.category || 'Other'}`
).join('\n')}
`;

    // Use z-ai-web-dev-sdk
    const { LLM } = await import('z-ai-web-dev-sdk');
    
    const apiKey = settings.openRouterApiKey || settings.primaryApiKey;
    const modelName = settings.primaryModelName || 'glm-4-flash';
    
    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llm = new LLM({
            apiKey: process.env.ZAI_API_KEY || apiKey,
            model: modelName.includes('/') ? modelName : `openai/${modelName}`,
          });

          const messages = [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + financialContext },
            { role: 'user', content: message },
          ];

          const response = await llm.chat({
            messages,
            stream: true,
          });

          for await (const chunk of response) {
            const content = chunk.choices?.[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          console.error('LLM error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '\n\n[Error: Failed to get response from AI. Please check your API key and try again.]' })}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
