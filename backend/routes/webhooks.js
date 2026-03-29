// ============================================================
//  Webhook Routes — Receives real-time call events
//
//  POST /api/webhooks/retell            ← Retell AI (managed layer)
//  POST /api/webhooks/pipecat/:clientId ← Pipecat (self-hosted layer)
//
//  HOW TO SET UP:
//  In Retell AI dashboard → Agents → your agent → Webhook URL:
//    https://your-api.domain.com/api/webhooks/retell
//
//  In your Pipecat pipeline config → on_call_end callback:
//    https://your-api.domain.com/api/webhooks/pipecat/<client-uuid>
// ============================================================
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { supabaseAdmin }            = require('../services/supabase');
const { sendNotifications }        = require('../services/notifications');
const { asyncHandler }             = require('../middleware/errorHandler');

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

/** Verify Retell AI HMAC-SHA256 webhook signature */
function verifyRetellSignature(rawBody, signatureHeader) {
  const secret = process.env.RETELL_WEBHOOK_SECRET;
  if (!secret) return true; // Skip in dev if not configured
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader || '', 'utf8'),
      Buffer.from(expected, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Detect lead / escalation from AI analysis.
 * Retell lets you define a custom analysis schema per agent —
 * we expect it to return { is_lead, is_escalation, intent, sentiment }
 * in call_analysis.custom_analysis_data.
 */
function parseCallAnalysis(callObj) {
  const analysis = callObj.call_analysis || {};
  const custom   = analysis.custom_analysis_data || {};

  // Try to get structured AI output first, fall back to heuristics
  const sentiment = (
    custom.sentiment ||
    analysis.user_sentiment ||
    'neutral'
  ).toLowerCase().replace('positive', 'positive').replace('negative', 'negative');

  const isLead = !!(
    custom.is_lead ||
    (analysis.call_successful && callObj.direction === 'inbound')
  );

  const isEscalation = !!(
    custom.is_escalation ||
    (analysis.call_summary || '').toLowerCase().includes('emergency') ||
    (analysis.call_summary || '').toLowerCase().includes('urgent')   ||
    (analysis.call_summary || '').toLowerCase().includes('escalat')
  );

  const intent  = custom.intent  || extractIntent(analysis.call_summary || '');
  const outcome = custom.outcome || (analysis.call_successful ? 'Resolved' : 'Unresolved');

  const tags = [];
  if (isLead)       tags.push('lead');
  if (isEscalation) tags.push('escalation');
  if (analysis.in_voicemail) tags.push('voicemail');
  if ((callObj.transcript_object || []).length > 10) tags.push('long-call');

  return {
    intent,
    outcome,
    sentiment: ['positive','neutral','negative'].includes(sentiment) ? sentiment : 'neutral',
    is_lead:        isLead,
    is_escalation:  isEscalation,
    is_voicemail:   !!(analysis.in_voicemail),
    call_successful: !!(analysis.call_successful ?? true),
    summary:         analysis.call_summary || null,
    tags,
  };
}

/** Simple intent extractor from summary text */
function extractIntent(summary) {
  const s = summary.toLowerCase();
  if (s.includes('appointment') || s.includes('book'))    return 'Appointment Booking';
  if (s.includes('emergency') || s.includes('urgent'))   return 'Emergency / Escalation';
  if (s.includes('information') || s.includes('inquir')) return 'Information Request';
  if (s.includes('complaint'))                            return 'Complaint';
  if (s.includes('sales') || s.includes('purchase'))     return 'Sales Inquiry';
  if (s.includes('cancel'))                               return 'Cancellation Request';
  if (s.includes('follow'))                               return 'Follow-up Call';
  return 'General Inquiry';
}

/** Normalize transcript from Retell format to our JSONB format */
function normalizeTranscript(transcriptObj = []) {
  return transcriptObj.map(line => ({
    speaker: line.role === 'agent' ? 'AI' : 'Caller',
    text:    line.content || '',
  }));
}

// ─────────────────────────────────────────────────────────────
//  POST /api/webhooks/retell  — Managed Layer
// ─────────────────────────────────────────────────────────────
router.post('/retell', asyncHandler(async (req, res) => {
  // rawBody is a Buffer because we used express.raw() in server.js
  const rawBody   = req.body;
  const signature = req.headers['x-retell-signature'];

  if (!verifyRetellSignature(rawBody, signature)) {
    console.warn('[Webhook/Retell] Invalid signature — rejected');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  // Parse JSON from raw buffer
  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  const { event, call } = payload;

  // We only care about call_ended and call_analyzed
  if (!['call_ended', 'call_analyzed'].includes(event)) {
    return res.status(200).json({ received: true, skipped: event });
  }

  console.log(`[Webhook/Retell] ${event} — call_id: ${call.call_id}`);

  // ── 1. Look up which client owns this Retell agent ──────
  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select('id, platform_id, name, layer, price_per_min, cost_per_min, n8n_webhook_url, slack_webhook_url')
    .eq('retell_agent_id', call.agent_id)
    .single();

  if (clientErr || !client) {
    console.warn(`[Webhook/Retell] No client found for agent_id: ${call.agent_id}`);
    return res.status(200).json({ received: true, note: 'Agent not registered in VoiceDesk.' });
  }

  // ── 2. Check for duplicate (Retell may retry) ───────────
  const { data: existing } = await supabaseAdmin
    .from('call_logs')
    .select('id')
    .eq('external_call_id', call.call_id)
    .single();

  if (existing) {
    return res.status(200).json({ received: true, note: 'Duplicate — already processed.' });
  }

  // ── 3. Parse & analyze the call ─────────────────────────
  const startedAt = new Date(call.start_timestamp);
  const endedAt   = new Date(call.end_timestamp);
  const durationSecs = Math.round((call.end_timestamp - call.start_timestamp) / 1000);

  const analysis    = parseCallAnalysis(call);
  const transcript  = normalizeTranscript(call.transcript_object);

  // ── 4. Save call log ─────────────────────────────────────
  const { data: callLog, error: insertErr } = await supabaseAdmin
    .from('call_logs')
    .insert({
      client_id:       client.id,
      platform_id:     client.platform_id,
      external_call_id: call.call_id,
      started_at:      startedAt.toISOString(),
      ended_at:        endedAt.toISOString(),
      duration_secs:   durationSecs,
      caller_number:   call.from_number,
      called_number:   call.to_number,
      direction:       call.direction || 'inbound',
      layer:           'managed',
      recording_url:   call.recording_url || null,
      transcript,
      raw_payload:     payload,
      ...analysis,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[Webhook/Retell] DB insert error:', insertErr.message);
    throw insertErr;
  }

  // ── 5. Create lead record if applicable ──────────────────
  if (analysis.is_lead) {
    await supabaseAdmin.from('leads').insert({
      call_log_id:  callLog.id,
      client_id:    client.id,
      platform_id:  client.platform_id,
      caller_number: call.from_number,
      summary:      analysis.summary,
      score:        'medium',
      crm_system:   'pending',
    });
  }

  // ── 6. Fire notifications asynchronously ─────────────────
  sendNotifications(callLog, client).catch(err =>
    console.error('[Webhook/Retell] Notification error:', err.message)
  );

  console.log(`✅ [Retell] Logged: ${analysis.intent} for ${client.name} (${durationSecs}s)`);
  res.status(200).json({ received: true, call_log_id: callLog.id });
}));

// ─────────────────────────────────────────────────────────────
//  POST /api/webhooks/pipecat/:clientId  — Self-Hosted Layer
//
//  Add this URL to your Pipecat pipeline as the call_end webhook.
//  We accept a flexible payload — map your Pipecat output below.
// ─────────────────────────────────────────────────────────────
router.post('/pipecat/:clientId', asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  // Parse body (already JSON from express.raw → JSON.parse)
  let payload;
  try {
    payload = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body instanceof Buffer
        ? JSON.parse(req.body.toString('utf8'))
        : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON.' });
  }

  // ── 1. Look up client & verify it's a self-hosted client ─
  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select('id, platform_id, name, layer, n8n_webhook_url, slack_webhook_url')
    .eq('id', clientId)
    .eq('layer', 'self-hosted')
    .single();

  if (clientErr || !client) {
    return res.status(404).json({ error: 'Client not found or not a self-hosted client.' });
  }

  // ── 2. Normalize the Pipecat payload ─────────────────────
  //  Pipecat pipeline output format (customise to match your config):
  //  {
  //    call_id, started_at, ended_at, duration_secs,
  //    from_number, transcript: [{role, content}],
  //    summary, sentiment, is_lead, is_escalation
  //  }
  const external_call_id = payload.call_id || payload.session_id || `pipecat-${Date.now()}`;

  // Deduplicate
  const { data: existing } = await supabaseAdmin
    .from('call_logs')
    .select('id')
    .eq('external_call_id', external_call_id)
    .single();

  if (existing) return res.status(200).json({ received: true, note: 'Duplicate.' });

  const durationSecs = payload.duration_secs || 0;
  const startedAt    = payload.started_at   || new Date(Date.now() - durationSecs * 1000).toISOString();
  const endedAt      = payload.ended_at     || new Date().toISOString();

  const sentiment = (payload.sentiment || 'neutral').toLowerCase();
  const isLead       = !!(payload.is_lead);
  const isEscalation = !!(payload.is_escalation);
  const intent       = payload.intent  || extractIntent(payload.summary || '');
  const outcome      = payload.outcome || 'Completed';
  const transcript   = normalizeTranscript(payload.transcript || []);
  const tags         = [];
  if (isLead)       tags.push('lead');
  if (isEscalation) tags.push('escalation');

  // ── 3. Save call log ─────────────────────────────────────
  const { data: callLog, error: insertErr } = await supabaseAdmin
    .from('call_logs')
    .insert({
      client_id:       client.id,
      platform_id:     client.platform_id,
      external_call_id,
      started_at:      startedAt,
      ended_at:        endedAt,
      duration_secs:   durationSecs,
      caller_number:   payload.from_number || null,
      called_number:   payload.to_number   || null,
      direction:       payload.direction   || 'inbound',
      layer:           'self-hosted',
      recording_url:   payload.recording_url || null,
      transcript,
      summary:         payload.summary    || null,
      intent,
      outcome,
      sentiment:       ['positive','neutral','negative'].includes(sentiment) ? sentiment : 'neutral',
      is_lead:         isLead,
      is_escalation:   isEscalation,
      is_voicemail:    !!(payload.is_voicemail),
      call_successful: !(isEscalation),
      tags,
      raw_payload:     payload,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[Webhook/Pipecat] DB insert error:', insertErr.message);
    throw insertErr;
  }

  // Create lead record
  if (isLead) {
    await supabaseAdmin.from('leads').insert({
      call_log_id:  callLog.id,
      client_id:    client.id,
      platform_id:  client.platform_id,
      caller_number: payload.from_number,
      summary:      payload.summary,
    });
  }

  // Fire notifications
  sendNotifications(callLog, client).catch(err =>
    console.error('[Webhook/Pipecat] Notification error:', err.message)
  );

  console.log(`✅ [Pipecat] Logged: ${intent} for ${client.name} (${durationSecs}s)`);
  res.status(200).json({ received: true, call_log_id: callLog.id });
}));

module.exports = router;
