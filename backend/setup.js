// ============================================================
//  VoiceDesk — One-Time Setup Script
//  Run ONCE after deploying schema.sql to Supabase
//
//  Usage:  node setup.js
//
//  This script will:
//  1. Create your admin user in Supabase Auth
//  2. Create your platform record (Empower AI 365)
//  3. Link your profile to the platform as owner
// ============================================================
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Configuration — change these before running ──────────────
const ADMIN_EMAIL    = 'admin@empowerai365.com';   // Your login email
const ADMIN_PASSWORD = 'VoiceDesk2026!';           // Your login password
const ADMIN_NAME     = 'Empower AI 365 Admin';
const PLATFORM_NAME  = 'Empower AI 365';
const PLATFORM_EMAIL = 'admin@empowerai365.com';
// ─────────────────────────────────────────────────────────────

async function setup() {
  console.log('\n🚀 VoiceDesk Setup Starting...\n');

  // ── Step 1: Create admin user ────────────────────────────
  console.log('1️⃣  Creating admin user:', ADMIN_EMAIL);
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME },
  });

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      console.log('   ⚠️  User already exists — continuing with existing user');
      // Fetch existing user
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('   ❌ Could not find existing user. Aborting.');
        process.exit(1);
      }
      authData = { user: existing };
    } else {
      console.error('   ❌ Failed to create user:', authError.message);
      process.exit(1);
    }
  }

  const userId = authData.user.id;
  console.log('   ✅ User ID:', userId);

  // ── Step 2: Create platform record ──────────────────────
  console.log('\n2️⃣  Creating platform record:', PLATFORM_NAME);
  const { data: platform, error: platformError } = await supabaseAdmin
    .from('platforms')
    .insert({
      name:          PLATFORM_NAME,
      tagline:       'AI Voice Agent Platform',
      brand_color:   '#7c6aff',
      support_email: PLATFORM_EMAIL,
      owner_id:      userId,
    })
    .select()
    .single();

  if (platformError) {
    if (platformError.message.includes('duplicate') || platformError.code === '23505') {
      console.log('   ⚠️  Platform may already exist — fetching existing...');
      const { data: existing } = await supabaseAdmin
        .from('platforms')
        .select()
        .eq('owner_id', userId)
        .single();
      if (existing) {
        console.log('   ✅ Found existing platform ID:', existing.id);
        await linkProfile(userId, existing.id);
        printSummary(ADMIN_EMAIL, ADMIN_PASSWORD, existing.id);
        return;
      }
    }
    console.error('   ❌ Failed to create platform:', platformError.message);
    process.exit(1);
  }

  console.log('   ✅ Platform ID:', platform.id);

  // ── Step 3: Link profile to platform as owner ────────────
  await linkProfile(userId, platform.id);
  printSummary(ADMIN_EMAIL, ADMIN_PASSWORD, platform.id);
}

async function linkProfile(userId, platformId) {
  console.log('\n3️⃣  Linking profile to platform as owner...');

  // Profile may have been auto-created by the trigger, or not yet
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id:          userId,
      platform_id: platformId,
      name:        ADMIN_NAME,
      role:        'owner',
    }, { onConflict: 'id' });

  if (error) {
    console.error('   ❌ Failed to link profile:', error.message);
    console.log('   ℹ️  You may need to run schema.sql in Supabase first!');
    process.exit(1);
  }

  console.log('   ✅ Profile linked as owner');
}

function printSummary(email, password, platformId) {
  console.log('\n' + '='.repeat(60));
  console.log('✅  SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Your login credentials:');
  console.log('   Email:    ', email);
  console.log('   Password: ', password);
  console.log('\n🔑 Platform ID:', platformId);
  console.log('\n🌐 Next steps:');
  console.log('   1. Start backend:  node server.js');
  console.log('   2. Open frontend:  index.html in your browser');
  console.log('   3. Login with the credentials above');
  console.log('   4. You\'re live! 🎉');
  console.log('='.repeat(60) + '\n');
}

setup().catch(err => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
