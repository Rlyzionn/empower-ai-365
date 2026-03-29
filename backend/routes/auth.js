// ============================================================
//  Auth Routes  — Login, Logout, Me, Invite
//  POST /api/auth/login
//  POST /api/auth/logout
//  GET  /api/auth/me
//  POST /api/auth/invite
// ============================================================
const express = require('express');
const router  = express.Router();
const { supabase, supabaseAdmin } = require('../services/supabase');
const { requireAuth, requireOwner } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Fetch profile + platform info
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*, platform:platforms(*)')
    .eq('id', data.user.id)
    .single();

  res.json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id:         data.user.id,
      email:      data.user.email,
      name:       profile?.name || 'Admin',
      role:       profile?.role || 'owner',
      platform:   profile?.platform || null,
      platform_id: profile?.platform_id || null,
    },
  });
}));

// ── POST /api/auth/logout ─────────────────────────────────
router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await supabase.auth.admin.signOut(token);
  res.json({ message: 'Signed out successfully.' });
}));

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*, platform:platforms(*)')
    .eq('id', req.user.id)
    .single();

  res.json({
    id:          req.user.id,
    email:       req.user.email,
    name:        profile?.name,
    role:        profile?.role,
    platform_id: profile?.platform_id,
    platform:    profile?.platform,
  });
}));

// ── POST /api/auth/refresh ────────────────────────────────
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token is required.' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: 'Session expired. Please sign in again.' });

  res.json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}));

// ── POST /api/auth/invite  (Owner only — invite team members)
router.post('/invite', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { email, name, role = 'manager' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required.' });
  if (!['manager', 'support'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "manager" or "support".' });
  }

  // Create Supabase auth user with invite link
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { name, platform_id: req.platformId, role },
  });
  if (error) return res.status(400).json({ error: error.message });

  // Pre-create team_members record
  await supabaseAdmin.from('team_members').upsert({
    platform_id: req.platformId,
    email,
    name,
    role,
    user_id: data.user.id,
    invite_accepted: false,
  });

  res.json({ message: `Invitation sent to ${email}.`, user_id: data.user.id });
}));

module.exports = router;
