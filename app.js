// ============================================================
//  VOICEDESK — CORE APPLICATION
//  Router · Layout · Auth · Navigation · Demo/Live Mode
// ============================================================

// ── Utilities (shared across all views) ─────────────────────
const fmtMoney = (n, d=0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits:d, maximumFractionDigits:d });
const fmtNum   = n => Number(n).toLocaleString('en-US');
const fmtDur   = s => { const m = Math.floor(s/60); const sec = s%60; return `${m}m ${sec}s`; };
const fmtDate  = d => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
const calcMargin = (cost, sell) => Math.max(0, Math.round((1 - cost/sell) * 100));
const pct = (used, total) => Math.min(100, Math.round(used/total*100));

// Layer display helpers
function layerLabel(layer) {
  return layer === 'managed' ? '⚡ Cloud Managed' : '🖥️ Direct Deploy';
}
function layerBadge(layer) {
  return layer === 'managed'
    ? `<span class="badge badge-managed badge-dot">Cloud Managed</span>`
    : `<span class="badge badge-selfhosted badge-dot">Direct Deploy</span>`;
}

// ── Global State ─────────────────────────────────────────────
const state = {
  isAuthenticated:  false,
  currentView:      'dashboard',
  selectedClientId: null,
  clientDetailTab:  'overview',
  wizardStep:       1,
  wizardData:       {},
  matrixScores:     { managed:0, selfhost:0 },
  selectedPlan:     null,
  calcLayer:        'managed',
  calcQuality:      'recommended',
  calcMinutes:      5000,
  clientFilter:     '',
  clientLayerFilter:'all',
  clientViewMode:   'cards',
  expandedCalls:    new Set(),
  callFilter:       '',
  callClientFilter: 'all',
  callTypeFilter:   'all',
  settingsTab:      'branding',
  // Live data caches (populated by API, used by views)
  liveClients:      null,   // Array from API or null
  liveDashboard:    null,   // Object from API or null
  liveCalls:        null,   // Array from API or null
  liveSettings:     null,   // Object from API or null
  liveApiKeys:      null,   // Array from API or null
  liveTeam:         null,   // Array from API or null
  // Client portal
  portalClient:     null,
  portalCalls:      null,
};

// ── Router ───────────────────────────────────────────────────
function navigate(view, params = {}) {
  state.currentView = view;
  if (params.clientId) state.selectedClientId = params.clientId;
  if (params.tab) state.clientDetailTab = params.tab;
  // Clear stale caches when navigating so data refreshes
  if (view === 'clients' || view === 'client-detail') state.liveClients = null;
  if (view === 'call-logs') state.liveCalls = null;
  if (view === 'settings') { state.liveSettings = null; state.liveApiKeys = null; state.liveTeam = null; }
  renderApp();
  window.scrollTo(0, 0);
}

// ── Root Render ──────────────────────────────────────────────
function renderApp() {
  const app = document.getElementById('app');

  // Not authenticated → show landing page
  if (!state.isAuthenticated) {
    app.innerHTML = renderLanding();
    const cleanup = initLandingCanvas();
    if (cleanup) app._landingCleanup = cleanup;
    return;
  }

  // Cleanup canvas if navigating away from landing
  if (app._landingCleanup) { app._landingCleanup(); app._landingCleanup = null; }

  // Client portal
  if (state.currentView === 'client-portal') {
    app.innerHTML = renderClientPortal();
    loadClientPortal();
    return;
  }

  // Admin dashboard
  app.innerHTML = buildLayout();
  renderCurrentView();
}

// ── Login (legacy — now handled by landing.js modal) ─────────
// Kept as no-op stubs in case any old code references them
function buildLogin() { return renderLanding(); }
function attachLoginListeners() { /* handled in landing.js */ }

// ── Demo Banner ──────────────────────────────────────────────
function demoBanner() {
  if (!window.DEMO_MODE) return '';
  return `
  <div style="background:linear-gradient(90deg,#b45309,#d97706);color:#fff;padding:8px 20px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:10px;z-index:100">
    <span>🎭 DEMO MODE</span>
    <span style="font-weight:400;opacity:0.9">— Showing sample data. Connect Supabase in Settings → API Keys to go live.</span>
    <a onclick="navigate('settings')" style="margin-left:auto;color:#fef3c7;cursor:pointer;text-decoration:underline;font-size:11px">Set up live connection →</a>
  </div>`;
}

