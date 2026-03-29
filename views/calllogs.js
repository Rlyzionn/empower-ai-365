// ============================================================
//  VOICEDESK — CALL LOGS VIEW
//  Demo mode: MOCK_CALL_LOGS
//  Live mode: state.liveCalls (loaded by app.js)
// ============================================================

// Returns the correct call list for the current mode
function _getCalls() {
  return (window.DEMO_MODE || !state.liveCalls) ? MOCK_CALL_LOGS : state.liveCalls;
}

// Returns clients list for filter dropdown
function _getClientsForFilter() {
  return (window.DEMO_MODE || !state.liveClients) ? MOCK_CLIENTS : state.liveClients;
}

function renderCallItem(call) {
  const isExpanded = state.expandedCalls && state.expandedCalls.has(call.id);
  const dur = fmtDur(call.duration || call.duration_secs || 0);
  const ts  = fmtDate(call.timestamp || call.started_at);
  const sentiment = call.sentiment || 'neutral';
  const transcript = call.transcript || [];

  return `
  <div class="call-log-item ${isExpanded ? 'expanded' : ''}" id="call-${call.id}">
    <div class="call-log-header" onclick="toggleCall('${call.id}')">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span class="call-intent">${call.intent||'General Inquiry'}</span>
          ${call.isLead      ? '<span class="badge badge-lead">🎯 Lead</span>' : ''}
          ${call.isEscalation? '<span class="badge badge-escalation">🚨 Escalation</span>' : ''}
          <span class="badge badge-${sentiment}">${sentiment.charAt(0).toUpperCase()+sentiment.slice(1)}</span>
        </div>
        <div class="call-meta-row">
          <span class="call-meta-item">📞 ${call.callerNumber||call.caller_number||'Unknown'}</span>
          <span class="call-meta-item">⏱ ${dur}</span>
          <span class="call-meta-item">🕐 ${ts}</span>
          <span class="call-meta-item">${layerBadge(call.layer||'managed')}</span>
          ${call.clientName ? `<span class="call-meta-item" style="color:var(--accent-light);font-weight:500">${call.clientName}</span>` : ''}
        </div>
      </div>
      <div class="call-expand">▼</div>
    </div>
    <div class="call-detail-panel">
      ${call.summary ? `<div class="call-summary-box">${call.summary}</div>` : ''}
      ${transcript.length > 0 ? `
      <div class="transcript-wrap">
        <div class="transcript-title">Full Transcript</div>
        ${transcript.map(line => `
          <div class="transcript-line">
            <span class="transcript-speaker ${(line.speaker||'').toLowerCase()}">${line.speaker||''}</span>
            <span class="transcript-text">${line.text||line.content||''}</span>
          </div>`).join('')}
      </div>` : `<div style="padding:12px;color:var(--text-muted);font-size:13px">No transcript available for this call.</div>`}
      ${(call.tags||[]).length > 0 ? `<div class="call-tags">${call.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>` : ''}
    </div>
  </div>`;
}

function renderCallLogs() {
  const allCalls  = _getCalls();
  const clientList= _getClientsForFilter();
  const search    = (state.callFilter || '').toLowerCase();
  const clientF   = state.callClientFilter || 'all';
  const typeF     = state.callTypeFilter   || 'all';

  const filtered = allCalls.filter(c => {
    const matchSearch = !search ||
      (c.intent||'').toLowerCase().includes(search) ||
      (c.clientName||'').toLowerCase().includes(search) ||
      (c.summary||'').toLowerCase().includes(search);
    const matchClient = clientF === 'all' || c.clientId === clientF;
    const matchType   = typeF === 'all' ||
      (typeF === 'lead' && c.isLead) ||
      (typeF === 'escalation' && c.isEscalation);
    return matchSearch && matchClient && matchType;
  });

  return `
  <div class="toolbar">
    <div class="search-wrap" style="flex:1;max-width:380px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="search-input" placeholder="Search intent, client, summary…" value="${state.callFilter||''}" oninput="handleCallSearch(this.value)" />
    </div>
    <select class="filter-select" onchange="handleCallClientFilter(this.value)">
      <option value="all">All Clients</option>
      ${clientList.map(c=>`<option value="${c.id}" ${clientF===c.id?'selected':''}>${c.name}</option>`).join('')}
    </select>
    <select class="filter-select" onchange="handleCallTypeFilter(this.value)">
      <option value="all" ${typeF==='all'?'selected':''}>All Types</option>
      <option value="lead" ${typeF==='lead'?'selected':''}>Leads Only</option>
      <option value="escalation" ${typeF==='escalation'?'selected':''}>Escalations Only</option>
    </select>
  </div>

  <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap">
    ${statPill('Total Calls',       allCalls.length,                               'var(--accent-light)')}
    ${statPill('Leads',             allCalls.filter(c=>c.isLead).length,           'var(--amber)')}
    ${statPill('Escalations',       allCalls.filter(c=>c.isEscalation).length,     'var(--red)')}
    ${statPill('Positive Sentiment',allCalls.filter(c=>c.sentiment==='positive').length, 'var(--green)')}
  </div>

  ${filtered.length === 0
    ? `<div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">${allCalls.length === 0 ? 'No calls yet' : 'No calls match your filter'}</div>
        <div class="empty-sub">${allCalls.length === 0
          ? 'Call logs will appear here once your AI agents start handling calls'
          : 'Try adjusting your search or filter criteria'}</div>
      </div>`
    : filtered.map(call => renderCallItem(call)).join('')}`;
}

function statPill(label, count, color) {
  return `<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;background:var(--bg-surface);border:1px solid var(--border);border-radius:999px;font-size:12.5px">
    <span style="color:${color};font-weight:700;font-size:15px">${count}</span>
    <span style="color:var(--text-muted)">${label}</span>
  </div>`;
}

function attachCallLogListeners() {
  window.handleCallSearch = (val) => {
    state.callFilter = val;
    const c = document.getElementById('page-content');
    if (c) {
      if (window.DEMO_MODE) {
        c.innerHTML = renderCallLogs(); attachCallLogListeners();
      } else {
        c.innerHTML = loadingSpinner();
        loadCallLogsView(c);
      }
    }
  };
  window.handleCallClientFilter = (val) => {
    state.callClientFilter = val;
    const c = document.getElementById('page-content');
    if (c) {
      if (window.DEMO_MODE) {
        c.innerHTML = renderCallLogs(); attachCallLogListeners();
      } else {
        c.innerHTML = loadingSpinner();
        loadCallLogsView(c);
      }
    }
  };
  window.handleCallTypeFilter = (val) => {
    state.callTypeFilter = val;
    const c = document.getElementById('page-content');
    if (c) {
      if (window.DEMO_MODE) {
        c.innerHTML = renderCallLogs(); attachCallLogListeners();
      } else {
        c.innerHTML = loadingSpinner();
        loadCallLogsView(c);
      }
    }
  };
  attachCallExpandListeners();
}

function attachCallExpandListeners() {
  window.toggleCall = (id) => {
    if (!state.expandedCalls) state.expandedCalls = new Set();
    if (state.expandedCalls.has(id)) state.expandedCalls.delete(id);
    else state.expandedCalls.add(id);
    const el = document.getElementById(`call-${id}`);
    if (el) el.classList.toggle('expanded', state.expandedCalls.has(id));
  };
}
