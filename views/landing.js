// ============================================================
//  EMPOWER AI 365 — Landing Page
//  Production design — Retell / VAPI / AntiGravity inspired
// ============================================================

function renderLanding() {
  return `
  <div class="lp" id="landing-page">

    <!-- Background layers -->
    <div class="lp-bg">
      <div class="lp-bg-glow lp-bg-glow-1"></div>
      <div class="lp-bg-glow lp-bg-glow-2"></div>
      <div class="lp-bg-glow lp-bg-glow-3"></div>
      <div class="lp-bg-grid"></div>
    </div>

    <!-- Nav -->
    <nav class="lp-nav" id="lp-nav">
      <div class="lp-nav-inner">
        <div class="lp-nav-logo">
          <div class="lp-nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            </svg>
          </div>
          <span>Empower AI 365</span>
        </div>
        <div class="lp-nav-links">
          <a href="#" class="lp-nav-link" onclick="smoothScrollTo('lp-features')">Product</a>
          <a href="#" class="lp-nav-link" onclick="smoothScrollTo('lp-features')">Use Cases</a>
          <a href="#" class="lp-nav-link" onclick="smoothScrollTo('lp-stats')">Pricing</a>
        </div>
        <div class="lp-nav-actions">
          <button class="lp-nav-ghost" onclick="showLoginModal()">Sign in</button>
          <button class="lp-nav-cta" onclick="showGetAgentModal()">Get Started</button>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="lp-hero">
      <div class="lp-hero-inner">

        <div class="lp-tag">
          <span class="lp-tag-dot"></span>
          Live AI Voice · Powered by Empower
        </div>

        <h1 class="lp-h1">
          The Voice Agent<br>
          <span class="lp-h1-em">Your Business Needs</span>
        </h1>

        <p class="lp-sub">
          Handle every call. Capture every lead. Book every appointment.<br>
          Your AI voice agent works 24/7 — no hold times, no missed calls.
        </p>

        <!-- Central Orb -->
        <div class="lp-orb-wrap" id="lp-orb-wrap">
          <div class="lp-orb-glow"></div>
          <button class="lp-orb" id="vd-orb" onclick="startVoiceDemo()" aria-label="Talk to Empower Voice Agent">
            <div class="lp-orb-ring lp-orb-ring-1"></div>
            <div class="lp-orb-ring lp-orb-ring-2"></div>
            <div class="lp-orb-ring lp-orb-ring-3"></div>
            <div class="lp-orb-core">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
            </div>
          </button>
          <div class="lp-orb-hint">
            <span class="lp-orb-hint-dot"></span>
            Talk to Empower — Live Demo
          </div>
        </div>

        <!-- CTAs -->
        <div class="lp-ctas">
          <button class="lp-btn-primary" onclick="showGetAgentModal()">
            Get Your Voice Agent
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button class="lp-btn-ghost" onclick="showLoginModal()">
            Open Dashboard
          </button>
        </div>

        <!-- Stats strip -->
        <div class="lp-stats" id="lp-stats">
          <div class="lp-stat"><div class="lp-stat-val">24/7</div><div class="lp-stat-key">Always Active</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-val">&lt;500ms</div><div class="lp-stat-key">Response Time</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-val">99.9%</div><div class="lp-stat-key">Uptime SLA</div></div>
          <div class="lp-stat-div"></div>
          <div class="lp-stat"><div class="lp-stat-val">$0.05/min</div><div class="lp-stat-key">Starting From</div></div>
        </div>

      </div>
    </section>

    <!-- Features -->
    <section class="lp-features" id="lp-features">
      <div class="lp-features-inner">
        <div class="lp-section-tag">Capabilities</div>
        <h2 class="lp-section-h2">Built for real business results</h2>
        <p class="lp-section-sub">Everything you need to automate customer communication and grow without adding headcount.</p>

        <div class="lp-feat-grid">
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Always Available</h3>
            <p>Never miss a call. Your voice agent answers instantly, day or night — no hold times, no voicemail.</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Natural Conversations</h3>
            <p>Powered by the latest AI voice models. Natural pacing, intelligent responses — callers often can't tell the difference.</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Automatic Lead Capture</h3>
            <p>Every call is logged, summarized, and analyzed. Leads flagged instantly. Your CRM updated automatically.</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>Appointment Booking</h3>
            <p>Integrates with your calendar. Books, reschedules, and confirms appointments automatically during the call.</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Live in Days</h3>
            <p>Cloud-managed setup in 3–7 business days. No hardware, no IT team, no long-term contracts.</p>
          </div>
          <div class="lp-feat-card">
            <div class="lp-feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3>Full Analytics</h3>
            <p>Real-time dashboard showing call volume, conversion rates, sentiment, and ROI. Know exactly what's working.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="lp-cta-banner">
      <div class="lp-cta-banner-inner">
        <h2 class="lp-cta-banner-h2">Ready to automate your calls?</h2>
        <p class="lp-cta-banner-sub">Talk to Empower above, or get your own agent live in under a week.</p>
        <button class="lp-btn-primary" style="margin:0 auto" onclick="showGetAgentModal()">
          Get Started — No contracts
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="lp-footer">
      <div class="lp-footer-inner">
        <div class="lp-footer-brand">
          <div class="lp-nav-logo-icon" style="width:28px;height:28px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            </svg>
          </div>
          <span>Empower AI 365</span>
        </div>
        <div class="lp-footer-copy">© 2026 Empower AI 365. All rights reserved.</div>
        <div class="lp-footer-tag">Powered by Empower Voice Agent</div>
      </div>
    </footer>

    <!-- ── Login Modal ───────────────────────────── -->
    <div class="modal-overlay" id="login-modal" style="display:none" onclick="closeLoginModal(event)">
      <div class="lp-modal" onclick="event.stopPropagation()">
        <button class="lp-modal-close" onclick="closeLoginModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="lp-modal-brand">
          <div class="lp-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            </svg>
          </div>
          <div>
            <div class="lp-modal-brand-name">Empower AI 365</div>
            <div class="lp-modal-brand-sub">Secure Sign In</div>
          </div>
        </div>
        <h2 class="lp-modal-title">Welcome back</h2>
        <p class="lp-modal-sub">Enter your credentials to access the dashboard</p>
        <form id="landing-login-form">
          <div class="lp-field">
            <label>Email Address</label>
            <input type="email" id="ll-email" placeholder="you@company.com" autocomplete="email" />
          </div>
          <div class="lp-field">
            <label>Password</label>
            <input type="password" id="ll-pass" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="lp-hint" id="ll-hint" style="display:none"></div>
          <button type="submit" class="lp-submit-btn" id="ll-btn">
            Sign In
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>
        <div class="lp-modal-footer">🔒 Your session is encrypted and secure</div>
      </div>
    </div>

    <!-- ── Voice Demo Modal ──────────────────────── -->
    <div class="modal-overlay" id="voice-modal" style="display:none" onclick="closeVoiceModal(event)">
      <div class="lp-modal voice-modal" onclick="event.stopPropagation()">
        <button class="vm-close-btn" onclick="forceCloseVoiceModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="vm-brand-tag">
          <span class="vm-brand-pulse"></span>
          Powered by Empower Voice Agent
        </div>
        <div class="vm-orb" id="vm-orb">
          <div class="vm-ring vm-ring-1"></div>
          <div class="vm-ring vm-ring-2"></div>
          <div class="vm-ring vm-ring-3"></div>
          <div class="vm-ring vm-ring-4"></div>
          <div class="vm-core">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="30" height="30">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </div>
        </div>
        <h3 class="vm-title" id="vm-title">Empower AI</h3>
        <p class="vm-sub" id="vm-sub">Initializing voice session…</p>
        <div class="vm-waveform" id="vm-waveform">
          ${Array.from({length:32},(_,i)=>`<div class="wf-bar" style="animation-delay:${(i*0.05).toFixed(2)}s;height:${6+Math.sin(i*0.5)*16}px"></div>`).join('')}
        </div>
        <div class="vm-status" id="vm-status">
          <span class="vm-status-dot"></span>
          <span id="vm-status-text">Connecting to Empower Voice Agent…</span>
        </div>
        <button class="vm-end-btn" id="vm-end-btn" onclick="forceCloseVoiceModal()" style="display:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.98.37 2.05.6 3.14.6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2C8.95 22 2 15.05 2 6.5a2 2 0 0 1 2-2H7a2 2 0 0 1 2 2c0 1.1.23 2.16.6 3.14a2 2 0 0 1-.45 2.11L8.68 12.9"/></svg>
          End Call
        </button>
      </div>
    </div>

    <!-- ── Get Agent Modal ───────────────────────── -->
    <div class="modal-overlay" id="get-agent-modal" style="display:none" onclick="closeGetAgentModal(event)">
      <div class="lp-modal" onclick="event.stopPropagation()">
        <button class="lp-modal-close" onclick="closeGetAgentModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 class="lp-modal-title">Get a Voice Agent</h2>
        <p class="lp-modal-sub">Tell us about your business and we'll reach out within 24 hours</p>
        <form id="get-agent-form" onsubmit="handleGetAgentSubmit(event)">
          <div class="lp-field">
            <label>Business Name</label>
            <input type="text" id="ga-biz" placeholder="Your Business Name" />
          </div>
          <div class="lp-field">
            <label>Your Email</label>
            <input type="email" id="ga-email" placeholder="you@company.com" />
          </div>
          <div class="lp-field">
            <label>Monthly Call Volume</label>
            <select id="ga-calls">
              <option value="500">Under 500 calls/month</option>
              <option value="2000" selected>500 – 2,000 calls/month</option>
              <option value="10000">2,000 – 10,000 calls/month</option>
              <option value="50000">10,000+ calls/month</option>
            </select>
          </div>
          <div class="lp-field">
            <label>What do you need the agent for?</label>
            <select id="ga-use">
              <option>Answer inbound calls / FAQs</option>
              <option>Lead qualification</option>
              <option>Appointment scheduling</option>
              <option>Customer support</option>
              <option>Outbound follow-ups</option>
            </select>
          </div>
          <div id="ga-success" style="display:none" class="ga-success">
            ✅ Request submitted! We'll be in touch within 24 hours.
          </div>
          <button type="submit" class="lp-submit-btn" id="ga-btn">Request a Demo →</button>
        </form>
        <div class="lp-modal-footer">No credit card required · Setup in days, not months</div>
      </div>
    </div>

  </div>`;
}