// ── App Shell ────────────────────────────────────────────────
function buildLayout() {
  const user        = window.LIVE_USER || { name: 'Admin', email: 'admin@empowerai365.com' };
  const clientCount = state.liveClients ? state.liveClients.length : MOCK_CLIENTS.length;
  const initials    = (user.name || 'AD').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return `
  ${demoBanner()}
  <div class="app-layout">
    <aside class="sidebar" id="sidebar">

      <!-- Logo -->
      <div class="sidebar-logo" onclick="navigate('dashboard')" style="cursor:pointer">
        <div class="sidebar-logo-icon">
          <img src="images/ai.jpeg" alt="Empower AI 365" style="width:32px;height:32px;border-radius:10px;object-fit:cover">
        </div>
        <div>
          <div class="sidebar-logo-text">Empower <span>AI 365</span></div>
          <div style="font-size:10px;color:var(--text-muted);letter-spacing:0.3px;margin-top:1px">Admin Dashboard</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Overview</div>
        ${navItem('dashboard',  'Home',          iconDashboard())}
        ${navItem('clients',    'My Clients',    iconClients(), clientCount)}
        ${navItem('call-logs',  'Call History',  iconPhone())}
        ${navItem('phones',     'Phone Numbers', iconPhoneNumbers())}
        <div class="sidebar-section-label">Tools</div>
        ${navItem('calculator', 'Pricing Calculator', iconCalc())}
        <div class="sidebar-section-label">Account</div>
        ${navItem('settings',   'Platform Settings', iconSettings())}
      </nav>

      <div class="sidebar-bottom">
        <!-- Back to website -->
        <div class="sidebar-back-btn" onclick="handleLogout()" title="Back to site">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Website
        </div>

        <!-- User block -->
        <div class="sidebar-user" title="Signed in">
          <div class="user-avatar" style="background:${stringToColor(user.name || 'A')}">${initials}</div>
          <div class="user-info">
            <div class="user-name">${user.name || 'Admin'}</div>
            <div class="user-role">${user.role || 'Owner'}</div>
          </div>
        </div>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>

    <main class="main-content">
      <header class="topbar">
        <button class="topbar-hamburger" onclick="toggleSidebar()" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="topbar-title" id="topbar-title"></div>
        <div class="topbar-actions" id="topbar-actions"></div>
      </header>
      <div class="page-content" id="page-content"></div>
    </main>
  </div>`;
}

function navItem(view, label, icon, badge) {
  const active = state.currentView === view ||
    (view === 'clients' && state.currentView === 'client-detail');
  return `<div class="nav-item ${active?'active':''}" onclick="navigate('${view}')">
    ${icon}${label}${badge ? `<span class="nav-badge">${badge}</span>` : ''}
  </div>`;
}

