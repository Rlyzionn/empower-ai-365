// ============================================================
//  VOICEDESK — CLIENTS VIEW
//  Demo mode: MOCK_CLIENTS
//  Live mode: state.liveClients (loaded by app.js)
// ============================================================

window.handleDeleteClient = async function(id) {
  if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
  if (window.DEMO_MODE) {
    showToast('Demo mode — connect Supabase to delete clients.');
    return;
  }
  try {
    await API.clients.delete(id);
    showToast('✅ Client deleted.');
    state.liveClients = null;
    navigate('clients');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
};

// Returns the correct client list for the current mode
function _getClients() {
  return (window.DEMO_MODE || !state.liveClients) ? MOCK_CLIENTS : state.liveClients;
}

function renderClients() {
  const clients = _getClients();
  const search  = state.clientFilter.toLowerCase();
  const layerF  = state.clientLayerFilter;

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      (c.name||'').toLowerCase().includes(search) ||
      (c.contact||'').toLowerCase().includes(search) ||
      (c.industry||'').toLowerCase().includes(search);
    const matchLayer  = layerF === 'all' || c.layer === layerF;
    return matchSearch && matchLayer;
  });

  return `
  <div class="toolbar">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="client-search" class="search-input" placeholder="Search by name, industry, or contact…" value="${state.clientFilter}" oninput="handleClientSearch(this.value)" />
    </div>
    <select class="filter-select" onchange="handleLayerFilter(this.value)">
      <option value="all" ${state.clientLayerFilter==='all'?'selected':''}>All Plan Types</option>
      <option value="managed"     ${state.clientLayerFilter==='managed'?'selected':''}>⚡ Cloud Managed only</option>
      <option value="self-hosted" ${state.clientLayerFilter==='self-hosted'?'selected':''}>🖥️ Direct Deploy only</option>
    </select>
  </div>

  ${filtered.length === 0
    ? `<div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No clients found</div>
        <div class="empty-sub">Try a different search or filter</div>
      </div>`
    : state.clientViewMode === 'cards'
      ? renderClientCards(filtered)
      : renderClientTable(filtered)}`;
}

