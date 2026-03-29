// ============================================================
//  Analytics Routes — Powers the dashboard KPI cards
//  GET /api/analytics/dashboard
//  GET /api/analytics/clients
//  GET /api/analytics/calls/trend
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { requireAuth }   = require('../middleware/auth');
const { asyncHandler }  = require('../middleware/errorHandler');

// ── GET /api/analytics/dashboard ─────────────────────────
// All KPIs needed for the main dashboard in one request
router.get('/dashboard', requireAuth, asyncHandler(async (req, res) => {
  const platformId = req.platformId;
  const now        = new Date();
  const thisMonth  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  // Run all queries in parallel for speed
  const [
    clientsRes,
    callsThis,
    callsLast,
    usageThis,
    usageLast,
    leadsRes,
    escalationsRes,
  ] = await Promise.all([
    // All clients
    supabaseAdmin
      .from('clients')
      .select('id, layer, price_per_min, cost_per_min, minutes_included, status')
      .eq('platform_id', platformId),

    // Calls this month
    supabaseAdmin
      .from('call_logs')
      .select('id, duration_secs, is_lead, is_escalation, sentiment, started_at')
      .eq('platform_id', platformId)
      .gte('started_at', thisMonth),

    // Calls last month (for trend comparison)
    supabaseAdmin
      .from('call_logs')
      .select('id, duration_secs')
      .eq('platform_id', platformId)
      .gte('started_at', lastMonth)
      .lt('started_at', thisMonth),

    // Usage this month
    supabaseAdmin
      .from('usage')
      .select('client_id, minutes_used, extra_minutes')
      .eq('platform_id', platformId)
      .gte('month', thisMonth),

    // Usage last month
    supabaseAdmin
      .from('usage')
      .select('client_id, minutes_used')
      .eq('platform_id', platformId)
      .gte('month', lastMonth)
      .lt('month', thisMonth),

    // Open leads
    supabaseAdmin
      .from('leads')
      .select('id, score, status, created_at')
      .eq('platform_id', platformId)
      .eq('status', 'new'),

    // Escalations this month
    supabaseAdmin
      .from('call_logs')
      .select('id')
      .eq('platform_id', platformId)
      .eq('is_escalation', true)
      .gte('started_at', thisMonth),
  ]);

  const clients     = clientsRes.data || [];
  const callsNow    = callsThis.data  || [];
  const callsPrev   = callsLast.data  || [];
  const usageNow    = usageThis.data  || [];
  const usagePrev   = usageLast.data  || [];

  // ── Revenue calculations ────────────────────────────────
  const calcMonthlyRevenue = (c) => {
    const usage = usageNow.find(u => u.client_id === c.id);
    const mins  = usage?.minutes_used || 0;
    return Math.round(mins * (c.price_per_min || 0));
  };
  const calcMonthlyProfit = (c) => {
    const usage = usageNow.find(u => u.client_id === c.id);
    const mins  = usage?.minutes_used || 0;
    return Math.round(mins * ((c.price_per_min || 0) - (c.cost_per_min || 0)));
  };

  const totalRevenue     = clients.reduce((s, c) => s + calcMonthlyRevenue(c), 0);
  const totalProfit      = clients.reduce((s, c) => s + calcMonthlyProfit(c), 0);
  const lastMonthMinutes = usagePrev.reduce((s, u) => s + (u.minutes_used || 0), 0);
  const lastMonthRevenue = clients.reduce((c_sum, c) => {
    const usage = usagePrev.find(u => u.client_id === c.id);
    return c_sum + Math.round((usage?.minutes_used || 0) * (c.price_per_min || 0));
  }, 0);

  // ── Margins ──────────────────────────────────────────────
  const margins = clients
    .filter(c => c.price_per_min && c.cost_per_min)
    .map(c => Math.round((1 - c.cost_per_min / c.price_per_min) * 100));
  const avgMargin = margins.length
    ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length)
    : 0;

  // ── Call volume stats ─────────────────────────────────────
  const totalMins = callsNow.reduce((s, c) => s + (c.duration_secs || 0) / 60, 0);
  const avgDur    = callsNow.length ? totalMins / callsNow.length : 0;
  const sentiment = { positive: 0, neutral: 0, negative: 0 };
  callsNow.forEach(c => { if (c.sentiment) sentiment[c.sentiment]++; });

  // ── Layer split ───────────────────────────────────────────
  const managed  = clients.filter(c => c.layer === 'managed');
  const selfHost = clients.filter(c => c.layer === 'self-hosted');
  const managedRev  = managed.reduce((s, c) => s + calcMonthlyRevenue(c),  0);
  const selfHostRev = selfHost.reduce((s, c) => s + calcMonthlyRevenue(c), 0);

  res.json({
    data: {
      // Client summary
      total_clients:     clients.length,
      active_clients:    clients.filter(c => c.status === 'active').length,
      managed_clients:   managed.length,
      selfhosted_clients: selfHost.length,

      // Revenue
      total_revenue:     totalRevenue,
      total_profit:      totalProfit,
      last_month_revenue: lastMonthRevenue,
      revenue_change:    totalRevenue - lastMonthRevenue,
      revenue_change_pct: lastMonthRevenue
        ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0,

      // Layer split
      managed_revenue:   managedRev,
      selfhosted_revenue: selfHostRev,

      // Calls
      total_calls:       callsNow.length,
      last_month_calls:  callsPrev.length,
      calls_change:      callsNow.length - callsPrev.length,
      avg_call_duration: Math.round(avgDur * 10) / 10,
      sentiment,

      // Margin
      avg_margin:        avgMargin,

      // Leads & escalations
      open_leads:        (leadsRes.data || []).length,
      escalations_month: (escalationsRes.data || []).length,
    },
  });
}));