// ── View Dispatcher ──────────────────────────────────────────
function renderCurrentView() {
  const PAGE_META = {
    dashboard:       { title:'Your Dashboard',  sub:'Here\'s how your AI voice platform is performing right now' },
    clients:         { title:'My Clients',      sub:`${state.liveClients ? state.liveClients.length : MOCK_CLIENTS.length} clients on your platform — click any to view details` },
    'client-detail': { title:'Client Details',  sub:'' },
    'call-logs':     { title:'Call History',    sub:'Every conversation your AI has handled — read the transcript, review the summary' },
    calculator:      { title:'Quote Builder',   sub:'Enter the details and we\'ll show you exactly what to charge and what you\'ll earn' },
    settings:        { title:'My Platform',     sub:'Your brand, your settings, your API connections' },
    wizard:          { title:'Add New Client',  sub:'Answer a few questions and we\'ll set everything up for you' },
    phones:          { title:'Phone Numbers',   sub:'AI phone numbers registered across all client deployments' },
  };

  const meta    = PAGE_META[state.currentView] || { title:'', sub:'' };
  const titleEl = document.getElementById('topbar-title');
  const actEl   = document.getElementById('topbar-actions');
  const contEl  = document.getElementById('page-content');
  if (!contEl) return;

  if (titleEl) titleEl.innerHTML = `<h1>${meta.title}</h1><p>${meta.sub}</p>`;

  switch (state.currentView) {
    case 'dashboard':
      if (actEl) actEl.innerHTML = `
        <div class="live-indicator"><div class="live-dot"></div>${window.DEMO_MODE ? '3 Live Calls' : 'Live'}</div>
        <button class="topbar-btn primary" onclick="navigate('wizard')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Client
        </button>`;
      contEl.innerHTML = renderDashboard();
      break;

    case 'clients':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn ghost" onclick="toggleViewMode()" id="view-toggle-btn">
          ${state.clientViewMode === 'cards'
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> List View`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> Card View`}
        </button>
        <button class="topbar-btn primary" onclick="navigate('wizard')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Client
        </button>`;
      contEl.innerHTML = loadingSpinner();
      loadClientsView(contEl);
      break;

    case 'client-detail':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn ghost" onclick="handleDeleteClient('${state.selectedClientId}')" style="color:#ef4444;border-color:rgba(239,68,68,0.25)">🗑 Delete</button>
        <button class="topbar-btn primary" onclick="openEditClient('${state.selectedClientId}')">✏️ Edit Client</button>
        <button class="topbar-btn ghost" onclick="navigate('clients')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to My Clients
        </button>`;
      contEl.innerHTML = loadingSpinner();
      loadClientDetailView(contEl, state.selectedClientId);
      break;

    case 'call-logs':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn ghost" onclick="navigate('call-logs')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>`;
      contEl.innerHTML = loadingSpinner();
      loadCallLogsView(contEl);
      break;

    case 'wizard':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn ghost" onclick="navigate('clients')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Cancel
        </button>`;
      contEl.innerHTML = renderWizard();
      attachWizardListeners();
      break;

    case 'calculator':
      if (actEl) actEl.innerHTML = '';
      contEl.innerHTML = renderCalculator();
      attachCalcListeners();
      break;

    case 'settings':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn primary" id="save-settings-btn" onclick="handleSaveSettings()">Save Changes</button>`;
      contEl.innerHTML = loadingSpinner();
      loadSettingsView(contEl);
      break;

    case 'phones':
      if (actEl) actEl.innerHTML = `
        <button class="topbar-btn primary" onclick="handleImportPhone()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Import Number
        </button>`;
      contEl.innerHTML = loadingSpinner();
      loadPhonesView(contEl);
      break;
  }
}

// ── Data Loaders (called by view dispatcher) ─────────────────

async function loadClientsView(contEl) {
  if (window.DEMO_MODE) {
    contEl.innerHTML = renderClients();
    attachClientListeners();
    return;
  }
  try {
    const res = await API.clients.list();
    state.liveClients = normalizeClients(res.data || []);
    contEl.innerHTML = renderClients();
    attachClientListeners();
  } catch (err) {
    contEl.innerHTML = apiErrorState(err.message, () => loadClientsView(contEl));
  }
}

async function loadClientDetailView(contEl, id) {
  if (window.DEMO_MODE) {
    contEl.innerHTML = renderClientDetail(id);
    attachDetailListeners();
    return;
  }
  try {
    const [clientRes, callsRes] = await Promise.all([
      API.clients.get(id),
      API.calls.list({ client_id: id, limit: 20 }),
    ]);
    const client = normalizeClient(clientRes.data);
    const calls  = normalizeCalls(callsRes.data || []);
    // Temporarily inject into mock arrays so existing render functions work
    state._detailClient = client;
    state._detailCalls  = calls;
    contEl.innerHTML = renderClientDetailLive(client, calls);
    attachDetailListeners();
  } catch (err) {
    contEl.innerHTML = apiErrorState(err.message, () => loadClientDetailView(contEl, id));
  }
}

async function loadCallLogsView(contEl) {
  if (window.DEMO_MODE) {
    contEl.innerHTML = renderCallLogs();
    attachCallLogListeners();
    return;
  }
  try {
    const params = {};
    if (state.callClientFilter && state.callClientFilter !== 'all') params.client_id = state.callClientFilter;
    if (state.callFilter) params.search = state.callFilter;
    if (state.callTypeFilter === 'lead') params.is_lead = 'true';
    if (state.callTypeFilter === 'escalation') params.is_escalation = 'true';
    params.limit = 50;

    const res = await API.calls.list(params);
    state.liveCalls = normalizeCalls(res.data || []);
    contEl.innerHTML = renderCallLogs();
    attachCallLogListeners();
  } catch (err) {
    contEl.innerHTML = apiErrorState(err.message, () => loadCallLogsView(contEl));
  }
}

