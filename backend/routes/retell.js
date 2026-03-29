// ============================================================
//  Retell AI Routes
//
//  GET  /api/retell/voices              ← List ElevenLabs + other voices
//  GET  /api/retell/agents              ← List all agents
//  POST /api/retell/agents              ← Create agent for a client
//  GET  /api/retell/agents/:id          ← Get agent details
//  PATCH /api/retell/agents/:id         ← Update agent
//  DELETE /api/retell/agents/:id        ← Delete agent
//  POST /api/retell/web-call            ← Create demo web call (landing page)
//  POST /api/retell/phone-call          ← Initiate outbound call
//  GET  /api/retell/phone-numbers       ← List phone numbers
//  POST /api/retell/setup-demo-agent    ← One-time: create Empower demo agent
// ============================================================
require('dotenv').config();
const express        = require('express');
const router         = express.Router();
const retell         = require('../services/retell');
const { supabaseAdmin } = require('../services/supabase');
const { requireAuth, requireOwner } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ── GET /api/retell/voices ───────────────────────────────────
// Lists all available voices (ElevenLabs + Retell native)
router.get('/voices', requireAuth, asyncHandler(async (req, res) => {
  const voices = await retell.listVoices();
  res.json({ data: voices });
}));

// ── GET /api/retell/agents ───────────────────────────────────
router.get('/agents', requireAuth, asyncHandler(async (req, res) => {
  const agents = await retell.listAgents();
  res.json({ data: agents });
}));

// ── POST /api/retell/agents ──────────────────────────────────
// Create a Retell agent for a client. Supports both Retell LLM and Custom LLM.
router.post('/agents', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const {
    client_id,          // Our client UUID (to link back)
    agent_name,
    voice_id,           // ElevenLabs voice ID
    system_prompt,      // The AI's personality + instructions
    llm_websocket_url,  // Optional: use custom LLM (OpenRouter) instead of Retell LLM
    begin_message,
    language = 'en-US',
    ambient_sound,
    response_engine_type = 'retell-llm', // 'retell-llm' or 'custom-llm'
  } = req.body;

  if (!agent_name || !voice_id || !system_prompt) {
    return res.status(400).json({ error: 'agent_name, voice_id, and system_prompt are required.' });
  }

  let responseEngine;

  if (response_engine_type === 'custom-llm' && llm_websocket_url) {
    // Custom LLM WebSocket (OpenRouter)
    responseEngine = {
      type: 'custom-llm',
      llm_websocket_url,
    };
  } else {
    // Retell built-in LLM (uses their model infrastructure)
    const llm = await retell.createLLM({
      model: 'gpt-4o-mini',
      system_prompt,
      begin_message: begin_message || `Hello! I'm your AI assistant from Empower AI 365. How can I help you today?`,
    });
    responseEngine = {
      type: 'retell-llm',
      llm_id: llm.llm_id,
    };
  }

  // Create the Retell agent
  const agent = await retell.createAgent({
    agent_name,
    voice_id,
    response_engine: responseEngine,
    language,
    ambient_sound:           ambient_sound || null,
    enable_backchannel:      true,
    backchannel_frequency:   0.9,
    backchannel_words:       ['okay', 'got it', 'sure', 'of course'],
    reminder_trigger_ms:     10000,
    reminder_max_count:      2,
    normalize_for_speech:    true,
    end_call_after_silence_ms: 30000,
    max_call_duration_ms:    1800000, // 30 min max
    // Post-call analysis schema to detect leads/escalations
    post_call_analysis_data: [
      { name: 'intent',        type: 'string',  description: "Caller's primary intent in 2-4 words" },
      { name: 'sentiment',     type: 'enum',    choices: ['positive', 'neutral', 'negative'], description: 'Overall caller sentiment' },
      { name: 'is_lead',       type: 'boolean', description: 'True if caller showed buying or appointment interest' },
      { name: 'is_escalation', type: 'boolean', description: 'True if human follow-up is urgently needed' },
      { name: 'outcome',       type: 'string',  description: 'What was resolved or achieved in 2-4 words' },
    ],
  });

  // Link agent to client in our database
  if (client_id) {
    await supabaseAdmin
      .from('clients')
      .update({ retell_agent_id: agent.agent_id })
      .eq('id', client_id);
  }

  res.json({ data: agent });
}));

// ── GET /api/retell/agents/:id ───────────────────────────────
router.get('/agents/:id', requireAuth, asyncHandler(async (req, res) => {
  const agent = await retell.getAgent(req.params.id);
  res.json({ data: agent });
}));

// ── PATCH /api/retell/agents/:id ────────────────────────────
router.patch('/agents/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const agent = await retell.updateAgent(req.params.id, req.body);
  res.json({ data: agent });
}));

// ── DELETE /api/retell/agents/:id ───────────────────────────
router.delete('/agents/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  await retell.deleteAgent(req.params.id);
  // Unlink from client
  await supabaseAdmin
    .from('clients')
    .update({ retell_agent_id: null })
    .eq('retell_agent_id', req.params.id);
  res.json({ success: true });
}));

