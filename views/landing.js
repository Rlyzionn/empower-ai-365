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
      <div class="lp-bg-glow lp-bg-glow-4"></div>
      <div class="lp-bg-glow lp-bg-glow-5"></div>
      <div class="lp-bg-grid"></div>
    </div>

    <!-- Nav -->
    <nav class="lp-nav" id="lp-nav">
      <div class="lp-nav-inner">
        <div class="lp-nav-logo">
          <div class="lp-nav-logo-icon">
            <img src="images/ai.jpeg" alt="Empower AI 365" style="width:28px;height:28px;border-radius:8px;object-fit:cover">
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
              <img src="images/ai.jpeg" alt="Empower AI 365" style="width:36px;height:36px;border-radius:12px;object-fit:cover">
            </div>
          </button>
          <div class="lp-orb-hint">
            <span class="lp-orb-hint-dot"></span>
            Talk to Empower — Live Demo
          </div>
          <!-- Ambient voice wave bars -->
          <div class="lp-voice-wave">
            ${Array.from({length:28},(_,i)=>`<div class="lp-vw-bar" style="animation-delay:${(i*0.07).toFixed(2)}s;animation-duration:${(1.6+Math.sin(i*0.4)*0.6).toFixed(2)}s;height:${8+Math.sin(i*0.45)*20}px"></div>`).join('')}
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

        <!-- Trust cards -->
        <div class="lp-trust-grid">
          <div class="lp-trust-card">
            <div class="lp-trust-card-icon">🎯</div>
            <div class="lp-trust-card-val">20+</div>
            <div class="lp-trust-card-label">Qualified leads/month</div>
          </div>
          <div class="lp-trust-card">
            <div class="lp-trust-card-icon">⚡</div>
            <div class="lp-trust-card-val">30 days</div>
            <div class="lp-trust-card-label">To first results</div>
          </div>
          <div class="lp-trust-card">
            <div class="lp-trust-card-icon">📈</div>
            <div class="lp-trust-card-val">3×</div>
            <div class="lp-trust-card-label">Avg revenue lift</div>
          </div>
          <div class="lp-trust-card">
            <div class="lp-trust-card-icon">🔓</div>
            <div class="lp-trust-card-val">No lock-in</div>
            <div class="lp-trust-card-label">Cancel any time</div>
          </div>
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
            <img src="images/ai.jpeg" alt="Empower AI 365" style="width:28px;height:28px;border-radius:8px;object-fit:cover">
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

    <!-- Voice Modal — 3D Edition -->
    <div class="modal-overlay" id="voice-modal" onclick="closeVoiceModal(event)" style="display:none">
      <div class="voice-modal">
        <!-- Close -->
        <button class="vm-close-btn" onclick="forceCloseVoiceModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Brand tag -->
        <div class="vm-brand-tag">
          <img src="images/ai.jpeg" alt="Empower AI 365" style="width:18px;height:18px;border-radius:5px;object-fit:cover">
          Powered by Empower AI
        </div>

        <!-- 3D orb scene -->
        <div class="vm-3d-scene" id="vm-scene">
          <div class="vm-3d-sphere" id="vm-sphere">
            <div class="vm-sphere-inner"></div>
            <div class="vm-sphere-ring vm-ring-1"></div>
            <div class="vm-sphere-ring vm-ring-2"></div>
            <div class="vm-sphere-ring vm-ring-3"></div>
            <div class="vm-sphere-glow"></div>
          </div>
          <!-- Floating particles -->
          <div class="vm-particle vm-p1"></div>
          <div class="vm-particle vm-p2"></div>
          <div class="vm-particle vm-p3"></div>
          <div class="vm-particle vm-p4"></div>
          <div class="vm-particle vm-p5"></div>
          <div class="vm-particle vm-p6"></div>
        </div>

        <!-- Status -->
        <div class="vm-status" id="vm-status">
          <div class="vm-status-dot" id="vm-dot"></div>
          <span id="vm-status-text">Connecting to Empower AI…</span>
        </div>

        <!-- Wave bars (active call) -->
        <div class="vm-wave-bars" id="vm-wave-bars">
          ${Array.from({length:16},(_,i)=>`<div class="vm-bar" style="animation-delay:${(i*0.08).toFixed(2)}s"></div>`).join('')}
        </div>

        <!-- End call button -->
        <button class="vm-end-btn" id="vm-end-btn" style="display:none" onclick="forceCloseVoiceModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.96.38 1.98.62 3.03.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.91a19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.09 1.05.33 2.08.7 3.04a2 2 0 0 1-.44 2.11L7.18 9.04"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
          End Call
        </button>

        <div class="vm-hint" id="vm-hint">Speak naturally — Empower is listening</div>
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

  const status = document.getElementById('vm-status');

  function setStatus(t, s) {
    const statusText = document.getElementById('vm-status-text');
    if (statusText) statusText.textContent = t + (s ? ' — ' + s : '');
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
      const modal = document.getElementById('voice-modal');
      if (modal) modal.classList.add('active');
      const endBtn = document.getElementById('vm-end-btn');
      if (endBtn) endBtn.style.display = 'flex';
      const hintEl = document.getElementById('vm-hint');
      if (hintEl) hintEl.style.display = 'none';
      const statusText = document.getElementById('vm-status-text');
      if (statusText) statusText.textContent = 'Empower is live — speak now';
    });

    _retellClient.on('call_ended', () => {
      _callActive = false;
      const modal = document.getElementById('voice-modal');
      if (modal) modal.classList.remove('active');
      const endBtn = document.getElementById('vm-end-btn');
      if (endBtn) endBtn.style.display = 'none';
      const hintEl = document.getElementById('vm-hint');
      if (hintEl) hintEl.style.display = 'block';
      const statusText = document.getElementById('vm-status-text');
      if (statusText) statusText.textContent = 'Call ended — thanks for trying Empower AI!';
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
  m.classList.remove('active');
  const endBtn = document.getElementById('vm-end-btn');
  if (endBtn) endBtn.style.display = 'none';
  const hintEl = document.getElementById('vm-hint');
  if (hintEl) hintEl.style.display = 'block';
  const statusText = document.getElementById('vm-status-text');
  if (statusText) statusText.textContent = 'Connecting to Empower AI…';
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