async function loadSettingsView(contEl) {
  if (window.DEMO_MODE) {
    contEl.innerHTML = renderSettings();
    attachSettingsListeners();
    return;
  }
  try {
    const [settingsRes, keysRes, teamRes] = await Promise.all([
      API.settings.get(),
      API.settings.apiKeys(),
      API.settings.team(),
    ]);
    state.liveSettings = settingsRes.data;
    state.liveApiKeys  = keysRes.data || [];
    state.liveTeam     = teamRes.data || [];
    contEl.innerHTML = renderSettings();
    attachSettingsListeners();
  } catch (err) {
    contEl.innerHTML = apiErrorState(err.message, () => loadSettingsView(contEl));
  }
}

// ── Settings Save Handler ────────────────────────────────────
async function handleSaveSettings() {
  if (window.DEMO_MODE) { showToast('✅ Settings saved (demo mode — not persisted)'); return; }
  const btn = document.getElementById('save-settings-btn');
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

  const updates = {};
  const nameEl  = document.querySelector('.settings-input[data-key="name"]');
  const tagEl   = document.querySelector('.settings-input[data-key="tagline"]');
  const emailEl = document.querySelector('.settings-input[data-key="support_email"]');
  const colorEl = document.querySelector('.settings-input[data-key="brand_color"]');
  if (nameEl)  updates.name          = nameEl.value;
  if (tagEl)   updates.tagline       = tagEl.value;
  if (emailEl) updates.support_email = emailEl.value;
  if (colorEl) updates.brand_color   = colorEl.value;

  try {
    await API.settings.update(updates);
    showToast('✅ Platform settings saved!');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    if (btn) { btn.textContent = 'Save Changes'; btn.disabled = false; }
  }
}

// ── Data Normalizers (API → Mock-compatible format) ──────────

function normalizeClients(clients) {
  return clients.map(normalizeClient);
}

function normalizeClient(c) {
  // Map backend snake_case fields to the camelCase format the views expect
  return {
    id:               c.id,
    name:             c.name,
    contact:          c.contact_name || '',
    title:            c.contact_title || '',
    email:            c.contact_email || '',
    industry:         c.industry || '',
    layer:            c.layer,
    plan:             c.plan,
    status:           c.status || 'active',
    compliance:       c.compliance || [],
    minutesIncluded:  c.minutes_included || 0,
    minutesUsed:      c.minutes_used || 0,
    extraMinutes:     c.extra_minutes || 0,
    pricePerMin:      parseFloat(c.price_per_min) || 0,
    extraPricePerMin: parseFloat(c.extra_price_per_min) || 0,
    costPerMin:       parseFloat(c.cost_per_min) || 0,
    monthlyRevenue:   c.monthly_revenue || Math.round((c.minutes_used || 0) * (c.price_per_min || 0)),
    totalCalls:       c.total_calls || 0,
    avgCallDuration:  c.avg_call_duration || 0,
    activeSince:      c.active_since || c.created_at,
    phoneNumber:      c.phone_number || '',
    languages:        c.languages || ['English'],
    location:         c.location || '',
    voiceModel:       c.voice_model || '',
    aiModel:          c.ai_model || '',
    calendarSystem:   c.calendar_system || 'None',
    crm:              c.crm_system || 'None',
    concurrentCalls:  c.concurrent_calls || null,
    weeklyData:       [0,0,0,0,0,0,0],  // Weekly breakdown not in API — shown as zero
    avatar:           (c.name || '??').split(' ').filter(w=>w).map(w=>w[0]).join('').toUpperCase().slice(0,2),
    avatarColor:      stringToColor(c.id || c.name),
    retellAgentId:    c.retell_agent_id || '',
    n8nWebhookUrl:    c.n8n_webhook_url || '',
  };
}

