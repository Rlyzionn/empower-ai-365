// ============================================================
//  VOICEDESK — SETTINGS VIEW
//  Demo mode: static UI, no saves
//  Live mode: loads from API, saves changes to backend
// ============================================================

function renderSettings() {
  const tab = state.settingsTab || 'branding';
  const tabs = [
    { id:'branding',      icon:'🎨', label:'Branding' },
    { id:'notifications', icon:'🔔', label:'Notifications' },
    { id:'api',           icon:'🔑', label:'API Keys' },
    { id:'team',          icon:'👥', label:'Team' },
  ];

  return `
  <div class="settings-layout">
    <div>
      <div class="settings-nav">
        ${tabs.map(t => `
          <div class="settings-nav-item ${tab===t.id?'active':''}" onclick="switchSettingsTab('${t.id}')">
            <span>${t.icon}</span>${t.label}
          </div>`).join('')}
      </div>
    </div>
    <div id="settings-content">
      ${tab==='branding'      ? renderSettingsBranding()      : ''}
      ${tab==='notifications' ? renderSettingsNotifications() : ''}
      ${tab==='api'           ? renderSettingsApi()           : ''}
      ${tab==='team'          ? renderSettingsTeam()          : ''}
    </div>
  </div>`;
}

// ── Branding ─────────────────────────────────────────────────
function renderSettingsBranding() {
  const live = (!window.DEMO_MODE && state.liveSettings) ? state.liveSettings : null;

  return `
  <div>
    <div class="settings-section-title">Platform Branding</div>
    <div class="settings-section-sub">Customise how your platform appears to you. Your clients never see any of this — they only see your brand name on their calls and experience.</div>

    <div class="card card-body" style="margin-bottom:18px">
      <div class="settings-group-title">Brand Identity</div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Platform Name</div>
          <div class="settings-row-sub">Shown in your dashboard header and login screen</div>
        </div>
        <input class="settings-input" data-key="name" value="${live?.name || 'VoiceDesk'}" />
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Tagline</div>
          <div class="settings-row-sub">Short descriptor shown under your logo</div>
        </div>
        <input class="settings-input" data-key="tagline" value="${live?.tagline || 'Tier 3 AI Voice Platform'}" />
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Support Email</div>
          <div class="settings-row-sub">Shown on client-facing communications</div>
        </div>
        <input class="settings-input" data-key="support_email" value="${live?.support_email || 'support@voicedesk.io'}" />
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Primary Colour</div>
          <div class="settings-row-sub">Accent colour across the platform UI</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="color" value="${live?.brand_color || '#7c6aff'}" id="color-picker" style="width:40px;height:36px;border-radius:var(--radius-sm);cursor:pointer;border:1px solid var(--border);background:none;padding:2px" oninput="document.querySelector('.settings-input[data-key=brand_color]').value=this.value" />
          <input class="settings-input" data-key="brand_color" value="${live?.brand_color || '#7c6aff'}" style="width:120px" oninput="document.getElementById('color-picker').value=this.value" />
        </div>
      </div>
    </div>

    <div class="card card-body">
      <div class="settings-group-title">White-Label Settings</div>
      ${toggleRow('Hide TechVera branding', 'No TechVera or third-party names anywhere visible to you or your clients', true)}
      ${toggleRow('Custom domain support', 'Platform accessible at your own domain (e.g. platform.yourbrand.com)', false)}
      ${toggleRow('Custom email sending domain', 'Outbound confirmations sent from your own email domain', false)}
      <div style="margin-top:14px;padding:12px 14px;background:var(--accent-glow);border:1px solid var(--border-accent);border-radius:var(--radius-sm);font-size:12.5px;color:var(--text-secondary);line-height:1.6">
        🔒 <strong style="color:var(--text-primary)">100% White-Label Guaranteed.</strong> Your clients see only your brand. TechVera is the invisible engine behind it.
      </div>
    </div>
  </div>`;
}