// ── Card Grid ─────────────────────────────────────────────────
function renderClientCards(clients) {
  return `<div class="client-card-grid">
    ${clients.map(c => {
      const p = pct(c.minutesUsed||0, c.minutesIncluded||1);
      const barClass = p < 65 ? 'low' : p < 85 ? 'mid' : 'high';
      const margin = calcMargin(c.costPerMin, c.pricePerMin);
      const compliance = (c.compliance||[]).length > 0;
      return `
      <div class="client-card" onclick="navigate('client-detail',{clientId:'${c.id}'})">
        <div class="client-card-top">
          <div class="client-avatar" style="background:${c.avatarColor};width:48px;height:48px;border-radius:14px;font-size:15px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;flex-shrink:0">${c.avatar}</div>
          <div style="flex:1;min-width:0">
            <div class="client-card-name">${c.name}</div>
            <div class="client-card-industry">${c.industry||''}</div>
          </div>
          <span class="badge badge-${c.status||'active'} badge-dot" style="flex-shrink:0">${(c.status||'active').charAt(0).toUpperCase()+(c.status||'active').slice(1)}</span>
        </div>

        <div class="client-card-layer-row">
          ${layerBadge(c.layer)}
          ${compliance ? `<span class="badge badge-soc2">🔒 Compliant</span>` : ''}
        </div>

        <div class="client-card-stats">
          <div class="client-card-stat">
            <div class="client-card-stat-val">${fmtMoney(c.monthlyRevenue||0)}</div>
            <div class="client-card-stat-label">Monthly</div>
          </div>
          <div class="client-card-stat-divider"></div>
          <div class="client-card-stat">
            <div class="client-card-stat-val" style="color:${margin>40?'var(--green)':'var(--amber)'}">${margin}%</div>
            <div class="client-card-stat-label">Your margin</div>
          </div>
          <div class="client-card-stat-divider"></div>
          <div class="client-card-stat">
            <div class="client-card-stat-val">${fmtNum(c.totalCalls||0)}</div>
            <div class="client-card-stat-label">Calls total</div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-bottom:6px">
            <span>Minutes used this month</span>
            <span style="font-weight:600;color:${p>85?'var(--red)':p>65?'var(--amber)':'var(--green)'}">${p}%</span>
          </div>
          <div class="usage-bar-track" style="height:6px"><div class="usage-bar-fill ${barClass}" style="width:${p}%"></div></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${fmtNum(c.minutesUsed||0)} of ${fmtNum(c.minutesIncluded||0)} minutes · ${c.plan} Plan</div>
        </div>

        <div class="client-card-footer">
          <span style="font-size:11.5px;color:var(--text-muted)">📍 ${c.location||''}</span>
          <span style="font-size:11.5px;color:var(--accent-light);font-weight:600">View details →</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── Table View ────────────────────────────────────────────────
function renderClientTable(clients) {
  return `
  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Client</th><th>Plan Type</th><th>Plan</th>
          <th>Minutes Used</th><th>Earns You</th><th>Your Margin</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${clients.map(c => {
            const p = pct(c.minutesUsed||0, c.minutesIncluded||1);
            const barClass = p < 65 ? 'low' : p < 85 ? 'mid' : 'high';
            const margin = calcMargin(c.costPerMin, c.pricePerMin);
            return `<tr onclick="navigate('client-detail',{clientId:'${c.id}'})">
              <td>
                <div class="client-cell">
                  <div class="client-avatar" style="background:${c.avatarColor}">${c.avatar}</div>
                  <div>
                    <div class="td-primary" style="font-size:13.5px">${c.name}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${c.contact||''} · ${c.location||''}</div>
                  </div>
                </div>
              </td>
              <td>${layerBadge(c.layer)}</td>
              <td style="color:var(--text-primary);font-weight:600">${c.plan}</td>
              <td>
                <div class="usage-wrap">
                  <div class="usage-bar-track"><div class="usage-bar-fill ${barClass}" style="width:${p}%"></div></div>
                  <span class="usage-pct" style="font-size:11px;min-width:80px">${fmtNum(c.minutesUsed||0)} / ${fmtNum(c.minutesIncluded||0)}</span>
                </div>
              </td>
              <td class="td-primary">${fmtMoney(c.monthlyRevenue||0)}/mo</td>
              <td style="color:${margin>40?'var(--green)':margin>30?'var(--amber)':'var(--text-secondary)'};font-weight:700">${margin}%</td>
              <td><span class="badge badge-${c.status||'active'} badge-dot">${(c.status||'active').charAt(0).toUpperCase()+(c.status||'active').slice(1)}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function attachClientListeners() {
  window.handleClientSearch = (val) => {
    state.clientFilter = val;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderClients(); attachClientListeners(); }
  };
  window.handleLayerFilter = (val) => {
    state.clientLayerFilter = val;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderClients(); attachClientListeners(); }
  };
}

// ── Client Detail ─────────────────────────────────────────────
// Called in demo mode (uses MOCK data)
function renderClientDetail(id) {
  const c = MOCK_CLIENTS.find(x => x.id === id);
  if (!c) return `<div class="empty-state"><div class="empty-icon">❓</div><div class="empty-title">Client not found</div></div>`;
  const calls = MOCK_CALL_LOGS.filter(l => l.clientId === id);
  return renderClientDetailWithData(c, calls);
}

