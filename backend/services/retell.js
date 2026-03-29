// ============================================================
//  Retell AI — API Client
//  Wraps all Retell REST API calls.
//  Retell also gives ElevenLabs voice access via their platform.
// ============================================================

const BASE = 'https://api.retellai.com';

async function retellFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      'Content-Type':  'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `Retell API ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.retellError = data;
    throw err;
  }
  return data;
}

// ── LLM Management ──────────────────────────────────────────
const retell = {

  // ── LLM Management ────────────────────────────────────────
  createLLM: (payload) => retellFetch('/create-retell-llm', {
    method: 'POST', body: JSON.stringify(payload),
  }),

  getLLM: (llmId) => retellFetch(`/get-retell-llm/${llmId}`),

  updateLLM: (llmId, payload) => retellFetch(`/update-retell-llm/${llmId}`, {
    method: 'PATCH', body: JSON.stringify(payload),
  }),

  listLLMs: () => retellFetch('/list-retell-llm'),

  // ── Agent Management ───────────────────────────────────────
  createAgent: (payload) => retellFetch('/create-agent', {
    method: 'POST', body: JSON.stringify(payload),
  }),

  getAgent: (agentId) => retellFetch(`/get-agent/${agentId}`),

  listAgents: () => retellFetch('/list-agents'),

  updateAgent: (agentId, payload) => retellFetch(`/update-agent/${agentId}`, {
    method: 'PATCH', body: JSON.stringify(payload),
  }),

  deleteAgent: (agentId) => retellFetch(`/delete-agent/${agentId}`, {
    method: 'DELETE',
  }),

  // ── Web / Phone Calls (v2 endpoints) ──────────────────────
  createWebCall: (payload) => retellFetch('/v2/create-web-call', {
    method: 'POST', body: JSON.stringify(payload),
  }),

  createPhoneCall: (payload) => retellFetch('/v2/create-phone-call', {
    method: 'POST', body: JSON.stringify(payload),
  }),

  getCall: (callId) => retellFetch(`/v2/get-call/${callId}`),

  listCalls: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null))
    ).toString();
    return retellFetch(`/v2/list-calls${qs ? '?' + qs : ''}`);
  },

  // ── Phone Numbers (v2 endpoints) ──────────────────────────
  listPhoneNumbers: () => retellFetch('/v2/list-phone-numbers'),

  purchasePhoneNumber: (areaCode, agentId) => retellFetch('/v2/create-phone-number', {
    method: 'POST',
    body: JSON.stringify({ area_code: areaCode, inbound_agent_id: agentId }),
  }),

  // ── Voices (ElevenLabs + others via Retell) ────────────────
  listVoices: () => retellFetch('/list-voices'),

};

module.exports = retell;
