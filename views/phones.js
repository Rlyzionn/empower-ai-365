// ============================================================
//  VOICEDESK — PHONE NUMBERS VIEW
//  Demo mode: MOCK_PHONES
//  Live mode: GET /api/retell/phone-numbers
// ============================================================

const MOCK_PHONES = [
  { phone_number: '+1 (555) 100-0001', nickname: 'Main Line — Demo Business',  agent_id: 'agent_xxx', last_modification_timestamp: Date.now() - 86400000  },
  { phone_number: '+1 (555) 100-0002', nickname: 'Support Line — Law Office',  agent_id: 'agent_yyy', last_modification_timestamp: Date.now() - 172800000 },
  { phone_number: '+1 (555) 100-0003', nickname: null,                          agent_id: null,        last_modification_timestamp: Date.now() - 259200000 },
];

// ── Helpers ──────────────────────────────────────────────────
function _fmtPhone(raw) {
  // Return as-is if already formatted, otherwise just return raw
  return raw || '—';
}

function _phoneAge(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  return `Added ${days} days ago`;
}

// ── Render a single phone number card ────────────────────────
function renderPhoneCard(p) {
  const isActive   = !!p.agent_id;
  const nickname   = p.nickname || '<span style="color:var(--text-muted);font-style:italic">(no nickname)</span>';
  const badgeClass = isActive ? 'badge-active' : 'badge-paused';
  const badgeText  = isActive ? 'Active' : 'Unassigned';
  const agentSnip  = p.agent_id
    ? `<span style="font-size:11px;color:var(--text-muted);font-family:monospace">${p.agent_id}</span>`
    : `<span style="font-size:11px;color:var(--text-muted)">No agent assigned</span>`;

  return `
  <div class="phone-card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px 22px;display:flex;flex-direction:column;gap:12px;backdrop-filter:blur(12px);">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;background:rgba(124,106,255,0.14);border:1px solid rgba(124,106,255,0.25);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text-primary);letter-spacing:-0.3px">${_fmtPhone(p.phone_number)}</div>
          <div style="font-size:12.5px;margin-top:2px">${nickname}</div>
        </div>
      </div>
      <span class="badge ${badgeClass} badge-dot" style="flex-shrink:0;margin-top:2px">${badgeText}</span>
    </div>

    <div style="display:flex;flex-direction:column;gap:6px;padding:12px;background:rgba(0,0,0,0.2);border-radius:10px;border:1px solid rgba(255,255,255,0.04)">
      <div style="display:flex;justify-content:space-between;font-size:12px">
        <span style="color:var(--text-muted)">Agent</span>
        <span>${agentSnip}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px">
        <span style="color:var(--text-muted)">Last modified</span>
        <span style="color:var(--text-secondary)">${_phoneAge(p.last_modification_timestamp)}</span>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-top:2px">
      <button class="topbar-btn ghost" style="flex:1;font-size:12px;padding:7px 12px"
        onclick="handleAssignAgent('${p.phone_number.replace(/'/g,"\\'")}')">
        Assign Agent
      </button>
      <button class="topbar-btn ghost" style="font-size:12px;padding:7px 12px;color:var(--red,#ef4444);border-color:rgba(239,68,68,0.25)"
        onclick="handleReleasePhone('${p.phone_number.replace(/'/g,"\\'")}')">
        Release
      </button>
    </div>
  </div>`;
}