// Called in live mode (uses API data passed directly)
function renderClientDetailWithData(c, calls) {
  const margin = calcMargin(c.costPerMin, c.pricePerMin);
  const p = pct(c.minutesUsed||0, c.minutesIncluded||1);
  const barClass = p < 65 ? 'low' : p < 85 ? 'mid' : 'high';
  const tab = state.clientDetailTab || 'overview';

  return `
  <div class="detail-hero">
    <div class="detail-hero-left">
      <div class="detail-big-avatar" style="background:${c.avatarColor}">${c.avatar}</div>
      <div>
        <div class="detail-name">${c.name}</div>
        <div class="detail-meta">
          ${layerBadge(c.layer)}
          <span class="badge badge-${c.status||'active'} badge-dot">${(c.status||'active').charAt(0).toUpperCase()+(c.status||'active').slice(1)}</span>
          ${(c.compliance||[]).length > 0 ? `<span class="badge badge-soc2">🔒 Compliance Active</span>` : ''}
          <span style="font-size:12px;color:var(--text-muted)">📍 ${c.location||''}</span>
        </div>
        <div style="margin-top:10px;font-size:12.5px;color:var(--text-muted)">
          Contact: ${c.contact||''}, ${c.title||''} · <a href="mailto:${c.email||''}" style="color:var(--accent-light)">${c.email||''}</a>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">
          ${c.phoneNumber||''} · Active since ${new Date(c.activeSince||Date.now()).toLocaleDateString('en-US',{month:'long',year:'numeric'})}
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
      <div style="font-size:32px;font-weight:800;letter-spacing:-1px">${fmtMoney(c.monthlyRevenue||0)}<span style="font-size:14px;font-weight:400;color:var(--text-muted)">/mo</span></div>
      <div style="font-size:13px;color:var(--text-secondary)">${c.plan} Plan · ${fmtMoney(c.pricePerMin||0,3)}/min</div>
      <div style="font-size:14px;color:${margin>40?'var(--green)':'var(--amber)'};font-weight:700">You keep ${margin}% of every call</div>
    </div>
  </div>

  <div class="detail-stats-row">
    ${detailStat('Total Calls Handled', fmtNum(c.totalCalls||0), 'by your AI, all time')}
    ${detailStat('Average Call Length', (c.avgCallDuration||0) + ' min', 'per conversation')}
    ${detailStat('Minutes This Month', `${fmtNum(c.minutesUsed||0)} / ${fmtNum(c.minutesIncluded||0)}`, `${p}% of plan used`)}
    ${detailStat('You Earn Per Call (avg)', fmtMoney(((c.pricePerMin||0)-(c.costPerMin||0))*(c.avgCallDuration||0),2), 'net profit per call')}
  </div>

  <div class="tab-nav">
    ${[
      {id:'overview', label:'📊 Overview'},
      {id:'calls',    label:'📞 Call History'},
      {id:'config',   label:'⚙️ Setup & Pricing'},
      ...(c.layer === 'self-hosted' ? [{id:'setup', label:'🖥️ Direct Deploy Setup'}] : []),
    ].map(t => `<div class="tab-nav-item ${tab===t.id?'active':''}" onclick="switchDetailTab('${t.id}','${c.id}')">${t.label}</div>`).join('')}
  </div>

  <div id="detail-tab-content">
    ${tab==='overview' ? renderDetailOverview(c, calls) : ''}
    ${tab==='calls'    ? renderDetailCalls(calls) : ''}
    ${tab==='config'   ? renderDetailConfig(c) : ''}
    ${tab==='setup' && c.layer==='self-hosted' ? renderDirectDeploySetup(c) : ''}
  </div>`;
}

function detailStat(label, val, sub) {
  return `<div class="detail-stat-card">
    <div class="detail-stat-label">${label}</div>
    <div class="detail-stat-val">${val}</div>
    <div class="detail-stat-sub">${sub}</div>
  </div>`;
}

