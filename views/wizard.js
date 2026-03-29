// ============================================================
//  VOICEDESK — ONBOARDING WIZARD (4 Steps)
//  Step 4: Demo mode — shows success UI only
//          Live mode — POSTs to /api/clients, shows real result
// ============================================================

const WIZARD_PLANS = {
  managed: [
    { id:'starter-m',  name:'Starter',  price:110,  ppm:0.22, mins:500,   extra:0.24 },
    { id:'growth-m',   name:'Growth',   price:400,  ppm:0.20, mins:2000,  extra:0.22 },
    { id:'business-m', name:'Business', price:900,  ppm:0.18, mins:5000,  extra:0.20 },
    { id:'scale-m',    name:'Scale',    price:2400, ppm:0.16, mins:15000, extra:0.18 },
  ],
  'self-hosted': [
    { id:'starter-s',    name:'Starter',    price:90,   ppm:0.09, mins:1000,  extra:0.10 },
    { id:'growth-s',     name:'Growth',     price:400,  ppm:0.08, mins:5000,  extra:0.09 },
    { id:'business-s',   name:'Business',   price:1050, ppm:0.07, mins:15000, extra:0.08 },
    { id:'scale-s',      name:'Scale',      price:3000, ppm:0.06, mins:50000, extra:0.07 },
    { id:'enterprise-s', name:'Enterprise', price:null, ppm:null, mins:100000,extra:null },
  ],
};

const MATRIX_QUESTIONS = [
  { key:'speed',      label:'How quickly does this client need to go live?',
    opts:[{val:'managed',label:'Within this week',sub:'Fast — managed infrastructure ready in days'},
          {val:'self',   label:'Can wait 2–4 weeks',sub:'Self-hosted setup takes 14–25 days'}] },
  { key:'volume',     label:'What monthly call volume do you expect?',
    opts:[{val:'managed',label:'Under 10,000 min/mo',sub:'Managed pricing is competitive at this scale'},
          {val:'self',   label:'Over 10,000 min/mo',sub:'Self-hosted saves significantly at high volume'}] },
  { key:'compliance', label:'Does this client require SOC2 or HIPAA compliance?',
    opts:[{val:'managed',label:'Yes — compliance required',sub:'Managed layer is SOC2 Type I&II + HIPAA-ready built-in'},
          {val:'self',   label:'No special compliance',sub:'Self-hosted can be configured but not guaranteed'}] },
  { key:'ownership',  label:'Does the client want full infrastructure ownership?',
    opts:[{val:'managed',label:'No — managed is fine',sub:'Easy-to-use managed service, nothing to maintain'},
          {val:'self',   label:'Yes — they want to own it',sub:'Self-hosted gives full data and server ownership'}] },
  { key:'voice',      label:'How important is voice quality to this client?',
    opts:[{val:'managed',label:'Highest quality (ElevenLabs)',sub:'Premium natural voice — recommended for all client-facing deployments'},
          {val:'self',   label:'Very good quality is fine',sub:'Cartesia Sonic — low latency, optimised for calls'}] },
];

function renderWizard() {
  const step = state.wizardStep || 1;
  if (step === 4) return renderWizardSuccess();
  if (step === 'saving') return renderWizardSaving();

  const stepLabels = ['Client Info', 'Decision Matrix', 'Select Plan', 'Confirm'];

  return `
  <div class="wizard-wrap">
    <div class="wizard-steps">
      ${stepLabels.map((lbl, i) => {
        const n = i + 1;
        const isDone   = n < step;
        const isActive = n === step;
        return `
        <div class="wizard-step-item">
          <div class="wizard-step-circle ${isDone?'done':isActive?'active':''}">${isDone?'✓':n}</div>
          <div class="wizard-step-label ${isActive?'active':''}">${lbl}</div>
          ${i < stepLabels.length-1 ? `<div class="wizard-step-connector ${isDone?'done':''}"></div>` : ''}
        </div>`;
      }).join('')}
    </div>

    ${step === 1 ? renderWizardStep1() : ''}
    ${step === 2 ? renderWizardStep2() : ''}
    ${step === 3 ? renderWizardStep3() : ''}
  </div>`;
}

