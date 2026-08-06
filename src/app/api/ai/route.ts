import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, model, messages, apiKey, baseUrl } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Direct proxy to OpenRouter or OpenAI
    if (provider === 'openrouter' || provider === 'openai' || provider === 'groq') {
      let endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      if (provider === 'openai') endpoint = 'https://api.openai.com/v1/chat/completions';
      if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages,
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: errText }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      success: true,
      message: 'Proxy processed query.',
    });
  } catch (error) {
    console.error('AI Proxy API error:', error);
    return NextResponse.json({ error: 'AI Gateway invocation failed' }, { status: 500 });
  }
}
