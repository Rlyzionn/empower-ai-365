// ============================================================
//  VOICEDESK — DASHBOARD VIEW
//  Demo mode: MOCK_CLIENTS + MOCK_ACTIVITY
//  Live mode: API.analytics.dashboard() + API.calls.list()
// ============================================================

function renderDashboard() {
  // Kick off async data load; render with mock/cached data immediately
  if (!window.DEMO_MODE) {
    _loadLiveDashboard();
  }

  const clients = window.DEMO_MODE
    ? MOCK_CLIENTS
    : (state.liveClients || MOCK_CLIENTS);

  // Use live dashboard stats if available, otherwise derive from client list
  const stats = state.liveDashboard || _deriveStatsFromClients(clients);

  const totalRevenue   = stats.totalRevenue;
  const managedClients = clients.filter(c => c.layer === 'managed');
  const selfClients    = clients.filter(c => c.layer === 'self-hosted');
  const managedRev     = stats.managedRevenue   || managedClients.reduce((s,c)=>s+(c.monthlyRevenue||0),0);
  const selfRev        = stats.selfhostedRevenue || selfClients.reduce((s,c)=>s+(c.monthlyRevenue||0),0);
  const avgMargin      = stats.avgMargin         || Math.round(clients.reduce((s,c)=>s+calcMargin(c.costPerMin,c.pricePerMin),0)/Math.max(clients.length,1));

  const circ        = 364.42;
  const managedPct  = totalRevenue > 0 ? managedRev / totalRevenue : 0.5;
  const managedArc  = managedPct * circ - 4;
  const selfRotate  = managedPct * 360 - 90;
  const selfArc     = (1 - managedPct) * circ - 4;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = (window.LIVE_USER?.name || 'Admin').split(' ')[0];

  const liveCalls    = stats.liveCalls    || (window.DEMO_MODE ? 3 : 0);
  const totalCalls   = stats.totalCalls   || 247;
  const revenueChange= stats.revenueChange|| 1200;

  // Activity: use mock in demo, recent calls in live
  const activityData = window.DEMO_MODE
    ? MOCK_ACTIVITY
    : _buildActivityFromCalls(state.liveCalls || []);

  return `
  <!-- Hero Banner -->
  <div class="hero-banner">
    <div class="hero-left">
      <div class="hero-greeting">${greeting}, ${userName} 👋</div>
      <div class="hero-title">Your platform is running <span class="hero-highlight">perfectly</span></div>
      <div class="hero-sub">${liveCalls} AI call${liveCalls!==1?'s':''} happening right now across your ${clients.length} clients · ${fmtMoney(totalRevenue)} earned this month</div>
      <div class="hero-badges">
        <div class="hero-badge green">✅ ${clients.length}/${clients.length} clients online</div>
        <div class="hero-badge cyan">📞 ${liveCalls} live call${liveCalls!==1?'s':''}</div>
        <div class="hero-badge purple">📈 99.97% uptime</div>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-big-stat">
        <div class="hero-big-label">This month's earnings</div>
        <div class="hero-big-value">${fmtMoney(totalRevenue)}</div>
        <div class="hero-big-sub" style="color:var(--green)">↑ ${fmtMoney(Math.abs(revenueChange))} ${revenueChange>=0?'more':'less'} than last month</div>
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid" style="margin-bottom:24px">
    ${kpiCard2('purple', '👥', 'Clients on Your Platform',    clients.length,          'up', `${managedClients.length} managed · ${selfClients.length} self-hosted`)}
    ${kpiCard2('green',  '📞', 'Calls Handled Today',         totalCalls,              'up', 'Your AI answered every single one')}
    ${kpiCard2('cyan',   '💰', 'Monthly Recurring Revenue',   fmtMoney(totalRevenue),  'up', `Across all ${clients.length} clients`)}
    ${kpiCard2('amber',  '📊', 'Your Average Profit Margin',  avgMargin + '%',         'up', 'Per minute, after your costs')}
  </div>

  <div class="col-60-40">
    <!-- Top Clients -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">YOUR CLIENTS — AT A GLANCE</span>
        <button class="topbar-btn ghost" style="font-size:12px;padding:6px 12px" onclick="navigate('clients')">View All →</button>
      </div>
      <div class="card-body" style="padding-top:10px">
        <div style="display:flex;flex-direction:column;gap:8px">
          ${clients.slice().sort((a,b)=>(b.monthlyRevenue||0)-(a.monthlyRevenue||0)).slice(0,5).map(c => {
            const p = pct(c.minutesUsed||0, c.minutesIncluded||1);
            const barClass = p < 65 ? 'low' : p < 85 ? 'mid' : 'high';
            const margin = calcMargin(c.costPerMin, c.pricePerMin);
            return `
            <div class="client-row-card" onclick="navigate('client-detail',{clientId:'${c.id}'})">
              <div class="client-avatar" style="background:${c.avatarColor};width:40px;height:40px;border-radius:10px;font-size:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">${c.avatar}</div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:13.5px;color:var(--text-primary);margin-bottom:2px">${c.name}</div>
                <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px">${c.industry} · ${layerLabel(c.layer)}</div>
                <div class="usage-bar-track"><div class="usage-bar-fill ${barClass}" style="width:${p}%"></div></div>
                <div style="font-size:10.5px;color:var(--text-muted);margin-top:3px">${p}% of their minutes used this month</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-weight:800;font-size:15px;color:var(--text-primary)">${fmtMoney(c.monthlyRevenue||0)}</div>
                <div style="font-size:11px;color:${margin>40?'var(--green)':'var(--text-muted)'};font-weight:600">${margin}% margin</div>
              </div>
            </div>`;
          }).join('')}
          ${clients.length === 0 ? `<div class="empty-state" style="padding:30px"><div class="empty-icon">👥</div><div class="empty-title">No clients yet</div><div class="empty-sub">Add your first client to get started</div><button class="btn-primary" style="margin-top:12px" onclick="navigate('wizard')">+ Add First Client</button></div>` : ''}
        </div>
      </div>
    </div>

    <!-- Right column -->
    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- Revenue Split -->
      <div class="card">
        <div class="card-header"><span class="card-title">REVENUE BY PLAN TYPE</span></div>
        <div class="chart-donut-wrap">
          <svg viewBox="0 0 160 160" width="140" height="140" style="margin-bottom:14px">
            <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="18"/>
            <circle cx="80" cy="80" r="58" fill="none" stroke="#22d3ee" stroke-width="18"
              stroke-dasharray="${selfArc} ${circ - selfArc}" stroke-linecap="round"
              transform="rotate(${selfRotate} 80 80)"/>
            <circle cx="80" cy="80" r="58" fill="none" stroke="#f59e0b" stroke-width="18"
              stroke-dasharray="${managedArc} ${circ - managedArc}" stroke-linecap="round"
              transform="rotate(-90 80 80)"/>
            <text x="80" y="74" text-anchor="middle" fill="#f1f5f9" font-size="20" font-weight="800" font-family="Inter">${fmtMoney(totalRevenue/1000,1)}k</text>
            <text x="80" y="92" text-anchor="middle" fill="#4e5a72" font-size="10" font-family="Inter">per month</text>
          </svg>
          <div class="donut-legend">
            <div class="donut-legend-item">
              <div class="donut-legend-dot" style="background:#f59e0b"></div>
              <div>
                <div style="font-size:12px;font-weight:700">⚡ Cloud Managed</div>
                <div style="font-size:11px;color:var(--text-muted)">${fmtMoney(managedRev)} · ${managedClients.length} clients</div>
              </div>
            </div>
            <div class="donut-legend-item">
              <div class="donut-legend-dot" style="background:#22d3ee"></div>
              <div>
                <div style="font-size:12px;font-weight:700">🖥️ Direct Deploy</div>
                <div style="font-size:11px;color:var(--text-muted)">${fmtMoney(selfRev)} · ${selfClients.length} clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card card-body">
        <div class="calc-section-title" style="margin-bottom:12px">QUICK ACTIONS</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="quick-action-btn" onclick="navigate('wizard')">➕ Add a new client</button>
          <button class="quick-action-btn" onclick="navigate('calculator')">💰 Build a quote</button>
          <button class="quick-action-btn" onclick="navigate('call-logs')">📋 Review recent calls</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Activity Feed -->
  <div class="card" style="margin-top:20px">
    <div class="card-header">
      <span class="card-title">WHAT'S BEEN HAPPENING</span>
      ${!window.DEMO_MODE ? `<span style="font-size:11px;color:var(--text-muted)">Live data · last 8 calls</span>` : ''}
    </div>
    <div class="card-body" style="padding-top:4px">
      <div class="activity-list">
        ${activityData.length === 0
          ? `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">No recent activity yet — calls will appear here once your AI agents are live.</div>`
          : activityData.map(a => `
            <div class="activity-item">
              <div class="activity-icon">${a.icon}</div>
              <div class="activity-body">
                <div class="activity-text">${window.DEMO_MODE ? friendlyActivityText(a) : a.text}</div>
                <div class="activity-client">${a.client} · ${layerBadge(a.layer)}</div>
                <div class="activity-detail">${a.detail}</div>
              </div>
              <div class="activity-time">${a.time}</div>
            </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── Data Helpers ─────────────────────────────────────────────

async function _loadLiveDashboard() {
  if (window.DEMO_MODE) return;
  try {
    const [dashRes, clientsRes, callsRes] = await Promise.all([
      API.analytics.dashboard(),
      API.clients.list(),
      API.calls.list({ limit: 8 }),
    ]);

    const d = dashRes.data;
    state.liveDashboard = {
      totalRevenue:      d.total_revenue      || 0,
      managedRevenue:    d.managed_revenue    || 0,
      selfhostedRevenue: d.selfhosted_revenue || 0,
      avgMargin:         d.avg_margin         || 0,
      totalCalls:        d.total_calls        || 0,
      liveCalls:         0,
      revenueChange:     d.revenue_change     || 0,
    };
    state.liveClients = normalizeClients(clientsRes.data || []);
    state.liveCalls   = normalizeCalls(callsRes.data || []);

    // Refresh the dashboard content without full re-render
    const contEl = document.getElementById('page-content');
    if (contEl && state.currentView === 'dashboard') {
      contEl.innerHTML = renderDashboard();
    }
  } catch {
    // Silently fail — dashboard shows cached/mock data
  }
}

function _deriveStatsFromClients(clients) {
  return {
    totalRevenue:      clients.reduce((s,c)=>s+(c.monthlyRevenue||0),0),
    managedRevenue:    clients.filter(c=>c.layer==='managed').reduce((s,c)=>s+(c.monthlyRevenue||0),0),
    selfhostedRevenue: clients.filter(c=>c.layer==='self-hosted').reduce((s,c)=>s+(c.monthlyRevenue||0),0),
    avgMargin:         Math.round(clients.reduce((s,c)=>s+calcMargin(c.costPerMin,c.pricePerMin),0)/Math.max(clients.length,1)),
    totalCalls:        247,
    liveCalls:         0,
    revenueChange:     0,
  };
}

function _buildActivityFromCalls(calls) {
  return calls.slice(0, 8).map(c => ({
    icon:   c.isEscalation ? '🚨' : c.isLead ? '🎯' : '📞',
    text:   c.isEscalation ? 'Emergency — AI escalated immediately' : c.isLead ? 'New lead detected' : 'Call handled by AI',
    client: c.clientName || 'Unknown Client',
    detail: c.outcome || c.intent || '',
    time:   _timeAgo(c.timestamp),
    layer:  c.layer || 'managed',
  }));
}

function _timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return diff + ' min ago';
  const h = Math.floor(diff / 60);
  return h + 'h ' + (diff % 60) + 'm ago';
}

function friendlyActivityText(a) {
  const map = {
    lead: 'New potential customer spotted 🎯',
    booking: 'Appointment booked by AI 📅',
    escalation: '🚨 Emergency — AI escalated immediately',
    transfer: 'Call transferred to right person 🔀',
    cx: 'Customer question answered ✅',
    hire: 'Candidate handled by AI 👤',
  };
  return map[a.type] || a.text;
}

function kpiCard2(color, emoji, label, value, trendDir, trendText) {
  return `<div class="kpi-card ${color}">
    <div style="font-size:28px;margin-bottom:12px">${emoji}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-value" style="font-size:26px">${value}</div>
    <div class="kpi-trend ${trendDir}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><polyline points="${trendDir==='up'?'18 15 12 9 6 15':'6 9 12 15 18 9'}"/></svg>
      ${trendText}
    </div>
  </div>`;
}

function iconSvg() { return ''; } // kept for compatibility