// ── POST /api/retell/web-call ────────────────────────────────
// Creates a web call session. Called by the "Talk to Empower" button on the landing page.
// Returns access_token for the Retell Web SDK.
router.post('/web-call', asyncHandler(async (req, res) => {
  const { agent_id, metadata = {} } = req.body;

  // Use demo agent if no specific agent provided
  const agentId = agent_id || process.env.RETELL_DEMO_AGENT_ID;

  if (!agentId) {
    return res.status(400).json({
      error: 'No demo agent configured. Run POST /api/retell/setup-demo-agent first.',
    });
  }

  const webCall = await retell.createWebCall({
    agent_id: agentId,
    metadata: {
      source: 'landing_page_demo',
      ...metadata,
    },
  });

  res.json({
    access_token: webCall.access_token,
    call_id:      webCall.call_id,
    agent_id:     webCall.agent_id,
  });
}));

// ── POST /api/retell/phone-call ──────────────────────────────
// Initiate an outbound phone call
router.post('/phone-call', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { from_number, to_number, agent_id, metadata } = req.body;
  if (!from_number || !to_number || !agent_id) {
    return res.status(400).json({ error: 'from_number, to_number, and agent_id are required.' });
  }

  const call = await retell.createPhoneCall({
    from_number,
    to_number,
    override_agent_id: agent_id,
    metadata,
  });

  res.json({ data: call });
}));

// ── GET /api/retell/phone-numbers ────────────────────────────
router.get('/phone-numbers', requireAuth, asyncHandler(async (req, res) => {
  const numbers = await retell.listPhoneNumbers();
  res.json({ data: numbers });
}));

// ── POST /api/retell/setup-demo-agent ───────────────────────
// One-time setup: creates the "Empower AI 365" demo agent
// Stores the agent ID. Call this ONCE after Phase 2 setup.
router.post('/setup-demo-agent', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { voice_id } = req.body; // Optional: pass a specific ElevenLabs voice ID

  // 1. Get available voices and pick a good default
  let selectedVoiceId = voice_id;
  if (!selectedVoiceId) {
    try {
      const voices = await retell.listVoices();
      // Prefer ElevenLabs "Rachel" or similar professional female voice
      const preferred = (voices || []).find(v =>
        v.voice_name?.toLowerCase().includes('rachel') ||
        v.voice_name?.toLowerCase().includes('jessica') ||
        v.voice_name?.toLowerCase().includes('aria') ||
        v.provider === 'elevenlabs'
      );
      selectedVoiceId = preferred?.voice_id || (voices?.[0]?.voice_id);
    } catch {
      return res.status(400).json({ error: 'Could not fetch voices. Check RETELL_API_KEY.' });
    }
  }

  if (!selectedVoiceId) {
    return res.status(400).json({ error: 'No voice available. Pass a voice_id in the request body.' });
  }

  // 2. Create the LLM prompt for the demo agent
  const systemPrompt = `You are Empower, the AI voice assistant for Empower AI 365 — a company that deploys intelligent AI voice agents for businesses.

Your role: Demonstrate what an AI voice agent can do for their business.

Personality: Warm, professional, enthusiastic but not pushy. Speak naturally and conversationally.

When someone calls:
1. Greet them warmly as Empower from Empower AI 365
2. Ask what type of business they run
3. Demonstrate how you could handle calls for their specific industry (role-play briefly)
4. Highlight key benefits: 24/7 availability, no hold times, lead capture, appointment scheduling
5. Offer to have a real human from the team reach out to set up their agent

Key talking points:
- AI voice agents answer every call — even at 2am
- No hold music, no voicemail — instant, intelligent responses
- Every call is logged, transcribed, and summarized automatically
- Setup takes days, not months
- Pricing starts at just $0.05/minute

Keep responses concise — 2-3 sentences max. This is a voice call.`;

  // 3. Create Retell LLM
  const llm = await retell.createLLM({
    model: 'gpt-4o-mini',
    system_prompt: systemPrompt,
    begin_message: "Hi there! I'm Empower, your AI voice assistant from Empower AI 365. I handle calls just like this one — 24 hours a day, 7 days a week. What kind of business do you run?",
  });

  // 4. Create Retell Agent
  const agent = await retell.createAgent({
    agent_name: 'Empower AI 365 — Demo Agent',
    voice_id: selectedVoiceId,
    response_engine: { type: 'retell-llm', llm_id: llm.llm_id },
    language: 'en-US',
    enable_backchannel: true,
    normalize_for_speech: true,
    end_call_after_silence_ms: 20000,
    max_call_duration_ms: 300000, // 5 min demo max
    post_call_analysis_data: [
      { name: 'interested',   type: 'boolean', description: 'True if caller showed interest in getting an agent' },
      { name: 'business_type', type: 'string', description: 'Type of business the caller runs' },
    ],
  });

  // 5. Save demo agent ID to platform settings (so web-call endpoint can use it)
  const platformId = req.platformId;
  if (platformId) {
    await supabaseAdmin
      .from('platforms')
      .update({ settings: { demo_agent_id: agent.agent_id, demo_llm_id: llm.llm_id } })
      .eq('id', platformId);
  }

  console.log(`✅ Demo agent created: ${agent.agent_id}`);
  console.log(`   Add to .env: RETELL_DEMO_AGENT_ID=${agent.agent_id}`);

  res.json({
    success: true,
    agent_id: agent.agent_id,
    llm_id:   llm.llm_id,
    voice_id: selectedVoiceId,
    message:  `Demo agent created! Add RETELL_DEMO_AGENT_ID=${agent.agent_id} to your .env file.`,
  });
}));

module.exports = router;
