// ============================================================
//  OpenRouter — LLM Gateway
//  OpenAI-compatible API that routes to any model.
//  Used by the Retell Custom LLM WebSocket endpoint.
// ============================================================

const BASE = 'https://openrouter.ai/api/v1';

/**
 * Chat completion (non-streaming)
 */
async function chat(messages, options = {}) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type':   'application/json',
      'HTTP-Referer':   'https://empowerai365.com',
      'X-Title':        'Empower AI 365',
    },
    body: JSON.stringify({
      model:       options.model || process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens:  options.max_tokens  ?? 500,
      stream:      false,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenRouter error ${res.status}`);
  return data.choices[0].message.content;
}

/**
 * Streaming chat completion — yields text chunks
 * Used by the Retell LLM WebSocket for real-time responses
 */
async function* chatStream(messages, options = {}) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://empowerai365.com',
      'X-Title':       'Empower AI 365',
    },
    body: JSON.stringify({
      model:       options.model || process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens:  options.max_tokens  ?? 300,
      stream:      true,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `OpenRouter stream error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;
      try {
        const parsed = JSON.parse(raw);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* skip malformed */ }
    }
  }
}

/**
 * One-shot analysis — classify a call summary
 */
async function analyzeCall(summary, clientContext = '') {
  const prompt = `You are analyzing a phone call for a business.
${clientContext ? `Business context: ${clientContext}` : ''}

Call summary: "${summary}"

Return a JSON object with these fields:
- intent: (string) the caller's primary intent in 2-4 words
- sentiment: (string) "positive", "neutral", or "negative"
- is_lead: (boolean) true if the caller showed buying interest
- is_escalation: (boolean) true if this needs immediate human attention
- outcome: (string) what happened in 2-4 words

Return ONLY valid JSON, no markdown.`;

  try {
    const result = await chat([{ role: 'user', content: prompt }], {
      model: 'openai/gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 200,
    });
    return JSON.parse(result);
  } catch {
    return null; // graceful failure
  }
}

module.exports = { chat, chatStream, analyzeCall };
