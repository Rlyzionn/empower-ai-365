// ============================================================
//  Auth Middleware — Verifies Supabase JWT
// ============================================================
const { supabaseAdmin } = require('../services/supabase');

/**
 * requireAuth — attaches req.user and req.platformId to every protected route.
 * The frontend sends:  Authorization: Bearer <supabase-access-token>
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    // Fetch their platform_id from the profiles table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('platform_id, role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(403).json({ error: 'User profile not found. Account may not be set up correctly.' });
    }

    req.user       = user;
    req.platformId = profile.platform_id;
    req.role       = profile.role;
    next();
  } catch (err) {
    console.error('[requireAuth]', err.message);
    res.status(500).json({ error: 'Authentication error.' });
  }
}

/**
 * requireOwner — only platform owners can perform destructive actions
 */
function requireOwner(req, res, next) {
  if (req.role !== 'owner') {
    return res.status(403).json({ error: 'Only platform owners can perform this action.' });
  }
  next();
}

module.exports = { requireAuth, requireOwner };
