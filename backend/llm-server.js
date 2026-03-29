// ============================================================
//  Retell Custom LLM — WebSocket Server
//
//  This server runs alongside the main Express API.
//  Retell connects to it via wss:// when an agent uses "custom-llm".
//
//  Start: node llm-server.js
//  Port:  process.env.LLM_WS_PORT (default 3002)
//
//  In production, expose this at:
//    wss://api.empowerai365.com/llm-ws
//  OR run separately and set RETELL_LLM_WS_URL=wss://llm.empowerai365.com
//
//  Retell WebSocket Protocol:
//  1. Retell connects, sends initial "config" if needed
//  2. For each conversation turn, Retell sends:
//     { interaction_type: "response_required", transcript: [...] }
//  3. We respond with streaming chunks:
//     { response_type: "response", content: "chunk...", content_complete: false }
//  4. Final chunk: { response_type: "response", content: ".", content_complete: true }
// ============================================================
require('dotenv').config();
const { WebSocketServer } = require('ws');
const { chatStream } = require('./services/openrouter');

const PORT = parseInt(process.env.LLM_WS_PORT || '3002', 10);

// Default system prompt (overridden per-agent via metadata)
const DEFAULT_SYSTEM_PROMPT = `You are a professional AI phone assistant for a business.
Be helpful, concise, and friendly. Keep responses to 1-3 sentences — this is a voice call.
Never mention you're an AI unless directly asked.`;

const wss = new WebSocketServer({ port: PORT });

console.log(`\n🤖  Retell LLM WebSocket server running on ws://localhost:${PORT}`);
console.log(`    Expose publicly for Retell to connect.\n`);

wss.on('connection', (ws, req) => {
  const remoteIp = req.socket.remoteAddress;
  console.log(`[LLM-WS] New connection from ${remoteIp}`);

  let callConfig = null; // Will be set on first message

  ws.on('message', async (rawData) => {
    let msg;
    try { msg = JSON.parse(rawData.toString()); } catch {
      console.warn('[LLM-WS] Invalid JSON — ignoring');
      return;
    }

    // ── Handle call_details (initial message from Retell) ────
    if (msg.interaction_type === 'call_details') {
      callConfig = msg;
      console.log(`[LLM-WS] Call started | agent: ${msg.agent_id || 'unknown'}`);
      // Send begin_message if configured
      const beginMsg = msg.agent_custom_data?.begin_message;
      if (beginMsg) {
        ws.send(JSON.stringify({
          response_type:     'response',
          content:           beginMsg,
          content_complete:  true,
        }));
      }
      return;
    }

    // ── Handle reminder (Retell asks us to prompt the user) ──
    if (msg.interaction_type === 'reminder_required') {
      ws.send(JSON.stringify({
        response_type:    'response',
        content:          'Are you still there?',
        content_complete: true,
      }));
      return;
    }

    // ── Handle response_required (main conversation) ─────────
    if (msg.interaction_type !== 'response_required') return;

    const transcript = msg.transcript || [];

    // Build messages for OpenRouter
    const systemPrompt = callConfig?.agent_custom_data?.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const model        = callConfig?.agent_custom_data?.model || process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...transcript.map(t => ({
        role:    t.role === 'agent' ? 'assistant' : 'user',
        content: t.content || '',
      })),
    ];

    // Stream response back to Retell
    try {
      let hasContent = false;

      for await (const chunk of chatStream(messages, { model, max_tokens: 250 })) {
        if (ws.readyState !== ws.OPEN) break;
        hasContent = true;
        ws.send(JSON.stringify({
          response_type:    'response',
          content:          chunk,
          content_complete: false,
        }));
      }

      // Send final complete signal
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          response_type:    'response',
          content:          hasContent ? '' : "I'm here, how can I help?",
          content_complete: true,
        }));
      }

    } catch (err) {
      console.error('[LLM-WS] OpenRouter error:', err.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          response_type:    'response',
          content:          "I'm sorry, I'm having trouble right now. Please try again in a moment.",
          content_complete: true,
        }));
      }
    }
  });

  ws.on('close', (code) => {
    console.log(`[LLM-WS] Connection closed (${code})`);
  });

  ws.on('error', (err) => {
    console.error('[LLM-WS] WebSocket error:', err.message);
  });
});

wss.on('error', (err) => {
  console.error('[LLM-WS] Server error:', err.message);
});