// ── Landing init — nav scroll shadow, scroll reveals ─────────
function initLandingCanvas() {
  const nav = document.getElementById('lp-nav');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('lp-nav-scrolled');
    else nav.classList.remove('lp-nav-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-reveal for feature cards
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-revealed'); observer.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.lp-feat-card, .lp-cta-banner-inner, .lp-stats').forEach(el => {
    el.classList.add('lp-reveal');
    observer.observe(el);
  });

  return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
}

// ── Modal Controls ───────────────────────────────────────────
function showLoginModal() {
  const m = document.getElementById('login-modal');
  if (!m) return;
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('modal-visible'));
  setTimeout(() => document.getElementById('ll-email')?.focus(), 100);
  attachLandingLoginListeners();
}

function closeLoginModal(e) {
  if (e && e.target !== document.getElementById('login-modal')) return;
  const m = document.getElementById('login-modal');
  if (!m) return;
  m.classList.remove('modal-visible');
  setTimeout(() => { m.style.display = 'none'; }, 250);
}

function closeLoginModalForce() {
  const m = document.getElementById('login-modal');
  if (!m) return;
  m.classList.remove('modal-visible');
  setTimeout(() => { m.style.display = 'none'; }, 250);
}

// Retell Web Client instance (shared)
let _retellClient = null;
let _callActive   = false;