// ── Notifications ─────────────────────────────────────────────
function renderSettingsNotifications() {
  const cfg = (!window.DEMO_MODE && state.liveSettings?.settings?.notifications) || {};
  return `
  <div>
    <div class="settings-section-title">Notifications</div>
    <div class="settings-section-sub">Configure how and where you receive alerts from across all client deployments.</div>
    <div class="card card-body" style="margin-bottom:18px">
      <div class="settings-group-title">Alert Delivery</div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Slack Webhook URL</div>
          <div class="settings-row-sub">Receive alerts in your Slack workspace</div>
        </div>
        <input class="settings-input" id="notif-slack" placeholder="https://hooks.slack.com/services/…" value="${cfg.slack_url||''}" />
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Alert Email</div>
          <div class="settings-row-sub">Receive email notifications for all platform events</div>
        </div>
        <input class="settings-input" id="notif-email" value="${cfg.alert_email || (window.LIVE_USER?.email || 'admin@voicedesk.io')}" />
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">SMS Alerts (Phone)</div>
          <div class="settings-row-sub">Receive critical escalation alerts by SMS</div>
        </div>
        <input class="settings-input" id="notif-sms" placeholder="+1 (555) 000-0000" value="${cfg.sms_number||''}" />
      </div>
    </div>
    <div class="card card-body">
      <div class="settings-group-title">Alert Types</div>
      ${toggleRow('New lead detected',          'Notify when the AI identifies a new qualified lead',             true)}
      ${toggleRow('Emergency escalation',       'Immediate alert when any client triggers an emergency call',     true)}
      ${toggleRow('Appointment booked',         'Notification when an appointment is scheduled',                 false)}
      ${toggleRow('Call volume spike',          'Alert when a client exceeds 90% of their monthly minute limit', true)}
      ${toggleRow('Client plan upgrade needed', 'Warn when a client is near their usage cap',                    true)}
      ${toggleRow('New call summary available', 'Post call summary to Slack/email after each call ends',         false)}
    </div>
  </div>`;
}

// ── API Keys ──────────────────────────────────────────────────
function renderSettingsApi() {
  // Group API keys
  const savedKeys = (!window.DEMO_MODE && state.liveApiKeys) ? state.liveApiKeys : null;

  const keyValue = (service, fallback) => {
    if (!savedKeys) return fallback;
    const found = savedKeys.find(k => k.service_name === service);
    return found ? found.masked_key : '(not set)';
  };

  return `
  <div>
    <div class="settings-section-title">API Keys & Integrations</div>
    <div class="settings-section-sub">
      Manage the credentials used for each infrastructure component. These are stored securely and never exposed to your clients.
      ${window.DEMO_MODE ? `<span style="color:var(--amber);font-weight:600"> — Connect Supabase first to save real API keys.</span>` : ''}
    </div>

    <div class="card card-body" style="margin-bottom:18px">
      <div class="settings-group-title">⚡ Managed Layer (Retell AI) — Tier 1</div>
      ${apiKeyRow('retell',      'Retell AI API Key',   keyValue('retell',      'rtl_live_••••••••••••3f9a'), 'From: app.retellai.com → Settings → API Key')}
      ${apiKeyRow('elevenlabs',  'ElevenLabs API Key',  keyValue('elevenlabs',  'sk_••••••••••••••5b2c'),     'From: elevenlabs.io → Profile → API Key')}
      ${apiKeyRow('twilio',      'Twilio Account SID',  keyValue('twilio',      'AC••••••••••••7e1d'),        'From: console.twilio.com → Dashboard')}
    </div>

    <div class="card card-body" style="margin-bottom:18px">
      <div class="settings-group-title">🖥️ Direct Deploy Layer (Self-Hosted) — Tier 2</div>
      ${apiKeyRow('livekit',     'LiveKit API Key',     keyValue('livekit',     'lkt_••••••••••9a4f'),        'From: livekit.io → Cloud Dashboard')}
      ${apiKeyRow('deepgram',    'Deepgram API Key',    keyValue('deepgram',    'dg_••••••••••4d6e'),         'From: console.deepgram.com → API Keys')}
      ${apiKeyRow('cartesia',    'Cartesia API Key',    keyValue('cartesia',    'cart_•••••••••••1a2b'),       'From: cartesia.ai → Dashboard')}
      ${apiKeyRow('telnyx',      'Telnyx API Key',      keyValue('telnyx',      'KEY••••••••••1f3a'),         'From: portal.telnyx.com → API Keys')}
    </div>

    <div class="card card-body">
      <div class="settings-group-title">🔗 Automations & CRM</div>
      ${apiKeyRow('n8n',         'n8n Webhook Secret',       keyValue('n8n',         'n8n_••••••••3e2f'),   'Your n8n instance webhook secret')}
      ${apiKeyRow('hubspot',     'HubSpot Private App Token', keyValue('hubspot',     'pat-••••••6d1a'),     'From: app.hubspot.com → Settings → Private Apps')}
      ${apiKeyRow('ghl',         'GoHighLevel API Key',       keyValue('ghl',         '(not set)'),          'From: app.gohighlevel.com → Settings → API')}
      ${apiKeyRow('openrouter',  'OpenRouter API Key',        keyValue('openrouter',  'sk-or-••••2c8b'),     'From: openrouter.ai → Keys')}
    </div>
  </div>`;
}

