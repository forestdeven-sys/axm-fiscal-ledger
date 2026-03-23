import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  financialContext?: string;
  agentPrompt?: string;
  enableWebSearch?: boolean;
}

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
    const body = await request.json() as ChatRequest;
    const { message, financialContext, agentPrompt } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI is not configured. Please set OPENROUTER_API_KEY in your environment variables.' },
        { status: 400 }
      );
    }

    const systemContent = [
      agentPrompt || SYSTEM_PROMPT,
      financialContext ? `\n\n${financialContext}` : '',
    ].join('');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://axiom.finance',
            },
            body: JSON.stringify({
              model: 'xiaomi/mimo-v2-flash',
              messages: [
                { role: 'system', content: systemContent },
                { role: 'user', content: message },
              ],
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: `[Error: AI service returned ${response.status}. Please check your API key.]` })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: '[Error: No response stream available]' })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (!trimmed.startsWith('data: ')) continue;

              try {
                const data = JSON.parse(trimmed.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('AI streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: '\n\n[Error: Failed to get response from AI. Please try again.]' })}\n\n`
            )
          );
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