function renderWizardStep1() {
  const d = state.wizardData;
  return `
  <div class="wizard-card">
    <div class="wizard-card-title">Client Information</div>
    <div class="wizard-card-sub">Enter the basic details for your new client deployment.</div>
    <div class="wiz-two-col">
      <div class="wiz-input-group"><label class="wiz-label">Business Name *</label><input class="wiz-input" id="wiz-name" placeholder="e.g. Dr. Smith Dental" value="${d.name||''}" /></div>
      <div class="wiz-input-group"><label class="wiz-label">Contact Name *</label><input class="wiz-input" id="wiz-contact" placeholder="e.g. John Smith" value="${d.contact||''}" /></div>
    </div>
    <div class="wiz-two-col">
      <div class="wiz-input-group"><label class="wiz-label">Industry</label>
        <select class="wiz-select" id="wiz-industry">
          ${['Healthcare / Dental','Healthcare / Medical','Legal','Real Estate','Logistics / Delivery','HR / Staffing','Sales / Outbound','Finance','Education','Other'].map(x=>`<option ${(d.industry||'')==x?'selected':''}>${x}</option>`).join('')}
        </select>
      </div>
      <div class="wiz-input-group"><label class="wiz-label">Phone Number</label><input class="wiz-input" id="wiz-phone" placeholder="+1 (555) 000-0000" value="${d.phone||''}" /></div>
    </div>
    <div class="wiz-two-col">
      <div class="wiz-input-group"><label class="wiz-label">Email Address</label><input class="wiz-input" id="wiz-email" placeholder="client@company.com" value="${d.email||''}" /></div>
      <div class="wiz-input-group"><label class="wiz-label">Location</label><input class="wiz-input" id="wiz-location" placeholder="City, Country" value="${d.location||''}" /></div>
    </div>
    <div class="wiz-two-col">
      <div class="wiz-input-group"><label class="wiz-label">CRM System</label>
        <select class="wiz-select" id="wiz-crm">
          ${['HubSpot','GoHighLevel','Salesforce','None / Other'].map(x=>`<option ${(d.crm||'')==x?'selected':''}>${x}</option>`).join('')}
        </select>
      </div>
      <div class="wiz-input-group"><label class="wiz-label">Calendar System</label>
        <select class="wiz-select" id="wiz-calendar">
          ${['Google Calendar','Calendly','Outlook','Salesforce','None'].map(x=>`<option ${(d.calendar||'')==x?'selected':''}>${x}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>
  <div class="wizard-actions">
    <span></span>
    <button class="btn-wiz-next" id="wiz-next-1" onclick="wizardNext1()">Continue to Decision Matrix →</button>
  </div>`;
}

function renderWizardStep2() {
  const scores  = state.matrixScores || { managed: 0, selfhost: 0 };
  const answered= Object.keys(state.wizardData).filter(k => MATRIX_QUESTIONS.map(q=>q.key).includes(k)).length;
  const recommended = scores.managed >= scores.selfhost ? 'managed' : 'self-hosted';
  const showResult  = answered === MATRIX_QUESTIONS.length;

  return `
  <div class="wizard-card">
    <div class="wizard-card-title">Decision Matrix</div>
    <div class="wizard-card-sub">Answer 5 quick questions and we'll recommend the right infrastructure layer for this client.</div>
    ${MATRIX_QUESTIONS.map(q => {
      const chosen = state.wizardData[q.key];
      return `
      <div class="matrix-question">
        <div class="matrix-q-label">${MATRIX_QUESTIONS.indexOf(q)+1}. ${q.label}</div>
        <div class="matrix-options">
          ${q.opts.map(opt => {
            const isManaged = opt.val === 'managed';
            const selClass = chosen === opt.val ? (isManaged ? 'selected-managed' : 'selected-selfhost') : '';
            return `<div class="matrix-opt ${selClass}" onclick="wizMatrixPick('${q.key}','${opt.val}')">
              <div class="matrix-opt-label">${opt.label}</div>
              <div class="matrix-opt-sub">${opt.sub}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}

    ${showResult ? `
    <div class="matrix-result ${recommended === 'managed' ? 'managed' : 'selfhost'}">
      <div class="matrix-result-icon">${recommended === 'managed' ? '⚡' : '🖥️'}</div>
      <div>
        <div class="matrix-result-title">Recommendation: ${recommended === 'managed' ? 'Managed Layer (Retell AI)' : 'Self-Hosted Layer'}</div>
        <div class="matrix-result-sub">${recommended === 'managed'
          ? 'Fast deployment, built-in SOC2/HIPAA, ElevenLabs voice quality. Best for this client based on your answers.'
          : 'Lowest cost per minute, scales to any volume, full data ownership. Ideal for this client\'s profile.'}</div>
      </div>
    </div>` : `<div style="background:var(--bg-surface3);border-radius:var(--radius-sm);padding:12px 16px;font-size:13px;color:var(--text-muted)">
      Answer all ${MATRIX_QUESTIONS.length} questions to see your recommendation (${answered}/${MATRIX_QUESTIONS.length} answered).
    </div>`}
  </div>
  <div class="wizard-actions">
    <button class="btn-wiz-back" onclick="wizardBack()">← Back</button>
    <button class="btn-wiz-next" ${!showResult?'disabled':''} onclick="wizardNext2()">Select a Plan →</button>
  </div>`;
}

function renderWizardStep3() {
  const scores     = state.matrixScores || { managed: 0, selfhost: 0 };
  const recommended= scores.managed >= scores.selfhost ? 'managed' : 'self-hosted';
  const plans      = WIZARD_PLANS[recommended];
  const selected   = state.selectedPlan;
  const selPlan    = plans.find(p => p.id === selected);
  const costMid    = recommended === 'managed' ? 0.15 : 0.047;

  return `
  <div class="wizard-card">
    <div class="wizard-card-title">Select a Plan</div>
    <div class="wizard-card-sub">
      Showing <strong style="color:${recommended==='managed'?'var(--amber)':'var(--cyan)'}">${recommended === 'managed' ? 'Managed Layer' : 'Self-Hosted Layer'}</strong> plans based on the decision matrix.
      <a onclick="wizardSwitchLayer()" style="color:var(--accent-light);cursor:pointer;margin-left:6px;font-size:12px">Switch layer ↗</a>
    </div>
    <div class="plan-grid">
      ${plans.map(p => `
        <div class="plan-card ${selected===p.id?'selected':''}" onclick="wizSelectPlan('${p.id}')">
          <div class="plan-name">${p.name}</div>
          <div class="plan-price">${p.price ? fmtMoney(p.price) : 'Custom'}<span>${p.price ? '/month' : ''}</span></div>
          <div class="plan-minutes">${fmtNum(p.mins)} min included</div>
          ${p.ppm  ? `<div class="plan-feature">✓ ${fmtMoney(p.ppm,2)}/min</div>` : ''}
          ${p.extra? `<div class="plan-feature">✓ Extra: ${fmtMoney(p.extra,2)}/min</div>` : ''}
          <div class="plan-feature" style="color:var(--green)">✓ ${recommended==='managed'?'SOC2 + HIPAA ready':'Unlimited clients'}</div>
        </div>`).join('')}
    </div>

    ${selPlan && selPlan.price ? `
    <div class="pricing-preview">
      <div class="pricing-preview-title">Your Pricing Preview</div>
      ${pricingRow('Client pays you',   fmtMoney(selPlan.price) + '/mo')}
      ${pricingRow('Your cost (est.)',   fmtMoney(Math.round(selPlan.mins * costMid)) + '/mo')}
      ${pricingRow('Your gross profit', fmtMoney(selPlan.price - Math.round(selPlan.mins * costMid)) + '/mo', true)}
      ${pricingRow('Margin',            calcMargin(costMid, selPlan.ppm) + '%', true)}
    </div>` : ''}
  </div>
  <div class="wizard-actions">
    <button class="btn-wiz-back" onclick="wizardBack()">← Back</button>
    <button class="btn-wiz-next" ${!selected?'disabled':''} onclick="wizardNext3()">Confirm & Launch ✓</button>
  </div>`;
}

function pricingRow(label, val, green=false) {
  return `<div class="pricing-row"><span class="label">${label}</span><span class="val${green?' green':''}">${val}</span></div>`;
}

function renderWizardSaving() {
  return `
  <div class="wizard-wrap">
    <div class="wizard-card" style="text-align:center;padding:48px">
      <div style="font-size:40px;margin-bottom:16px">⏳</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">Saving client…</div>
      <div style="color:var(--text-muted);font-size:13px">Creating your new client deployment.</div>
    </div>
  </div>`;
}

function renderWizardSuccess() {
  const d    = state.wizardData;
  const isDemo = window.DEMO_MODE;

  return `
  <div class="wizard-wrap">
    <div class="wizard-card">
      <div class="wizard-success">
        <div class="wizard-success-icon">🎉</div>
        <div class="wizard-success-title">Client ${isDemo ? 'Ready!' : 'Successfully Added!'}</div>
        <div class="wizard-success-sub">
          <strong>${d.name || 'New Client'}</strong> has been onboarded to the platform.
          ${isDemo ? '<br><span style="color:var(--amber);font-size:12px">Demo mode — connect Supabase to save clients for real.</span>' : 'The AI agent is now being configured and will be live within the expected timeframe.'}
        </div>
        <div style="background:var(--bg-surface3);border-radius:var(--radius-md);padding:16px 20px;text-align:left;margin-bottom:24px">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">What happens next</div>
          ${['Onboarding call scheduled within 24 hours','Agent training begins — you\'ll provide scripts and FAQs','CRM & calendar connections built and tested','Quality review on a live number','Go-live — AI handles real calls'].map((s,i)=>`
            <div style="display:flex;gap:10px;margin-bottom:8px;font-size:13px;color:var(--text-secondary)">
              <span style="color:var(--accent-light);font-weight:700;flex-shrink:0">${i+1}.</span>${s}
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" onclick="resetWizard()">Add Another Client</button>
          <button class="btn-secondary" onclick="navigate('clients')">Back to Clients</button>
        </div>
      </div>
    </div>
  </div>`;
}

function attachWizardListeners() {
  window.wizardNext1 = () => {
    const d = state.wizardData;
    d.name     = document.getElementById('wiz-name')?.value || '';
    d.contact  = document.getElementById('wiz-contact')?.value || '';
    d.industry = document.getElementById('wiz-industry')?.value || '';
    d.phone    = document.getElementById('wiz-phone')?.value || '';
    d.email    = document.getElementById('wiz-email')?.value || '';
    d.location = document.getElementById('wiz-location')?.value || '';
    d.crm      = document.getElementById('wiz-crm')?.value || '';
    d.calendar = document.getElementById('wiz-calendar')?.value || '';
    if (!d.name || !d.contact) { alert('Please fill in Business Name and Contact Name.'); return; }
    state.wizardStep = 2;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizardBack = () => {
    state.wizardStep = Math.max(1, (state.wizardStep||1) - 1);
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizMatrixPick = (key, val) => {
    state.wizardData[key] = val;
    const scores = { managed: 0, selfhost: 0 };
    MATRIX_QUESTIONS.forEach(q => {
      if (state.wizardData[q.key] === 'managed') scores.managed++;
      else if (state.wizardData[q.key] === 'self') scores.selfhost++;
    });
    state.matrixScores = scores;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizardNext2 = () => {
    state.wizardStep = 3;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizSelectPlan = (id) => {
    state.selectedPlan = id;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizardSwitchLayer = () => {
    const scores = state.matrixScores;
    if (scores.managed >= scores.selfhost) { scores.managed = 0; scores.selfhost = 5; }
    else { scores.managed = 5; scores.selfhost = 0; }
    state.selectedPlan = null;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };

  window.wizardNext3 = async () => {
    const scores      = state.matrixScores || { managed: 0, selfhost: 0 };
    const layer       = scores.managed >= scores.selfhost ? 'managed' : 'self-hosted';
    const allPlans    = [...WIZARD_PLANS.managed, ...WIZARD_PLANS['self-hosted']];
    const plan        = allPlans.find(p => p.id === state.selectedPlan);
    const d           = state.wizardData;

    // ── Demo mode: skip API, show success ────────────────────
    if (window.DEMO_MODE) {
      state.wizardStep = 4;
      const c = document.getElementById('page-content');
      if (c) { c.innerHTML = renderWizard(); }
      return;
    }

    // ── Live mode: POST to backend ────────────────────────────
    const contEl = document.getElementById('page-content');
    if (contEl) { contEl.innerHTML = renderWizardSaving(); }

    const payload = {
      name:              d.name,
      contact_name:      d.contact,
      contact_email:     d.email,
      contact_title:     '',
      industry:          d.industry,
      phone_number:      d.phone,
      location:          d.location,
      layer,
      plan:              plan?.name || 'Growth',
      price_per_min:     plan?.ppm  || 0.18,
      extra_price_per_min: plan?.extra || 0.20,
      minutes_included:  plan?.mins || 2000,
      crm_system:        d.crm,
      calendar_system:   d.calendar,
      voice_model:       layer === 'managed' ? 'ElevenLabs Premium' : 'Cartesia Sonic',
      ai_model:          'GPT-4o',
      languages:         ['English'],
      compliance:        [],
    };

    try {
      // 1. Save client to database
      const result = await API.clients.create(payload);
      const clientId = result?.data?.id;
      state.liveClients = null;

      // 2. Auto-create Retell agent for managed (Cloud) clients
      if (layer === 'managed' && clientId && !window.DEMO_MODE) {
        try {
          const agentName    = `${d.name || 'Client'} — AI Voice Agent`;
          const systemPrompt = `You are an AI voice assistant for ${d.name || 'this business'}.
${d.industry ? `Industry: ${d.industry}` : ''}
Be helpful, professional, and concise. Keep responses to 1-3 sentences — this is a voice call.
Handle inquiries, capture lead information, and schedule appointments when requested.
If you cannot resolve something, let the caller know a human will follow up soon.`;

          await apiFetch('/api/retell/agents', {
            method: 'POST',
            body: JSON.stringify({
              client_id:    clientId,
              agent_name:   agentName,
              voice_id:     'elevenlabs-rachel', // Default — can be changed in settings
              system_prompt: systemPrompt,
              begin_message: `Thank you for calling ${d.name || 'us'}! I'm your AI assistant. How can I help you today?`,
            }),
          });
          showToast('✅ Voice agent created and linked!', 'success');
        } catch (agentErr) {
          // Non-fatal — client is saved, agent creation failed
          console.warn('[Wizard] Agent creation failed:', agentErr.message);
          showToast('⚠️ Client saved. Set up voice agent in client settings.', 'warning');
        }
      }

      state.wizardStep = 4;
      if (contEl) { contEl.innerHTML = renderWizard(); }
    } catch (err) {
      if (contEl) {
        contEl.innerHTML = renderWizard();
        attachWizardListeners();
      }
      showToast('❌ Failed to save client: ' + err.message, 'error');
    }
  };

  window.resetWizard = () => {
    state.wizardStep    = 1;
    state.wizardData    = {};
    state.matrixScores  = { managed: 0, selfhost: 0 };
    state.selectedPlan  = null;
    const c = document.getElementById('page-content');
    if (c) { c.innerHTML = renderWizard(); attachWizardListeners(); }
  };
}
