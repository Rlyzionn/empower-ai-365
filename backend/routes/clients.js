// ============================================================
//  Client Routes — Full CRUD for your resale clients
//  GET    /api/clients
//  POST   /api/clients
//  GET    /api/clients/:id
//  PATCH  /api/clients/:id
//  DELETE /api/clients/:id
//  GET    /api/clients/:id/usage
//  GET    /api/clients/:id/stats
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { requireAuth, requireOwner } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ── GET /api/clients ──────────────────────────────────────
// List all clients for this platform, with current month usage
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { layer, status, search } = req.query;

  let query = supabaseAdmin
    .from('clients')
    .select(`
      *,
      usage:usage(minutes_used, extra_minutes, call_count, month)
    `)
    .eq('platform_id', req.platformId)
    .order('created_at', { ascending: false });

  if (layer)  query = query.eq('layer', layer);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;

  // Attach current month usage to each client
  const currentMonth = new Date().toISOString().slice(0, 7);
  const enriched = data.map(client => {
    const thisMonth = (client.usage || []).find(u =>
      u.month && u.month.startsWith(currentMonth)
    );
    return {
      ...client,
      minutes_used:  thisMonth?.minutes_used  || 0,
      extra_minutes: thisMonth?.extra_minutes || 0,
      total_calls:   thisMonth?.call_count    || 0,
      usage: undefined,
    };
  });

  res.json({ data: enriched, count: enriched.length });
}));

// ── POST /api/clients ─────────────────────────────────────
// Add a new client to the platform
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const {
    name, contact_name, contact_email, contact_title, industry,
    phone_number, location, layer, plan, price_per_min, cost_per_min,
    extra_price_per_min, minutes_included, compliance, crm_system,
    calendar_system, voice_model, ai_model, languages, concurrent_calls,
    retell_agent_id, n8n_webhook_url, slack_webhook_url, notes,
  } = req.body;

  if (!name)  return res.status(400).json({ error: 'Client name is required.' });
  if (!layer) return res.status(400).json({ error: 'Layer (managed / self-hosted) is required.' });
  if (!plan)  return res.status(400).json({ error: 'Plan is required.' });

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({
      platform_id: req.platformId,
      name, contact_name, contact_email, contact_title, industry,
      phone_number, location, layer, plan, price_per_min, cost_per_min,
      extra_price_per_min, minutes_included: minutes_included || 2000,
      compliance: compliance || [],
      crm_system, calendar_system, voice_model, ai_model,
      languages: languages || ['English'],
      concurrent_calls, retell_agent_id, n8n_webhook_url, slack_webhook_url, notes,
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`✅ New client added: ${name} (${layer})`);
  res.status(201).json({ data, message: `${name} has been added to your platform.` });
}));

// ── GET /api/clients/:id ──────────────────────────────────
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Client not found.' });
  res.json({ data });
}));

// ── PATCH /api/clients/:id ────────────────────────────────
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  // Don't allow changing platform_id
  const updates = { ...req.body };
  delete updates.platform_id;
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(updates)
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .select()
    .single();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Client not found.' });

  res.json({ data, message: 'Client updated successfully.' });
}));

// ── DELETE /api/clients/:id ───────────────────────────────
router.delete('/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  // Soft delete — just set status to suspended rather than destroying data
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'suspended' })
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .select('name')
    .single();

  if (error || !data) return res.status(404).json({ error: 'Client not found.' });
  res.json({ message: `${data.name} has been deactivated.` });
}));

// ── GET /api/clients/:id/usage ────────────────────────────
// Usage history for a client (last 6 months)
router.get('/:id/usage', requireAuth, asyncHandler(async (req, res) => {
  // Verify this client belongs to our platform
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, name, minutes_included')
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .single();

  if (!client) return res.status(404).json({ error: 'Client not found.' });

  const { data, error } = await supabaseAdmin
    .from('usage')
    .select('*')
    .eq('client_id', req.params.id)
    .order('month', { ascending: false })
    .limit(6);

  if (error) throw error;

  res.json({
    data,
    client_name: client.name,
    minutes_included: client.minutes_included,
  });
}));

// ── GET /api/clients/:id/stats ────────────────────────────
// Quick stats for the client detail panel
router.get('/:id/stats', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [clientRes, callRes, leadRes] = await Promise.all([
    supabaseAdmin.from('clients').select('*').eq('id', id).eq('platform_id', req.platformId).single(),
    supabaseAdmin.from('call_logs').select('duration_secs, sentiment, started_at')
      .eq('client_id', id).order('started_at', { ascending: false }).limit(200),
    supabaseAdmin.from('leads').select('id, status').eq('client_id', id),
  ]);

  if (!clientRes.data) return res.status(404).json({ error: 'Client not found.' });

  const calls = callRes.data || [];
  const totalMinutes = calls.reduce((s, c) => s + (c.duration_secs || 0) / 60, 0);
  const avgDuration  = calls.length ? totalMinutes / calls.length : 0;
  const sentiments   = { positive: 0, neutral: 0, negative: 0 };
  calls.forEach(c => { if (c.sentiment) sentiments[c.sentiment]++; });

  res.json({
    data: {
      total_calls:    calls.length,
      avg_duration:   Math.round(avgDuration * 10) / 10,
      total_minutes:  Math.round(totalMinutes),
      sentiment:      sentiments,
      total_leads:    (leadRes.data || []).length,
      open_leads:     (leadRes.data || []).filter(l => l.status === 'new').length,
    },
  });
}));

module.exports = router;
