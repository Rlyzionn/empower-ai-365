// ============================================================
//  VOICEDESK — Frontend API Client
//  Handles all communication with the backend Express API.
//  Exposes: window.API, window.Auth, window.checkBackendStatus
// ============================================================

// Auto-detect environment:
//   - Local dev (localhost): backend runs on port 3001
//   - Production (Railway / any deployed host): same origin, no port needed
const _API_BASE = window.API_BASE ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : '');  // Same-origin on Railway / Vercel / any deployed host

// ── Token / User Management ──────────────────────────────────
const Auth = {
  getToken:  ()    => localStorage.getItem('vd_token'),
  setToken:  (t)   => localStorage.setItem('vd_token', t),
  clearToken: ()   => localStorage.removeItem('vd_token'),

  getUser: () => {
    try { return JSON.parse(localStorage.getItem('vd_user') || 'null'); }
    catch { return null; }
  },
  setUser:  (u) => localStorage.setItem('vd_user', JSON.stringify(u)),
  clearUser: ()  => localStorage.removeItem('vd_user'),

  clear: () => { Auth.clearToken(); Auth.clearUser(); },
};

// ── Core Fetch Wrapper ───────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${_API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    // Backend unreachable — signal to caller
    const err = new Error('BACKEND_UNREACHABLE');
    err.isNetworkError = true;
    throw err;
  }

  if (res.status === 401) {
    // Session expired — clear auth and redirect to login
    Auth.clear();
    if (window.state) window.state.isAuthenticated = false;
    if (window.renderApp) window.renderApp();
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }

  return data;
}

// ── Check if backend is alive ────────────────────────────────
async function checkBackendStatus() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${_API_BASE}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

// ── API Surface ──────────────────────────────────────────────
const API = {

  // ── Auth ────────────────────────────────────────────────
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch('/api/auth/me'),

  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {}),

  invite: (email, name, role) =>
    apiFetch('/api/auth/invite', {
      method: 'POST',
      body: JSON.stringify({ email, name, role }),
    }),

  // ── Clients ─────────────────────────────────────────────
  clients: {
    list: (params = {}) =>
      apiFetch('/api/clients?' + new URLSearchParams(params)),
    get: (id) =>
      apiFetch(`/api/clients/${id}`),
    create: (data) =>
      apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      apiFetch(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) =>
      apiFetch(`/api/clients/${id}`, { method: 'DELETE' }),
    usage: (id) =>
      apiFetch(`/api/clients/${id}/usage`),
    stats: (id) =>
      apiFetch(`/api/clients/${id}/stats`),
  },

  // ── Calls ────────────────────────────────────────────────
  calls: {
    list: (params = {}) =>
      apiFetch('/api/calls?' + new URLSearchParams(params)),
    get: (id) =>
      apiFetch(`/api/calls/${id}`),
  },

  // ── Analytics ───────────────────────────────────────────
  analytics: {
    dashboard: () => apiFetch('/api/analytics/dashboard'),
    clients:   () => apiFetch('/api/analytics/clients'),
    trend: (days = 7) => apiFetch(`/api/analytics/calls/trend?days=${days}`),
  },

  // ── Phone Numbers ────────────────────────────────────────
  phones: {
    list: () => apiFetch('/api/retell/phone-numbers'),
    import: (data) => apiFetch('/api/retell/phone-numbers', { method: 'POST', body: JSON.stringify(data) }),
    update: (phone, data) => apiFetch(`/api/retell/phone-numbers/${encodeURIComponent(phone)}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (phone) => apiFetch(`/api/retell/phone-numbers/${encodeURIComponent(phone)}`, { method: 'DELETE' }),
  },

  // ── Settings ─────────────────────────────────────────────
  settings: {
    get:    ()       => apiFetch('/api/settings'),
    update: (data)   => apiFetch('/api/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    apiKeys: ()      => apiFetch('/api/settings/api-keys'),
    saveKey: (service, displayName, value) =>
      apiFetch('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ service_name: service, display_name: displayName, key_value: value }),
      }),
    deleteKey: (service) =>
      apiFetch(`/api/settings/api-keys/${service}`, { method: 'DELETE' }),
    team:    () => apiFetch('/api/settings/team'),
    updateTeamMember: (id, role) =>
      apiFetch(`/api/settings/team/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    removeTeamMember: (id) =>
      apiFetch(`/api/settings/team/${id}`, { method: 'DELETE' }),
  },
};

// ── Expose Globals ───────────────────────────────────────────
window.API  = API;
window.Auth = Auth;
window.checkBackendStatus = checkBackendStatus;

// ── State: demo mode flag (set by app.js on boot) ────────────
window.DEMO_MODE = true;   // Default true until backend confirms live
window.LIVE_USER = null;   // Set to user object when logged in via API
