import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  financialContext?: string;
  agentPrompt?: string;
  enableWebSearch?: boolean;
}

// Default system prompt for Axiom Financial Architect
const DEFAULT_SYSTEM_PROMPT = `You are the Axiom Financial Architect, an expert-level personal financial planner. Your goal is to help users understand their finances, optimize their budget, and make smarter financial decisions.

**Your approach:**
1. **Data-Driven Logic:** Base all suggestions on the user's actual financial data provided in context.
2. **Efficiency First:** Optimize for savings, debt reduction, and wealth growth.
3. **Clear Communication:** Explain financial concepts in plain language.
4. **Actionable Advice:** Provide specific, concrete next steps.
5. **Contextual Awareness:** Prioritize long-term financial health.

**Response format:**
- Be concise but comprehensive
- Use bullet points for lists
- Include specific numbers when available
- Always suggest a clear next step`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { message, financialContext, agentPrompt } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add OPENROUTER_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const systemPrompt = agentPrompt || DEFAULT_SYSTEM_PROMPT;
    const fullSystemPrompt = financialContext
      ? `${systemPrompt}\n\n---\n\n**Current Financial Context:**\n${financialContext}`
      : systemPrompt;

    // Create streaming response using OpenRouter API
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
              'X-Title': 'Axiom Finance',
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: [
                { role: 'system', content: fullSystemPrompt },
                { role: 'user', content: message },
              ],
              stream: true,
              max_tokens: 1500,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: '\n\n[Error: AI service unavailable. Please check your API key.]' })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
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

              if (trimmed.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
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
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: '\n\n[Error: Failed to get AI response. Please try again.]' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
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