async function startVoiceDemo() {
  // Guard: prevent opening multiple instances
  const m = document.getElementById('voice-modal');
  if (!m) return;
  if (m.style.display === 'flex') return;
  if (_callActive) return;
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('modal-visible'));

  const title  = document.getElementById('vm-title');
  const sub    = document.getElementById('vm-sub');
  const status = document.getElementById('vm-status');
  const orb    = document.getElementById('vm-orb');
  const wf     = document.querySelector('.vm-waveform');
  if (orb) orb.classList.add('vm-orb-active');

  function setStatus(t, s) {
    if (title)  title.textContent = t;
    if (sub)    sub.textContent   = s;
  }

  // ── Load Retell SDK on demand via esm.sh (handles all deps) ─
  if (!window._RetellWebClient) {
    setStatus('Loading voice engine…', 'One moment');
    try {
      const mod = await import('https://esm.sh/retell-client-js-sdk');
      window._RetellWebClient = mod.RetellWebClient;
    } catch (e) {
      setStatus('SDK Failed to Load', 'Please refresh and try again.');
      if (status) status.innerHTML = '<span class="vm-status-dot" style="background:var(--red)"></span> Failed to load voice engine';
      return;
    }
  }
  const RetellSDK = window._RetellWebClient;

  // ── Get web call access token from our backend ───────────
  setStatus('Connecting to Empower…', 'Starting your voice session');
  try {
    const _base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3001' : '';
    const res = await fetch(`${_base}/api/retell/web-call`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ metadata: { source: 'landing_demo' } }),
    });
    const data = await res.json();

    if (!res.ok || !data.access_token) {
      const msg = data.error || 'Could not start call.';
      setStatus('Connection Failed', msg);
      if (status) status.innerHTML = `<span class="vm-status-dot" style="background:var(--red)"></span> ${msg}`;
      return;
    }

    // ── Start Retell Web Call ───────────────────────────────
    setStatus('Initializing voice model…', 'Loading Empower Voice Agent');
    _retellClient = new RetellSDK();

    _retellClient.on('call_started',  () => {
      _callActive = true;
      setStatus('Empower', 'Live — speak now');
      if (wf) wf.classList.add('wf-active');
      if (status) status.innerHTML = '<span class="vm-status-dot" style="background:#22c55e;animation:pulse 1s infinite"></span><span>Live · Powered by Empower Voice Agent</span>';
      const endBtn = document.getElementById('vm-end-btn');
      if (endBtn) endBtn.style.display = 'flex';
    });

    _retellClient.on('call_ended', () => {
      _callActive = false;
      setStatus('Call Ended', 'Thanks for trying Empower AI 365!');
      if (orb) orb.classList.remove('vm-orb-active');
      if (wf) wf.classList.remove('wf-active');
      const endBtn = document.getElementById('vm-end-btn');
      if (endBtn) endBtn.style.display = 'none';
    });

    _retellClient.on('error', (err) => {
      console.error('[Retell SDK]', err);
      setStatus('Connection Error', err?.message || 'Something went wrong.');
    });

    await _retellClient.startCall({ accessToken: data.access_token });

  } catch (err) {
    console.error('[Voice Demo]', err);
    setStatus('Unable to Connect', err.message || 'Check that the backend is running.');
    if (status) status.innerHTML = `<span class="vm-status-dot" style="background:var(--red)"></span> Backend not reachable`;
  }
}