function normalizeCalls(calls) {
  return calls.map(c => ({
    id:            c.id,
    clientId:      c.client_id,
    clientName:    c.client?.name || c.clientName || '',
    timestamp:     c.started_at,
    duration:      c.duration_secs || 0,
    callerNumber:  c.caller_number || 'Unknown',
    intent:        c.intent || 'General Inquiry',
    outcome:       c.outcome || '',
    sentiment:     c.sentiment || 'neutral',
    isLead:        !!c.is_lead,
    isEscalation:  !!c.is_escalation,
    layer:         c.layer || 'managed',
    summary:       c.summary || '',
    transcript:    c.transcript || [],
    tags:          c.tags || [],
  }));
}

// Stable colour from string (for avatars)
function stringToColor(str) {
  const palette = ['#7c3aed','#0891b2','#b45309','#065f46','#be185d','#1d4ed8','#6d28d9','#0d9488'];
  let hash = 0;
  for (let i = 0; i < (str||'').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ── Auth ─────────────────────────────────────────────────────
async function handleLogout() {
  if (!window.DEMO_MODE) {
    try { await API.logout(); } catch(_) {}
    Auth.clear();
    window.LIVE_USER = null;
  }
  window.DEMO_MODE = false;
  state.isAuthenticated  = false;
  state.currentView      = 'dashboard';
  // Reset all caches
  state.liveClients = null; state.liveDashboard = null;
  state.liveCalls   = null; state.liveSettings  = null;
  state.liveApiKeys = null; state.liveTeam      = null;
  state.portalClient = null; state.portalCalls  = null;
  renderApp(); // renders landing since !isAuthenticated
}

function toggleViewMode() {
  state.clientViewMode = state.clientViewMode === 'cards' ? 'table' : 'cards';
  renderCurrentView();
}

// ── Loading / Error UI ───────────────────────────────────────
function loadingSpinner() {
  return `<div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:16px">
    <div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading…</div>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
}

function apiErrorState(msg, retryFn) {
  return `<div class="empty-state">
    <div class="empty-icon">⚠️</div>
    <div class="empty-title">Could not load data</div>
    <div class="empty-sub">${msg || 'Check your connection and try again.'}</div>
    <button class="btn-primary" style="margin-top:16px" onclick="(${retryFn.toString()})()">Try Again</button>
  </div>`;
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('vd-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vd-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;transition:opacity 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === 'error' ? '#7f1d1d' : '#14532d';
  toast.style.color = '#fff';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── Live Client Detail Render ────────────────────────────────
// Used when NOT in demo mode — delegates to shared render functions
function renderClientDetailLive(client, calls) {
  // Temporarily override what renderClientDetail looks up
  const origFind = Array.prototype.find;
  return renderClientDetailWithData(client, calls);
}

// ── SVG Icons ────────────────────────────────────────────────
function iconDashboard()     { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`; }
function iconClients()       { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
function iconPhone()         { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`; }
function iconPhoneNumbers()  { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`; }
function iconCalc()          { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>`; }
function iconSettings()      { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20.49 12H22M2 12H.49M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 20.49V22M12 2V.49"/></svg>`; }

// ── Globals ──────────────────────────────────────────────────
window.navigate            = navigate;
window.handleLogout        = handleLogout;
window.renderCurrentView   = renderCurrentView;
window.toggleViewMode      = toggleViewMode;
window.handleSaveSettings  = handleSaveSettings;
window.showToast           = showToast;
window.loadingSpinner      = loadingSpinner;
window.normalizeClient     = normalizeClient;
window.normalizeClients    = normalizeClients;
window.normalizeCalls      = normalizeCalls;
window.loadClientsView     = loadClientsView;
window.loadClientDetailView= loadClientDetailView;
window.loadCallLogsView    = loadCallLogsView;
window.loadPhonesView      = loadPhonesView;

window.toggleSidebar = function() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  if (overlay) overlay.classList.toggle('open', !isOpen);
};

// Auto-close sidebar on navigate (mobile)
const _origNavigate = window.navigate;
window.navigate = function(view, params) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  _origNavigate(view, params);
};

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check if backend is reachable
  const backendAlive = await checkBackendStatus();
  window.DEMO_MODE = !backendAlive;

  // 2. If alive, check for an existing stored session
  if (backendAlive && Auth.getToken()) {
    try {
      const me = await API.me();
      window.LIVE_USER = me;
      Auth.setUser(me);
      state.isAuthenticated = true;
      renderApp();
      return;
    } catch {
      Auth.clear();
    }
  }

  // 3. Show login screen
  renderApp();
});
