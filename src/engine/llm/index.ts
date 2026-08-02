/**
 * Model-agnostic provider layer.
 *
 * The UI and services never talk to a model directly — they go through this
 * registry. Swap providers, add fallbacks, and change models without touching
 * product code. OpenRouter / OpenAI / Anthropic / local engines all conform to
 * the same `Provider` interface.
 */

export interface Provider {
  id: 'openai' | 'anthropic' | 'local';
  name: string;
  /** Whether an API key is configured for this provider. */
  available(): boolean;
  /** Generate a JSON response for a prompt (full pass, non-streaming). */
  generateJson(system: string, user: string): Promise<string>;
}

const JSON_SYSTEM = `You are Lumora, a precise curriculum engine. You always respond with valid JSON only — no markdown, no commentary. Every citation must come from the provided source text. Never fabricate content or citations.`;

class OpenAIProvider implements Provider {
  id = 'openai' as const;
  name = 'OpenAI';
  available() {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  async generateJson(system: string, user: string): Promise<string> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not configured.');
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: JSON_SYSTEM },
          { role: 'user', content: `${system}\n\n${user}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}

class AnthropicProvider implements Provider {
  id = 'anthropic' as const;
  name = 'Anthropic';
  available() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }
  async generateJson(system: string, user: string): Promise<string> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY is not configured.');
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        system: JSON_SYSTEM,
        messages: [{ role: 'user', content: `${system}\n\n${user}` }],
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.content?.map((b: { text?: string }) => b.text ?? '').join('') ?? '';
  }
}

type RemoteProvider = Omit<Provider, 'id'> & { id: 'openai' | 'anthropic' };
const PROVIDERS: RemoteProvider[] = [new OpenAIProvider(), new AnthropicProvider()];

export function listProviders(): Provider[] {
  return PROVIDERS;
}

/** Pick the first configured remote provider, or null when none is available. */
export function resolveRemoteProvider(): RemoteProvider | null {
  return PROVIDERS.find((p) => p.available()) ?? null;
}

export function isAnyRemoteConfigured(): boolean {
  return PROVIDERS.some((p) => p.available());
}

export function generateJson(providerId: Provider['id'], system: string, user: string): Promise<string> {
  const p = PROVIDERS.find((x) => x.id === providerId);
  if (!p) throw new Error(`Unknown provider: ${providerId}`);
  return p.generateJson(system, user);
}