function _doCloseVoiceModal() {
  if (_retellClient && _callActive) {
    try { _retellClient.stopCall(); } catch(_) {}
  }
  _callActive = false;
  _retellClient = null;
  const m = document.getElementById('voice-modal');
  if (!m) return;
  m.classList.remove('modal-visible');
  document.getElementById('vm-orb')?.classList.remove('vm-orb-active');
  document.getElementById('vm-waveform')?.classList.remove('wf-active');
  const endBtn = document.getElementById('vm-end-btn');
  if (endBtn) endBtn.style.display = 'none';
  const title = document.getElementById('vm-title');
  const sub   = document.getElementById('vm-sub');
  if (title) title.textContent = 'Empower AI';
  if (sub)   sub.textContent   = 'Initializing voice session…';
  if (document.getElementById('vm-status'))
    document.getElementById('vm-status').innerHTML = '<span class="vm-status-dot"></span><span>Connecting to Empower Voice Agent…</span>';
  setTimeout(() => { m.style.display = 'none'; }, 300);
}

// Called from backdrop click — only close if clicking the backdrop itself
function closeVoiceModal(e) {
  if (e && e.target !== document.getElementById('voice-modal')) return;
  _doCloseVoiceModal();
}

// Called from X button and End Call — always closes
function forceCloseVoiceModal() {
  _doCloseVoiceModal();
}