// ── Main render (accepts array of phone objects) ──────────────
function renderPhones(phones) {
  const activeCount = (phones || []).filter(p => p.agent_id).length;

  return `
  <div style="display:flex;flex-direction:column;gap:20px">

    <!-- Summary bar -->
    <div class="card" style="padding:20px 24px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:20px">
          <div>
            <div style="font-size:28px;font-weight:800;letter-spacing:-1px">${phones.length}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:1px">Total numbers registered</div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.07)"></div>
          <div>
            <div style="font-size:28px;font-weight:800;letter-spacing:-1px;color:var(--green,#22c55e)">${activeCount}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:1px">Active (agent assigned)</div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.07)"></div>
          <div>
            <div style="font-size:28px;font-weight:800;letter-spacing:-1px;color:var(--amber,#f59e0b)">${phones.length - activeCount}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:1px">Unassigned</div>
          </div>
        </div>
        <button class="topbar-btn primary" onclick="handleImportPhone()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Import Number
        </button>
      </div>
    </div>

    ${phones.length === 0
      ? `<div class="empty-state">
          <div class="empty-icon">📞</div>
          <div class="empty-title">No phone numbers yet</div>
          <div class="empty-sub">Import a number to get started. Numbers you register here will be managed through Retell AI.</div>
        </div>`
      : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">
          ${phones.map(renderPhoneCard).join('')}
        </div>`}
  </div>`;
}

// ── Import Modal ──────────────────────────────────────────────
function renderImportPhoneModal() {
  return `
  <div id="import-phone-modal" class="modal-overlay" onclick="if(event.target===this)closeImportPhoneModal()" style="opacity:0;transition:opacity 0.22s ease">
    <div style="position:relative;width:100%;max-width:440px;background:rgba(8,8,12,0.97);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:32px;box-shadow:0 32px 90px rgba(0,0,0,0.85);backdrop-filter:blur(40px);transform:translateY(18px);transition:transform 0.24s cubic-bezier(0.22,1,0.36,1)" id="import-phone-modal-box">
      <button onclick="closeImportPhoneModal()" style="position:absolute;top:14px;right:14px;width:28px;height:28px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);cursor:pointer;font-size:14px">✕</button>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <div style="width:38px;height:38px;background:rgba(124,106,255,0.14);border:1px solid rgba(124,106,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div style="font-size:17px;font-weight:700;color:var(--text-primary)">Import Phone Number</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:1px">Register an existing number with Retell AI</div>
        </div>
      </div>

      ${window.DEMO_MODE ? `<div style="background:rgba(180,83,9,0.15);border:1px solid rgba(180,83,9,0.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#fbbf24;margin-bottom:16px">Demo mode — connect Supabase to save real changes</div>` : ''}

      <div class="lp-field">
        <label>Phone Number <span style="color:var(--red,#ef4444)">*</span></label>
        <input id="import-phone-input" class="lp-field input" type="tel" placeholder="+1 (555) 000-0000"
          style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;font-size:13.5px;color:var(--text-primary);outline:none;box-sizing:border-box" />
      </div>
      <div class="lp-field" style="margin-top:12px">
        <label>Nickname <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
        <input id="import-nickname-input" class="lp-field input" type="text" placeholder="e.g. Main Line — Acme Corp"
          style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;font-size:13.5px;color:var(--text-primary);outline:none;box-sizing:border-box" />
      </div>
      <div class="lp-field" style="margin-top:12px">
        <label>Agent ID <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
        <input id="import-agent-input" class="lp-field input" type="text" placeholder="agent_xxxxxx"
          style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;font-size:13.5px;color:var(--text-primary);outline:none;font-family:monospace;box-sizing:border-box" />
      </div>

      <div style="display:flex;gap:10px;margin-top:22px">
        <button class="topbar-btn ghost" style="flex:1" onclick="closeImportPhoneModal()">Cancel</button>
        <button class="topbar-btn primary" style="flex:2" onclick="submitImportPhone()">Import Number</button>
      </div>
    </div>
  </div>`;
}

// ── Action Handlers (exposed as globals) ──────────────────────
window.handleImportPhone = function() {
  // Remove any existing modal
  const existing = document.getElementById('import-phone-modal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', renderImportPhoneModal());
  // Animate in
  requestAnimationFrame(() => {
    const overlay = document.getElementById('import-phone-modal');
    const box     = document.getElementById('import-phone-modal-box');
    if (overlay) overlay.style.opacity = '1';
    if (box) box.style.transform = 'translateY(0)';
  });
};

window.closeImportPhoneModal = function() {
  const overlay = document.getElementById('import-phone-modal');
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 250);
};

window.submitImportPhone = async function() {
  const phoneEl    = document.getElementById('import-phone-input');
  const agentEl    = document.getElementById('import-agent-input');
  const phone = (phoneEl ? phoneEl.value : '').trim();

  if (!phone) {
    showToast('Please enter a phone number', 'error');
    return;
  }

  if (window.DEMO_MODE) {
    showToast('Demo mode — connect Supabase to import real numbers');
    closeImportPhoneModal();
    return;
  }

  const agent_id = agentEl ? agentEl.value.trim() : '';
  try {
    await API.phones.import({ phone_number: phone, agent_id: agent_id || undefined });
    showToast('Phone number imported successfully');
    closeImportPhoneModal();
    // Refresh the view
    const contEl = document.getElementById('page-content');
    if (contEl) {
      contEl.innerHTML = loadingSpinner();
      loadPhonesView(contEl);
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

window.handleAssignAgent = function(phone) {
  if (window.DEMO_MODE) {
    showToast('Demo mode — connect Supabase to assign real agents');
    return;
  }
  const agentId = window.prompt('Enter Agent ID to assign to ' + phone + ':');
  if (!agentId) return;
  API.phones.update(phone, { agent_id: agentId })
    .then(() => {
      showToast('Agent assigned successfully');
      const contEl = document.getElementById('page-content');
      if (contEl) { contEl.innerHTML = loadingSpinner(); loadPhonesView(contEl); }
    })
    .catch(err => showToast('Error: ' + err.message, 'error'));
};

window.handleReleasePhone = function(phone) {
  if (window.DEMO_MODE) {
    showToast('Demo mode — connect Supabase to release real numbers');
    return;
  }
  if (!window.confirm('Release ' + phone + '? This will remove it from Retell AI.')) return;
  API.phones.delete(phone)
    .then(() => {
      showToast('Phone number released');
      const contEl = document.getElementById('page-content');
      if (contEl) { contEl.innerHTML = loadingSpinner(); loadPhonesView(contEl); }
    })
    .catch(err => showToast('Error: ' + err.message, 'error'));
};

// ── View Loader (called by app.js dispatcher) ─────────────────
async function loadPhonesView(contEl) {
  if (window.DEMO_MODE) {
    contEl.innerHTML = renderPhones(MOCK_PHONES);
    return;
  }
  try {
    const res = await API.phones.list();
    contEl.innerHTML = renderPhones(res.data || []);
  } catch (err) {
    contEl.innerHTML = apiErrorState(err.message, () => loadPhonesView(contEl));
  }
}

window.loadPhonesView = loadPhonesView;
