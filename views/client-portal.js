// ============================================================
//  EMPOWER AI 365 — Client Portal
//  Simple dashboard for clients who have purchased voice agents
// ============================================================

function renderClientPortal() {
  const user    = window.LIVE_USER || { name: 'Client', email: '' };
  const client  = state.portalClient || null;
  const calls   = state.portalCalls  || [];

  return `
  <div class="cp-layout">
    <!-- Sidebar -->
    <aside class="cp-sidebar">
      <div class="cp-sidebar-brand">
        <div class="cp-brand-icon">
          <img src="images/ai.jpeg" alt="Empower AI 365" style="width:28px;height:28px;border-radius:8px;object-fit:cover">
        </div>
        <div>
          <div class="cp-brand-name">Empower AI 365</div>
          <div class="cp-brand-sub">Client Portal</div>
        </div>
      </div>

      <nav class="cp-nav">
        <div class="cp-nav-item cp-nav-active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Overview
        </div>
        <div class="cp-nav-item" onclick="navigate('client-portal-calls')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.9a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0 1 22 16.92z"/></svg>
          Call History
        </div>
        <div class="cp-nav-item" onclick="navigate('client-portal-agent')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          My Agent
        </div>
      </nav>

      <div class="cp-sidebar-bottom">
        <div class="cp-user" onclick="handleLogout()">
          <div class="cp-avatar">${(user.name||'CL').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</div>
          <div class="cp-user-info">
            <div class="cp-user-name">${user.name || 'Client'}</div>
            <div class="cp-user-email">${user.email || ''}</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-left:auto;color:var(--text-muted)"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="cp-main">
      <div class="cp-topbar">
        <div>
          <h1 class="cp-page-title">Your Voice Agent</h1>
          <p class="cp-page-sub">Here's how your AI is performing today</p>
        </div>
        <div class="cp-topbar-right">
          <div class="cp-live-badge">
            <span class="cp-live-dot"></span>
            Live
          </div>
        </div>
      </div>

      <div class="cp-content" id="cp-content">
        ${_renderPortalContent(client, calls)}
      </div>
    </main>
  </div>`;
}

function _renderPortalContent(client, calls) {
  if (!client && !window.DEMO_MODE) {
    return `
    <div class="cp-empty">
      <div class="cp-empty-icon">🎙️</div>
      <h3>Your voice agent is being set up</h3>
      <p>Our team is configuring your AI voice agent. You'll see live data here once it's active.</p>
      <div class="cp-empty-eta">Estimated setup time: 3-7 business days</div>
    </div>`;
  }

  // Use mock data in demo mode
  const c = client || {
    name: 'Demo Business',
    status: 'active',
    layer: 'managed',
    plan: 'Growth',
    minutesUsed: 1240,
    minutesIncluded: 2000,
    totalCalls: 183,
    avgCallDuration: 245,
    pricePerMin: 0.22,
  };

  const pct = Math.min(100, Math.round((c.minutesUsed / c.minutesIncluded) * 100));
  const recentCalls = calls.slice(0, 5);

  return `
  <!-- Status Card -->
  <div class="cp-status-banner ${c.status === 'active' ? 'cp-status-active' : 'cp-status-inactive'}">
    <div class="cp-status-left">
      <div class="cp-status-indicator ${c.status === 'active' ? 'cp-indicator-on' : 'cp-indicator-off'}"></div>
      <div>
        <div class="cp-status-label">Voice Agent Status</div>
        <div class="cp-status-value">${c.status === 'active' ? '✅ Active — Answering Calls' : '⏸ Paused'}</div>
      </div>
    </div>
    <div class="cp-status-right">
      <div class="cp-status-layer">${c.layer === 'managed' ? '⚡ Cloud Managed' : '🖥️ Direct Deploy'}</div>
      <div class="cp-status-plan">${c.plan} Plan</div>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="cp-stats-row">
    <div class="cp-stat-card">
      <div class="cp-stat-icon cp-stat-purple">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.9a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <div>
        <div class="cp-stat-val">${fmtNum(c.totalCalls)}</div>
        <div class="cp-stat-label">Total Calls Handled</div>
      </div>
    </div>
    <div class="cp-stat-card">
      <div class="cp-stat-icon cp-stat-cyan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <div class="cp-stat-val">${fmtDur(c.avgCallDuration || 0)}</div>
        <div class="cp-stat-label">Average Call Length</div>
      </div>
    </div>
    <div class="cp-stat-card">
      <div class="cp-stat-icon cp-stat-green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <div>
        <div class="cp-stat-val">${fmtNum(c.minutesUsed)}<span style="font-size:13px;color:var(--text-muted)"> / ${fmtNum(c.minutesIncluded)}</span></div>
        <div class="cp-stat-label">Minutes Used This Month</div>
      </div>
    </div>
  </div>

  <!-- Minutes Usage Bar -->
  <div class="cp-usage-card">
    <div class="cp-usage-header">
      <span>Monthly Minutes</span>
      <span class="cp-usage-pct">${pct}% used</span>
    </div>
    <div class="cp-usage-bar">
      <div class="cp-usage-fill ${pct > 90 ? 'cp-usage-warn' : ''}" style="width:${pct}%"></div>
    </div>
    <div class="cp-usage-labels">
      <span>${fmtNum(c.minutesUsed)} used</span>
      <span>${fmtNum(c.minutesIncluded - c.minutesUsed)} remaining</span>
    </div>
  </div>

  <!-- Recent Calls -->
  <div class="cp-section-heading">Recent Calls</div>
  ${recentCalls.length === 0 ? `
  <div class="cp-no-calls">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28" style="color:var(--text-muted)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.9a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0 1 22 16.92z"/></svg>
    <p>No calls yet — your agent is ready to answer</p>
  </div>
  ` : `
  <div class="cp-calls-list">
    ${recentCalls.map(call => `
    <div class="cp-call-row">
      <div class="cp-call-icon ${call.isLead ? 'cp-call-lead' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.9a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <div class="cp-call-info">
        <div class="cp-call-intent">${call.intent || 'General Inquiry'}</div>
        <div class="cp-call-time">${fmtDate(call.timestamp || call.started_at)}</div>
      </div>
      <div class="cp-call-meta">
        ${call.isLead ? '<span class="cp-tag cp-tag-lead">Lead</span>' : ''}
        ${call.isEscalation ? '<span class="cp-tag cp-tag-esc">Escalation</span>' : ''}
        <span class="cp-call-dur">${fmtDur(call.duration || call.duration_secs || 0)}</span>
      </div>
    </div>
    `).join('')}
  </div>
  `}
  `;
}

// ── Load portal data ─────────────────────────────────────────
async function loadClientPortal() {
  if (window.DEMO_MODE) return; // Demo uses mock data built into _renderPortalContent
  try {
    const user = window.LIVE_USER;
    if (!user?.platform_id) return;
    // For client role: fetch their specific client record
    // Platform ID maps to the platform they belong to
    const [callsRes] = await Promise.all([
      API.calls.list({ limit: 20 }),
    ]);
    state.portalCalls = normalizeCalls(callsRes.data || []);
    const el = document.getElementById('cp-content');
    if (el) el.innerHTML = _renderPortalContent(state.portalClient, state.portalCalls);
  } catch (err) {
    console.error('Portal load error:', err);
  }
}
