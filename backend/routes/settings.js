// ============================================================
//  Settings Routes — Platform branding, API keys, team
//  GET    /api/settings
//  PATCH  /api/settings
//  GET    /api/settings/api-keys
//  POST   /api/settings/api-keys
//  DELETE /api/settings/api-keys/:service
//  GET    /api/settings/team
// ============================================================
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { supabaseAdmin }            = require('../services/supabase');
const { requireAuth, requireOwner} = require('../middleware/auth');
const { asyncHandler }             = require('../middleware/errorHandler');

// ── Encryption helpers ────────────────────────────────────
const ALGO = 'aes-256-cbc';
const KEY  = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted) {
  const [ivHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
}

function maskKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

// ── GET /api/settings ─────────────────────────────────────
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('platforms')
    .select('id, name, tagline, brand_color, logo_url, support_email, settings')
    .eq('id', req.platformId)
    .single();

  if (error) throw error;
  res.json({ data });
}));

// ── PATCH /api/settings ───────────────────────────────────
router.patch('/', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { name, tagline, brand_color, logo_url, support_email, settings } = req.body;

  const updates = {};
  if (name         !== undefined) updates.name          = name;
  if (tagline      !== undefined) updates.tagline        = tagline;
  if (brand_color  !== undefined) updates.brand_color    = brand_color;
  if (logo_url     !== undefined) updates.logo_url       = logo_url;
  if (support_email!== undefined) updates.support_email  = support_email;
  if (settings     !== undefined) updates.settings       = settings;

  const { data, error } = await supabaseAdmin
    .from('platforms')
    .update(updates)
    .eq('id', req.platformId)
    .select()
    .single();

  if (error) throw error;
  res.json({ data, message: 'Platform settings saved.' });
}));

// ── GET /api/settings/api-keys ────────────────────────────
// Returns masked keys only — never the real values
router.get('/api-keys', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, service_name, display_name, masked_key, updated_at')
    .eq('platform_id', req.platformId)
    .order('service_name');

  if (error) throw error;
  res.json({ data: data || [] });
}));

// ── POST /api/settings/api-keys ──────────────────────────
// Store a new API key (encrypted)
router.post('/api-keys', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { service_name, display_name, key_value } = req.body;

  if (!service_name) return res.status(400).json({ error: 'service_name is required.' });
  if (!key_value)    return res.status(400).json({ error: 'key_value is required.' });

  const encryptedKey = encrypt(key_value);
  const maskedKey    = maskKey(key_value);

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .upsert({
      platform_id:  req.platformId,
      service_name,
      display_name: display_name || service_name,
      masked_key:   maskedKey,
      encrypted_key: encryptedKey,
    }, { onConflict: 'platform_id,service_name' })
    .select('id, service_name, display_name, masked_key')
    .single();

  if (error) throw error;
  res.json({ data, message: `${service_name} API key saved securely.` });
}));

// ── DELETE /api/settings/api-keys/:service ───────────────
router.delete('/api-keys/:service', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('api_keys')
    .delete()
    .eq('platform_id', req.platformId)
    .eq('service_name', req.params.service);

  if (error) throw error;
  res.json({ message: `${req.params.service} key removed.` });
}));

// ── GET /api/settings/api-keys/:service/value ────────────
// Decrypt and return the actual key — owner only
router.get('/api-keys/:service/value', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('encrypted_key, service_name')
    .eq('platform_id', req.platformId)
    .eq('service_name', req.params.service)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Key not found.' });

  try {
    const decrypted = decrypt(data.encrypted_key);
    res.json({ value: decrypted, service: data.service_name });
  } catch {
    res.status(500).json({ error: 'Failed to decrypt key. Check ENCRYPTION_KEY.' });
  }
}));

// ── GET /api/settings/team ────────────────────────────────
router.get('/team', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('id, email, name, role, invite_accepted, created_at')
    .eq('platform_id', req.platformId)
    .order('created_at');

  if (error) throw error;
  res.json({ data: data || [] });
}));

// ── PATCH /api/settings/team/:id ─────────────────────────
router.patch('/team/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['manager', 'support'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "manager" or "support".' });
  }

  const { data, error } = await supabaseAdmin
    .from('team_members')
    .update({ role })
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Team member not found.' });
  res.json({ data, message: 'Role updated.' });
}));

// ── DELETE /api/settings/team/:id ────────────────────────
router.delete('/team/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('id', req.params.id)
    .eq('platform_id', req.platformId);

  if (error) throw error;
  res.json({ message: 'Team member removed.' });
}));

module.exports = router;