// ── GET /api/analytics/clients ────────────────────────────
// Per-client revenue and usage summary (for top clients table)
router.get('/clients', requireAuth, asyncHandler(async (req, res) => {
  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select('id, name, layer, plan, price_per_min, cost_per_min, minutes_included, status, location')
    .eq('platform_id', req.platformId)
    .eq('status', 'active');

  const thisMonth = new Date();
  const monthStr  = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString();

  const { data: usage } = await supabaseAdmin
    .from('usage')
    .select('client_id, minutes_used, extra_minutes, call_count')
    .eq('platform_id', req.platformId)
    .gte('month', monthStr);

  const enriched = (clients || []).map(c => {
    const u      = (usage || []).find(x => x.client_id === c.id) || {};
    const mins   = u.minutes_used || 0;
    const rev    = Math.round(mins * (c.price_per_min || 0));
    const profit = Math.round(mins * ((c.price_per_min || 0) - (c.cost_per_min || 0)));
    const margin = c.price_per_min && c.cost_per_min
      ? Math.round((1 - c.cost_per_min / c.price_per_min) * 100)
      : 0;
    return {
      ...c,
      minutes_used:   Math.round(mins),
      extra_minutes:  Math.round(u.extra_minutes || 0),
      total_calls:    u.call_count || 0,
      monthly_revenue: rev,
      monthly_profit:  profit,
      margin,
      usage_pct: c.minutes_included ? Math.min(100, Math.round(mins / c.minutes_included * 100)) : 0,
    };
  });

  res.json({
    data: enriched.sort((a, b) => b.monthly_revenue - a.monthly_revenue),
  });
}));

// ── GET /api/analytics/calls/trend ───────────────────────
// Daily call count for the past N days (for bar charts)
router.get('/calls/trend', requireAuth, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const from = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('call_logs')
    .select('started_at, duration_secs, client_id')
    .eq('platform_id', req.platformId)
    .gte('started_at', from)
    .order('started_at');

  if (error) throw error;

  // Group by day
  const byDay = {};
  (data || []).forEach(call => {
    const day = call.started_at.slice(0, 10); // YYYY-MM-DD
    if (!byDay[day]) byDay[day] = { date: day, calls: 0, minutes: 0 };
    byDay[day].calls++;
    byDay[day].minutes += (call.duration_secs || 0) / 60;
  });

  // Fill in any missing days with 0
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    trend.push(byDay[d] || { date: d, calls: 0, minutes: 0 });
  }

  res.json({ data: trend });
}));

module.exports = router;