// ── Team ──────────────────────────────────────────────────────
function renderSettingsTeam() {
  const liveTeam = (!window.DEMO_MODE && state.liveTeam) ? state.liveTeam : null;
  const members = liveTeam || [
    { id:'m1', name:'Admin',       email:'admin@voicedesk.io',  role:'Owner',   initials:'AD', color:'#7c3aed', invite_accepted:true },
    { id:'m2', name:'Jane Ops',    email:'jane@voicedesk.io',   role:'Manager', initials:'JO', color:'#0891b2', invite_accepted:true },
    { id:'m3', name:'Sam Support', email:'sam@voicedesk.io',    role:'Support', initials:'SS', color:'#065f46', invite_accepted:true },
  ];

  const formatMember = m => ({
    ...m,
    initials: m.initials || (m.name||'??').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),
    color:    m.color    || '#7c3aed',
    status:   m.invite_accepted ? 'active' : 'pending',
  });

  return `
  <div>
    <div class="settings-section-title">Team Members</div>
    <div class="settings-section-sub">Manage who has access to this platform dashboard. All team members see the full client list by default.</div>
    <div class="card" style="margin-bottom:16px">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${members.map(raw => {
              const m = formatMember(raw);
              return `<tr>
                <td><div class="client-cell">
                  <div class="client-avatar" style="background:${m.color}">${m.initials}</div>
                  <div><div class="td-primary">${m.name||''}</div><div style="font-size:11px;color:var(--text-muted)">${m.email||''}</div></div>
                </div></td>
                <td><span class="badge" style="background:var(--bg-surface3);color:var(--text-secondary)">${m.role||'Manager'}</span></td>
                <td><span class="badge badge-${m.status==='active'?'active':'pending'} badge-dot">${m.status==='active'?'Active':'Pending invite'}</span></td>
                <td>
                  <button class="btn-secondary" style="font-size:11px;padding:5px 10px"
                    onclick="handleEditTeamRole('${m.id}','${m.role||'manager'}')">Edit Role</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <button class="btn-primary" onclick="handleInviteTeamMember()">+ Invite Team Member</button>
  </div>`;
}

// ── Shared row builders ───────────────────────────────────────
function toggleRow(label, sub, checked) {
  return `<div class="settings-row">
    <div class="settings-row-info">
      <div class="settings-row-label">${label}</div>
      <div class="settings-row-sub">${sub}</div>
    </div>
    <label class="toggle"><input type="checkbox" ${checked?'checked':''}><span class="toggle-slider"></span></label>
  </div>`;
}

function apiKeyRow(service, label, maskedKey, hint) {
  return `<div class="settings-row" style="flex-wrap:wrap;gap:10px">
    <div class="settings-row-info" style="flex:1;min-width:180px">
      <div class="settings-row-label">${label}</div>
      ${hint ? `<div class="settings-row-sub" style="font-size:10.5px">${hint}</div>` : ''}
    </div>
    <div class="api-key-row" id="key-row-${service}">
      <div class="api-key-display">${maskedKey}</div>
      <button class="btn-secondary" style="font-size:11px;padding:6px 10px" onclick="handleUpdateApiKey('${service}','${label}')">Update</button>
    </div>
  </div>`;
}

// ── Event Handlers ────────────────────────────────────────────
function attachSettingsListeners() {
  window.switchSettingsTab = (tab) => {
    state.settingsTab = tab;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderSettings(); attachSettingsListeners(); }
  };

  window.handleUpdateApiKey = (service, displayName) => {
    const newKey = prompt(`Enter new ${displayName}:`);
    if (!newKey) return;
    if (window.DEMO_MODE) { showToast('Demo mode — connect Supabase to save API keys.'); return; }

    API.settings.saveKey(service, displayName, newKey)
      .then(() => {
        showToast(`✅ ${displayName} saved securely.`);
        // Refresh the row
        const rowEl = document.getElementById(`key-row-${service}`);
        if (rowEl) {
          const masked = newKey.slice(0,4) + '••••••••' + newKey.slice(-4);
          rowEl.querySelector('.api-key-display').textContent = masked;
        }
      })
      .catch(err => showToast('❌ ' + err.message, 'error'));
  };

  window.handleEditTeamRole = (memberId, currentRole) => {
    if (window.DEMO_MODE) { showToast('Demo mode — connect Supabase to manage team.'); return; }
    const newRole = prompt(`Change role (manager / support):`, currentRole);
    if (!newRole || !['manager','support'].includes(newRole)) { showToast('Role must be "manager" or "support"'); return; }
    API.settings.updateTeamMember(memberId, newRole)
      .then(() => { showToast('✅ Role updated.'); state.liveTeam = null; loadSettingsView(document.getElementById('page-content')); })
      .catch(err => showToast('❌ ' + err.message, 'error'));
  };

  window.handleInviteTeamMember = () => {
    if (window.DEMO_MODE) { showToast('Demo mode — connect Supabase to invite team members.'); return; }
    const email = prompt('Team member email address:');
    if (!email) return;
    const name  = prompt('Their name:') || '';
    const role  = prompt('Role (manager / support):', 'manager') || 'manager';
    API.invite(email, name, role)
      .then(() => { showToast(`✅ Invite sent to ${email}`); state.liveTeam = null; loadSettingsView(document.getElementById('page-content')); })
      .catch(err => showToast('❌ ' + err.message, 'error'));
  };
}