function showGetAgentModal() {
  const m = document.getElementById('get-agent-modal');
  if (!m) return;
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('modal-visible'));
}

function closeGetAgentModal(e) {
  if (e && e.target !== document.getElementById('get-agent-modal')) return;
  const m = document.getElementById('get-agent-modal');
  if (!m) return;
  m.classList.remove('modal-visible');
  setTimeout(() => { m.style.display = 'none'; }, 250);
}

function handleGetAgentSubmit(e) {
  e.preventDefault();
  const biz   = document.getElementById('ga-biz')?.value?.trim();
  const email = document.getElementById('ga-email')?.value?.trim();
  if (!biz || !email) { return; }
  const btn = document.getElementById('ga-btn');
  if (btn) { btn.textContent = 'Submitting…'; btn.disabled = true; }
  // In Phase 2 this can post to a real CRM or Supabase
  setTimeout(() => {
    document.getElementById('ga-success').style.display = 'block';
    if (btn) { btn.style.display = 'none'; }
  }, 800);
}

function smoothScrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── Landing Login Handler ────────────────────────────────────
function attachLandingLoginListeners() {
  const form = document.getElementById('landing-login-form');
  if (!form || form._bound) return;
  form._bound = true;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('ll-btn');
    const hint  = document.getElementById('ll-hint');
    const email = document.getElementById('ll-email').value.trim();
    const pass  = document.getElementById('ll-pass').value;

    if (!email || !pass) {
      hint.textContent = 'Please enter your email and password.';
      hint.style.display = 'block';
      hint.style.color = 'var(--red)';
      return;
    }

    btn.innerHTML = '<span class="ll-spinner"></span> Signing in…';
    btn.disabled  = true;
    hint.style.display = 'none';

    // ── Try live backend ─────────────────────────
    if (!window.DEMO_MODE) {
      try {
        const result = await API.login(email, pass);
        Auth.setToken(result.access_token);
        Auth.setUser(result.user);
        window.LIVE_USER = result.user;
        state.isAuthenticated = true;
        closeLoginModalForce();
        // Route based on role
        const role = result.user?.role;
        if (role === 'client') {
          state.currentView = 'client-portal';
        } else {
          state.currentView = 'dashboard';
        }
        renderApp();
        return;
      } catch (err) {
        if (err.isNetworkError) {
          window.DEMO_MODE = true;
        } else {
          hint.textContent = '❌ ' + err.message;
          hint.style.display = 'block';
          hint.style.color = 'var(--red)';
          btn.innerHTML = 'Sign In <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
          btn.disabled = false;
          return;
        }
      }
    }

    // ── Demo fallback ─────────────────────────────
    if (email === 'admin@voicedesk.io' && pass === 'password') {
      setTimeout(() => {
        window.DEMO_MODE = true;
        state.isAuthenticated = true;
        state.currentView = 'dashboard';
        closeLoginModalForce();
        renderApp();
      }, 600);
    } else {
      hint.textContent = '❌ Invalid credentials. Try admin@voicedesk.io / password for demo.';
      hint.style.display = 'block';
      hint.style.color = 'var(--red)';
      btn.innerHTML = 'Sign In <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      btn.disabled = false;
    }
  });
}