function renderDetailOverview(c, calls) {
  const weeklyData = c.weeklyData || [0,0,0,0,0,0,0];
  const maxW = Math.max(...weeklyData, 1);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return `
  <div class="two-col">
    <div class="card">
      <div class="card-header"><span class="card-title">CALLS THIS WEEK</span></div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-end;gap:8px;height:90px">
          ${weeklyData.map((v,i) => {
            const h = Math.max(10, Math.round((v/maxW)*90));
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
              <div style="font-size:10px;color:var(--text-muted)">${fmtNum(v)}</div>
              <div style="width:100%;height:${h}px;background:${i===6?'var(--accent)':'rgba(124,106,255,0.25)'};border-radius:5px 5px 0 0;transition:height 0.6s"></div>
              <div style="font-size:10px;color:var(--text-muted)">${days[i]}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">RECENT CALLS</span></div>
      <div class="card-body" style="padding-top:6px">
        ${(calls||[]).slice(0,3).map(call => `
          <div class="activity-item" style="cursor:pointer" onclick="switchDetailTab('calls','${c.id}')">
            <div class="activity-icon">${call.isEscalation?'🚨':call.isLead?'🎯':'📞'}</div>
            <div class="activity-body">
              <div class="activity-text">${call.intent||'Call'}</div>
              <div class="activity-detail">${call.outcome||''}</div>
            </div>
            <span class="badge badge-${call.sentiment||'neutral'}">${(call.sentiment||'neutral').charAt(0).toUpperCase()+(call.sentiment||'neutral').slice(1)}</span>
          </div>`).join('')}
        ${(!calls||calls.length===0) ? `<div class="empty-state" style="padding:20px"><div class="empty-icon" style="font-size:30px">📞</div><div class="empty-title" style="font-size:14px">No calls yet</div><div class="empty-sub">Calls will appear here once the AI starts</div></div>` : ''}
      </div>
    </div>
  </div>`;
}

function renderDetailCalls(calls) {
  if (!calls || !calls.length) return `<div class="empty-state"><div class="empty-icon">📞</div><div class="empty-title">No calls logged yet</div><div class="empty-sub">Once the AI starts handling calls, full transcripts and summaries will appear here</div></div>`;
  return calls.map(call => renderCallItem(call)).join('');
}

function renderDetailConfig(c) {
  return `
  <div class="two-col">
    <div class="card">
      <div class="card-header"><span class="card-title">HOW THIS CLIENT IS SET UP</span></div>
      <div class="card-body">
        ${configRow('Plan Type', layerBadge(c.layer))}
        ${configRow('AI Voice Quality', `<span style="color:var(--text-primary);font-weight:600">${(c.voiceModel||'').replace('ElevenLabs Premium','🏆 Premium (ElevenLabs)').replace('Cartesia Sonic','✅ Very Good (Cartesia)')}</span>`)}
        ${configRow('AI Brain', `<span style="color:var(--text-primary);font-weight:600">${c.aiModel||'GPT-4o'}</span>`)}
        ${configRow('Calendar Connected', c.calendarSystem||'None')}
        ${configRow('CRM Connected', c.crm||'None')}
        ${configRow('Languages', (c.languages||['English']).join(', '))}
        ${configRow('Simultaneous Calls', c.concurrentCalls ? c.concurrentCalls + ' lines included' : 'Unlimited (scales automatically)')}
        ${(c.compliance||[]).length > 0 ? configRow('Compliance', c.compliance.map(x=>`<span class="badge badge-${x.toLowerCase()}">${x}</span>`).join(' ')) : ''}
        ${c.retellAgentId ? configRow('Retell Agent ID', `<code style="font-size:11px;color:var(--text-muted)">${c.retellAgentId}</code>`) : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">YOUR EARNINGS FROM THIS CLIENT</span></div>
      <div class="card-body">
        ${configRow('Client\'s Plan', `<span style="font-weight:700;color:var(--text-primary)">${c.plan}</span>`)}
        ${configRow('Included Minutes', fmtNum(c.minutesIncluded||0) + ' per month')}
        ${configRow('They Pay Per Minute', fmtMoney(c.pricePerMin||0,3))}
        ${configRow('Extra Minutes Rate', fmtMoney(c.extraPricePerMin||0,3) + ' per minute')}
        ${configRow('Your Cost Per Minute', fmtMoney(c.costPerMin||0,3))}
        ${configRow('Your Profit Per Minute', `<span style="color:var(--green);font-weight:700">${fmtMoney((c.pricePerMin||0)-(c.costPerMin||0),3)}</span>`)}
        ${configRow('Your Margin', `<span style="color:var(--green);font-weight:800;font-size:15px">${calcMargin(c.costPerMin,c.pricePerMin)}%</span>`)}
        ${configRow('Monthly Income', `<span style="color:var(--text-primary);font-weight:800;font-size:15px">${fmtMoney(c.monthlyRevenue||0)}/mo</span>`)}
      </div>
    </div>
  </div>`;
}

