// ============================================================
//  VOICEDESK — QUOTE BUILDER  (Friendly Pricing Calculator)
// ============================================================

const CALC_CONFIG = {
  managed: {
    standard:    { costMin:0.10,  costMax:0.11, sellMin:0.18, sellMax:0.20, label:'Standard Quality',    desc:'Good voice quality, perfect for FAQ and bookings' },
    recommended: { costMin:0.13,  costMax:0.17, sellMin:0.22, sellMax:0.25, label:'Recommended Quality', desc:'Premium voice, handles complex conversations' },
    premium:     { costMin:0.19,  costMax:0.22, sellMin:0.24, sellMax:0.28, label:'Top-Tier Quality',    desc:'The absolute best — ideal for healthcare and legal' },
  },
  'self-hosted': {
    budget:      { costMin:0.027, costMax:0.040, sellMin:0.07, sellMax:0.09, label:'Budget Quality',      desc:'Great value for simple, high-volume scripts' },
    recommended: { costMin:0.038, costMax:0.055, sellMin:0.09, sellMax:0.12, label:'Recommended Quality', desc:'Excellent for most businesses at any scale' },
  },
};

function renderCalculator() {
  const layer   = state.calcLayer || 'managed';
  const quality = state.calcQuality || 'recommended';
  const minutes = state.calcMinutes || 5000;
  const cfg     = CALC_CONFIG[layer][quality] || CALC_CONFIG[layer]['recommended'];
  const costMid = (cfg.costMin + cfg.costMax) / 2;
  const sellMid = (cfg.sellMin + cfg.sellMax) / 2;
  const margin  = Math.round((1 - costMid / sellMid) * 100);
  const monthlyCost    = Math.round(minutes * costMid);
  const monthlyRevenue = Math.round(minutes * sellMid);
  const monthlyProfit  = monthlyRevenue - monthlyCost;

  const qualities = Object.entries(CALC_CONFIG[layer]);

  return `
  <!-- Intro -->
  <div style="background:linear-gradient(135deg,rgba(124,106,255,0.12),rgba(34,211,238,0.08));border:1px solid var(--border-accent);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px">
    <div style="font-size:36px">💰</div>
    <div>
      <div style="font-weight:700;font-size:16px;margin-bottom:4px">How much should I charge a new client?</div>
      <div style="font-size:13.5px;color:var(--text-secondary);line-height:1.6">Pick your plan type and expected call volume — we'll show you exactly what to charge, what you'll pay, and what you'll keep.</div>
    </div>
  </div>

  <div class="calc-layout">
    <div>
      <!-- Plan Type -->
      <div class="card card-body" style="margin-bottom:18px">
        <div class="calc-section-title">Step 1 — Choose the Plan Type for this Client</div>
        <div class="layer-toggle">
          <div class="layer-toggle-btn ${layer==='managed'?'active-managed':''}" onclick="calcSetLayer('managed')">
            ⚡ Cloud Managed
          </div>
          <div class="layer-toggle-btn ${layer==='self-hosted'?'active-selfhost':''}" onclick="calcSetLayer('self-hosted')">
            🖥️ Direct Deploy
          </div>
        </div>
        <div style="margin-top:12px;padding:12px 14px;background:var(--bg-surface3);border-radius:var(--radius-sm);font-size:12.5px;color:var(--text-secondary);line-height:1.7">
          ${layer==='managed'
            ? `<strong style="color:var(--amber)">⚡ Cloud Managed</strong> — We handle everything. Client goes live in days. Best for clients who need speed, compliance (healthcare, legal), or highest voice quality.`
            : `<strong style="color:var(--cyan)">🖥️ Direct Deploy</strong> — Runs on dedicated servers. Takes 2–4 weeks to set up. Best for high-volume clients who want the lowest cost per minute.`}
        </div>
      </div>

      <!-- Voice Quality -->
      <div class="card card-body" style="margin-bottom:18px">
        <div class="calc-section-title">Step 2 — Choose Voice & AI Quality</div>
        <div class="quality-options">
          ${qualities.map(([key, q]) => `
            <div class="quality-opt ${quality===key?'selected':''}" onclick="calcSetQuality('${key}')">
              <div class="quality-opt-info">
                <div class="quality-opt-name">${q.label}</div>
                <div class="quality-opt-desc">${q.desc}</div>
              </div>
              <div class="quality-opt-cost">${fmtMoney(q.costMin,3)}–${fmtMoney(q.costMax,3)}/min (your cost)</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Minutes Slider -->
      <div class="card card-body">
        <div class="calc-section-title">Step 3 — How Many Minutes Will They Use Per Month?</div>
        <div style="background:var(--bg-surface3);border-radius:var(--radius-sm);padding:12px 14px;font-size:12.5px;color:var(--text-muted);margin-bottom:16px;line-height:1.6">
          💡 <strong style="color:var(--text-secondary)">Not sure?</strong> A small business (dental clinic, estate agent, law firm) typically uses 1,000–5,000 minutes. A larger sales team or call centre uses 15,000–50,000+.
        </div>
        <div class="slider-wrap">
          <div class="slider-label">
            <span class="slider-label-text">Minutes per month</span>
            <span class="slider-label-val">${fmtNum(minutes)} min</span>
          </div>
          <input type="range" min="500" max="100000" step="500" value="${minutes}" oninput="calcSetMinutes(this.value)" style="width:100%;margin-bottom:10px" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)"><span>500</span><span>25k</span><span>50k</span><span>100k</span></div>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          ${[[500,'Small'],[2000,'Growing'],[5000,'Busy'],[15000,'High Vol.'],[50000,'Enterprise']].map(([m,lbl]) => `
            <button onclick="calcSetMinutes(${m})"
              style="padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--border);
                background:${minutes===m?'var(--accent-glow)':'var(--bg-surface3)'};
                color:${minutes===m?'var(--accent-light)':'var(--text-muted)'};cursor:pointer;transition:all 0.2s">
              ${lbl} · ${fmtNum(m)}
            </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Results Panel -->
    <div class="calc-result-card">
      <div style="text-align:center;padding:16px 0 20px;border-bottom:1px solid var(--border);margin-bottom:20px">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">You should charge this client</div>
        <div style="font-size:38px;font-weight:800;letter-spacing:-1.5px;color:var(--cyan)">${fmtMoney(monthlyRevenue)}</div>
        <div style="font-size:13px;color:var(--text-muted)">per month (${fmtMoney(sellMid,2)}/min)</div>
      </div>

      <div class="calc-metric">
        <div class="calc-metric-label">YOU PAY (infrastructure cost)</div>
        <div class="calc-metric-value cost">${fmtMoney(monthlyCost)}/mo</div>
        <div class="calc-metric-sub">${fmtMoney(costMid,3)} per minute · goes to the AI service</div>
      </div>

      <div class="calc-metric">
        <div class="calc-metric-label">YOUR GROSS PROFIT</div>
        <div class="calc-metric-value profit">${fmtMoney(monthlyProfit)}/mo</div>
        <div class="calc-metric-sub">What you keep after costs — before any of your own overheads</div>
      </div>

      <div class="calc-metric">
        <div class="calc-metric-label">YOUR PROFIT MARGIN</div>
        <div class="calc-metric-value margin">${margin}%</div>
        <div class="margin-bar-wrap">
          <div class="margin-bar" style="width:${margin}%;background:${margin>45?'var(--green)':margin>30?'var(--amber)':'var(--red)'}"></div>
        </div>
        <div class="calc-metric-sub" style="margin-top:6px">You keep ${margin} cents of every $1 you charge</div>
      </div>

      <div style="background:var(--bg-surface3);border-radius:var(--radius-sm);padding:14px;margin:16px 0;font-size:12.5px;color:var(--text-muted);line-height:1.7">
        ⚠️ Always quote using the <strong style="color:var(--text-secondary)">higher end of costs</strong> — not the lower. If your actual costs come in lower, that's extra profit for you.
      </div>

      <button class="btn-primary" style="width:100%;justify-content:center" onclick="navigate('wizard')">
        + Onboard a client at this price
      </button>
    </div>
  </div>`;
}

function attachCalcListeners() {
  window.calcSetLayer   = (layer) => { state.calcLayer = layer; state.calcQuality = 'recommended'; refreshCalc(); };
  window.calcSetQuality = (q)     => { state.calcQuality = q; refreshCalc(); };
  window.calcSetMinutes = (m)     => { state.calcMinutes = parseInt(m); refreshCalc(); };
}

function refreshCalc() {
  const c = document.getElementById('page-content');
  if (c) { c.innerHTML = renderCalculator(); attachCalcListeners(); }
}
