// ============================================================
//  Call Log Routes
//  GET  /api/calls
//  GET  /api/calls/:id
//  GET  /api/calls/:id/recording   (signed URL)
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ── GET /api/calls ────────────────────────────────────────
// Paginated, filterable call log list for this platform
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const {
    client_id, sentiment, is_lead, is_escalation,
    search, limit = 50, offset = 0,
    date_from, date_to,
  } = req.query;

  let query = supabaseAdmin
    .from('call_logs')
    .select(`
      id, client_id, started_at, ended_at, duration_secs,
      caller_number, intent, outcome, sentiment,
      is_lead, is_escalation, summary, tags, layer,
      client:clients(name)
    `, { count: 'exact' })
    .eq('platform_id', req.platformId)
    .order('started_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (client_id)    query = query.eq('client_id', client_id);
  if (sentiment)    query = query.eq('sentiment', sentiment);
  if (is_lead === 'true')       query = query.eq('is_lead', true);
  if (is_escalation === 'true') query = query.eq('is_escalation', true);
  if (date_from)    query = query.gte('started_at', date_from);
  if (date_to)      query = query.lte('started_at', date_to);
  if (search)       query = query.or(`intent.ilike.%${search}%,summary.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;

  res.json({
    data:   data || [],
    count,
    limit:  Number(limit),
    offset: Number(offset),
  });
}));

// ── GET /api/calls/:id ────────────────────────────────────
// Full call detail including complete transcript
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('call_logs')
    .select(`
      *,
      client:clients(id, name, layer, plan)
    `)
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Call not found.' });
  res.json({ data });
}));

// ── GET /api/calls/:id/recording ─────────────────────────
// Returns a short-lived signed URL to play the call recording
router.get('/:id/recording', requireAuth, asyncHandler(async (req, res) => {
  const { data: call } = await supabaseAdmin
    .from('call_logs')
    .select('recording_url')
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .single();

  if (!call || !call.recording_url) {
    return res.status(404).json({ error: 'No recording available for this call.' });
  }

  // If it's a Supabase Storage path, generate a signed URL (60 min expiry)
  if (!call.recording_url.startsWith('http')) {
    const { data: signedUrl, error } = await supabaseAdmin
      .storage
      .from('recordings')
      .createSignedUrl(call.recording_url, 3600);

    if (error) throw error;
    return res.json({ url: signedUrl.signedUrl });
  }

  // If it's already a full URL (e.g. from Retell AI)
  res.json({ url: call.recording_url });
}));

module.exports = router;