function configRow(label, val) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px">
    <span style="color:var(--text-muted)">${label}</span><span style="color:var(--text-secondary)">${val}</span>
  </div>`;
}

// ── Edit Client Modal ─────────────────────────────────────────
function renderEditClientModal(c) {
  return `
  <div id="edit-client-modal" class="modal-overlay" onclick="if(event.target===this)closeEditClientModal()" style="opacity:0;transition:opacity 0.22s ease">
    <div id="edit-client-modal-box" style="position:relative;width:100%;max-width:560px;background:rgba(8,8,12,0.97);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:32px;box-shadow:0 32px 90px rgba(0,0,0,0.85);backdrop-filter:blur(40px);transform:translateY(18px);transition:transform 0.24s cubic-bezier(0.22,1,0.36,1)">
      <button onclick="closeEditClientModal()" style="position:absolute;top:14px;right:14px;width:28px;height:28px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);cursor:pointer;font-size:14px">✕</button>

      <div style="font-size:18px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Edit Client</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:22px">${c.name}</div>

      ${window.DEMO_MODE ? `<div style="background:rgba(180,83,9,0.15);border:1px solid rgba(180,83,9,0.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#fbbf24;margin-bottom:16px">Demo mode — connect Supabase to save real changes</div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="lp-field" style="grid-column:1/-1">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Business Name</label>
          <input id="edit-client-name" type="text" value="${(c.name||'').replace(/"/g,'&quot;')}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Contact Name</label>
          <input id="edit-client-contact" type="text" value="${(c.contact||'').replace(/"/g,'&quot;')}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Contact Email</label>
          <input id="edit-client-email" type="email" value="${(c.email||'').replace(/"/g,'&quot;')}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Status</label>
          <select id="edit-client-status"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box">
            <option value="active"  ${c.status==='active' ?'selected':''}>Active</option>
            <option value="paused"  ${c.status==='paused' ?'selected':''}>Paused</option>
          </select>
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Plan</label>
          <select id="edit-client-plan"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box">
            <option value="Starter"      ${c.plan==='Starter'     ?'selected':''}>Starter</option>
            <option value="Growth"       ${c.plan==='Growth'      ?'selected':''}>Growth</option>
            <option value="Professional" ${c.plan==='Professional'?'selected':''}>Professional</option>
            <option value="Enterprise"   ${c.plan==='Enterprise'  ?'selected':''}>Enterprise</option>
          </select>
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Minutes Included</label>
          <input id="edit-client-minutes" type="number" min="0" value="${c.minutesIncluded||0}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Price per Min ($/min)</label>
          <input id="edit-client-price" type="number" step="0.001" min="0" value="${c.pricePerMin||0}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
        <div class="lp-field">
          <label style="display:block;font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-bottom:5px">Cost per Min ($/min)</label>
          <input id="edit-client-cost" type="number" step="0.001" min="0" value="${c.costPerMin||0}"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--text-primary);outline:none;box-sizing:border-box" />
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:22px">
        <button class="topbar-btn ghost" style="flex:1" onclick="closeEditClientModal()">Cancel</button>
        <button class="topbar-btn primary" style="flex:2" onclick="submitEditClient('${c.id}')">Save Changes</button>
      </div>
    </div>
  </div>`;
}

window.closeEditClientModal = function() {
  const overlay = document.getElementById('edit-client-modal');
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 250);
};

