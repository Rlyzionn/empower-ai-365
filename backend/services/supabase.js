// ============================================================
//  Supabase Client — Admin + Standard clients
// ============================================================
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Log clearly but do NOT exit — let the server start so Railway healthcheck passes.
  // Auth/database routes will return 503 until env vars are configured.
  console.error('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — database features disabled.');
  module.exports = { supabase: null, supabaseAdmin: null };
} else {
  // Service-role client — bypasses RLS, use only in server-side code
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Anon client — respects RLS, used for user-context operations
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  module.exports = { supabase, supabaseAdmin };
}
