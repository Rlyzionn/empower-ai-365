// ============================================================
//  VOICEDESK BACKEND — Express Server Entry Point
// ============================================================
// Load .env from the backend folder regardless of where node was started from
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes      = require('./routes/auth');
const clientRoutes    = require('./routes/clients');
const callRoutes      = require('./routes/calls');
const webhookRoutes   = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes  = require('./routes/settings');
const retellRoutes    = require('./routes/retell');
const { errorHandler }= require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────
app.use(helmet({
  // Disable CSP — the frontend loads CDN scripts (Retell SDK, Google Fonts, etc.)
  // In production you should add a proper CSP; for now keep it open.
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (file://, mobile apps, curl, Postman)
    // Browsers send the string "null" for file:// pages
    if (!origin || origin === 'null') return callback(null, true);

    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',   // Live Server (VS Code)
      'http://127.0.0.1:3000',
    ];

    // Allow exact matches
    if (allowed.includes(origin)) return callback(null, true);

    // Allow Vercel + Railway preview URLs
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/\.railway\.app$/.test(origin)) return callback(null, true);
    if (/\.up\.railway\.app$/.test(origin)) return callback(null, true);

    // Allow any localhost / 127.0.0.1 port (local dev)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);

    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a moment and try again.' },
});

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
});

// ── Body Parsing ──────────────────────────────────────────
// Webhooks need raw body for signature verification — must come BEFORE express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VoiceDesk API',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/clients',   apiLimiter,  clientRoutes);
app.use('/api/calls',     apiLimiter,  callRoutes);
app.use('/api/webhooks',               webhookRoutes);   // No rate limit — Retell AI sends many
app.use('/api/analytics', apiLimiter,  analyticsRoutes);
app.use('/api/settings',  apiLimiter,  settingsRoutes);
app.use('/api/retell',    apiLimiter,  retellRoutes);

// ── Serve Frontend Static Files ───────────────────────────
// In production (Railway), the backend also serves the frontend.
// In local dev the frontend is served separately on port 3000.
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR, {
  index: 'index.html',
  // Don't serve backend internals
  dotfiles: 'deny',
}));

// SPA catch-all — return index.html for any non-API path
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ── 404 Handler (API routes only) ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎙️  VoiceDesk API running on port ${PORT}`);
  console.log(`📊  Health: http://localhost:${PORT}/health`);
  console.log(`🌍  Env:    ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