window.submitEditClient = async function(clientId) {
  if (window.DEMO_MODE) {
    showToast('Edit client: connect Supabase to save changes (demo mode)');
    closeEditClientModal();
    return;
  }
  const data = {
    name:             document.getElementById('edit-client-name')?.value?.trim(),
    contact_name:     document.getElementById('edit-client-contact')?.value?.trim(),
    contact_email:    document.getElementById('edit-client-email')?.value?.trim(),
    status:           document.getElementById('edit-client-status')?.value,
    plan:             document.getElementById('edit-client-plan')?.value,
    minutes_included: parseInt(document.getElementById('edit-client-minutes')?.value || '0', 10),
    price_per_min:    parseFloat(document.getElementById('edit-client-price')?.value || '0'),
    cost_per_min:     parseFloat(document.getElementById('edit-client-cost')?.value || '0'),
  };
  // Remove undefined/empty entries
  Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === undefined) delete data[k]; });

  try {
    await API.clients.update(clientId, data);
    showToast('Client updated successfully');
    closeEditClientModal();
    // Refresh the current view
    const contEl = document.getElementById('page-content');
    if (contEl) {
      contEl.innerHTML = loadingSpinner();
      loadClientDetailView(contEl, clientId);
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

window.openEditClient = async function(id) {
  if (window.DEMO_MODE) {
    showToast('Edit client: connect Supabase to save changes (demo mode)');
    return;
  }
  try {
    const res = await API.clients.get(id);
    const c   = normalizeClient(res.data);
    // Remove any existing modal
    const existing = document.getElementById('edit-client-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', renderEditClientModal(c));
    requestAnimationFrame(() => {
      const overlay = document.getElementById('edit-client-modal');
      const box     = document.getElementById('edit-client-modal-box');
      if (overlay) overlay.style.opacity = '1';
      if (box) box.style.transform = 'translateY(0)';
    });
  } catch (err) {
    showToast('Error loading client: ' + err.message, 'error');
  }
};

function renderDirectDeploySetup(c) {
  const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : window.location.origin;
  const webhookUrl = `${apiBase}/api/webhooks/pipecat/${c.id}`;
  const retellId   = c.retellAgentId || '(not assigned)';

  return `
  <div class="two-col" style="margin-top:4px">

    <!-- Webhook Config -->
    <div class="card">
      <div class="card-header"><span class="card-title">PIPECAT WEBHOOK CONFIG</span></div>
      <div class="card-body">
        <div style="margin-bottom:14px;padding:12px 14px;background:rgba(34,211,238,0.06);border:1px solid rgba(34,211,238,0.15);border-radius:10px;font-size:12.5px;color:var(--text-secondary);line-height:1.7">
          Set this URL as your Pipecat pipeline's <strong style="color:var(--cyan)">on_call_end</strong> webhook.
          After every call, your Pipecat instance posts the call data here and it appears in Call History automatically.
        </div>
        ${configRow('Client Webhook URL', `
          <div style="display:flex;align-items:center;gap:8px">
            <code style="font-size:11px;color:var(--accent-light);word-break:break-all">${webhookUrl}</code>
            <button class="btn-secondary" style="font-size:11px;padding:4px 8px;flex-shrink:0" onclick="navigator.clipboard.writeText('${webhookUrl}').then(()=>showToast('Copied!'))">Copy</button>
          </div>`)}
        ${configRow('Client ID', `<code style="font-size:11px;color:var(--text-muted)">${c.id}</code>`)}
        ${configRow('Expected payload', `<code style="font-size:11px;color:var(--text-muted)">JSON — see format below</code>`)}
      </div>
    </div>

    <!-- Retell info -->
    <div class="card">
      <div class="card-header"><span class="card-title">RETELL AGENT LINK</span></div>
      <div class="card-body">
        <div style="margin-bottom:14px;padding:12px 14px;background:rgba(124,106,255,0.06);border:1px solid rgba(124,106,255,0.15);border-radius:10px;font-size:12.5px;color:var(--text-secondary);line-height:1.7">
          If this client uses a Retell phone number on the Direct Deploy layer, link it to a Retell agent ID here so inbound calls route correctly.
        </div>
        ${configRow('Retell Agent ID', retellId !== '(not assigned)'
          ? `<code style="font-size:11px;color:var(--accent-light)">${retellId}</code>`
          : `<span style="color:var(--text-muted);font-size:12px">Not set — <a onclick="openEditClient('${c.id}')" style="color:var(--accent-light);cursor:pointer">Edit client</a> to assign</span>`
        )}
        ${configRow('Layer', `<span class="badge badge-selfhosted badge-dot">Direct Deploy</span>`)}
        ${configRow('AI Model', c.aiModel || 'GPT-4o')}
        ${configRow('TTS Voice', c.voiceModel || 'Cartesia Sonic')}
      </div>
    </div>

  </div>

  <!-- Pipecat payload format -->
  <div class="card" style="margin-top:20px">
    <div class="card-header">
      <span class="card-title">EXPECTED PIPECAT PAYLOAD FORMAT</span>
      <button class="topbar-btn ghost" style="font-size:11px;padding:5px 10px" onclick="navigator.clipboard.writeText(JSON.stringify({call_id:'uuid',started_at:'ISO-8601',ended_at:'ISO-8601',duration_secs:120,from_number:'+15550001234',transcript:[{role:'user',content:'Hello'},{role:'assistant',content:'Hi there!'}],summary:'Customer called to book appointment',sentiment:'positive',is_lead:true,is_escalation:false,outcome:'Appointment booked'},null,2)).then(()=>showToast('Copied!'))">Copy JSON</button>
    </div>
    <div class="card-body">
      <pre style="font-size:11.5px;color:var(--text-secondary);line-height:1.7;overflow-x:auto;margin:0">{
  "call_id":       "uuid — unique per call",
  "started_at":    "2026-03-30T14:00:00Z",
  "ended_at":      "2026-03-30T14:02:00Z",
  "duration_secs": 120,
  "from_number":   "+15550001234",
  "transcript": [
    { "role": "user",      "content": "Hello, I need to book an appointment" },
    { "role": "assistant", "content": "Of course! What date works for you?" }
  ],
  "summary":       "Customer called to book appointment — confirmed for Tuesday 3pm",
  "sentiment":     "positive",   <span style="color:var(--text-muted)">// positive | neutral | negative</span>
  "is_lead":       true,
  "is_escalation": false,
  "outcome":       "Appointment booked"
}</pre>
    </div>
  </div>

  <!-- Quick start guide -->
  <div class="card" style="margin-top:20px">
    <div class="card-header"><span class="card-title">QUICK START — DEPLOY YOUR PIPECAT PIPELINE</span></div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ['1', 'Install Pipecat', 'pip install pipecat-ai[daily,openai,cartesia,deepgram]'],
          ['2', 'Set your webhook', 'In your pipeline\'s on_call_end handler, POST the JSON above to the webhook URL'],
          ['3', 'Add Telnyx / Twilio', 'Connect your SIP provider so inbound calls reach your Pipecat bot'],
          ['4', 'Test it', 'Make a test call — it will appear in Call History within seconds'],
          ['5', 'Go live', 'Give your client their phone number — AI handles every call from here'],
        ].map(([n, title, detail]) => `
          <div style="display:flex;gap:14px;padding:12px 14px;background:var(--bg-surface3);border-radius:10px;border:1px solid var(--border)">
            <div style="width:24px;height:24px;background:var(--accent-glow);border:1px solid var(--border-accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--accent-light);flex-shrink:0">${n}</div>
            <div>
              <div style="font-weight:600;font-size:13px;margin-bottom:3px">${title}</div>
              <div style="font-size:12px;color:var(--text-muted)">${detail}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function attachDetailListeners() {
  window.switchDetailTab = (tab, id) => {
    state.clientDetailTab = tab;
    document.querySelectorAll('.tab-nav-item').forEach(t => {
      t.classList.toggle('active', t.textContent.trim().toLowerCase().includes(tab));
    });
    const el = document.getElementById('detail-tab-content');
    if (!el) return;

    // Use live data if available, otherwise mock
    let c, calls;
    if (!window.DEMO_MODE && state._detailClient && state._detailClient.id === id) {
      c     = state._detailClient;
      calls = state._detailCalls || [];
    } else {
      c     = MOCK_CLIENTS.find(x => x.id === id);
      calls = MOCK_CALL_LOGS.filter(l => l.clientId === id);
    }

    if (!c) return;
    if (tab==='overview') el.innerHTML = renderDetailOverview(c, calls);
    else if (tab==='calls') el.innerHTML = renderDetailCalls(calls);
    else if (tab==='setup') el.innerHTML = renderDirectDeploySetup(c);
    else el.innerHTML = renderDetailConfig(c);
    attachCallExpandListeners();
  };
  attachCallExpandListeners();
}
