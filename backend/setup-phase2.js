// ============================================================
//  Phase 2 Setup — Creates the Empower AI 365 Demo Agent
//  Run ONCE after adding RETELL_API_KEY to .env
//
//  Usage: node setup-phase2.js
// ============================================================
require('dotenv').config();
const retell = require('./services/retell');

async function setup() {
  console.log('\n🚀 Phase 2 Setup — Retell AI + OpenRouter\n');

  if (!process.env.RETELL_API_KEY) {
    console.error('❌ RETELL_API_KEY not set in .env');
    process.exit(1);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not set in .env');
    process.exit(1);
  }

  // 1. Test Retell API connection
  console.log('1️⃣  Testing Retell AI connection...');
  try {
    const agents = await retell.listAgents();
    console.log(`   ✅ Connected! Existing agents: ${(agents || []).length}`);
  } catch (err) {
    console.error('   ❌ Retell connection failed:', err.message);
    process.exit(1);
  }

  // 2. List available voices
  console.log('\n2️⃣  Fetching available voices (ElevenLabs via Retell)...');
  let voices = [];
  let selectedVoice;
  try {
    voices = await retell.listVoices();
    console.log(`   ✅ Found ${(voices || []).length} voices`);

    // Pick best voice for demo
    const preferred = (voices || []).find(v =>
      v.voice_name?.toLowerCase().includes('sarah') ||
      v.voice_name?.toLowerCase().includes('rachel') ||
      v.voice_name?.toLowerCase().includes('jessica') ||
      v.voice_name?.toLowerCase().includes('aria') ||
      (v.provider === 'elevenlabs' && v.accent === 'american')
    ) || voices?.[0];

    if (preferred) {
      selectedVoice = preferred;
      console.log(`   🎙️  Selected voice: ${preferred.voice_name} (${preferred.provider})`);
    } else {
      console.log('   ⚠️  No preferred voice found, will use first available');
      selectedVoice = voices?.[0];
    }
  } catch (err) {
    console.error('   ❌ Could not fetch voices:', err.message);
    process.exit(1);
  }

  if (!selectedVoice?.voice_id) {
    console.error('   ❌ No voice available. Check your Retell account has voices enabled.');
    process.exit(1);
  }

  // 3. Create Retell LLM
  console.log('\n3️⃣  Creating Retell LLM (with system prompt)...');
  let llm;
  try {
    llm = await retell.createLLM({
      model: 'gpt-4o-mini',
      system_prompt: `You are Empower, the AI voice assistant for Empower AI 365 — a company that deploys intelligent AI voice agents for businesses across every industry.

Your role: Demonstrate the power of AI voice agents by having a real conversation.

Personality: Warm, professional, enthusiastic but not pushy. Speak naturally — this is a voice call, so keep responses short and conversational (2-3 sentences max).

When someone calls:
1. Greet them and introduce yourself as Empower from Empower AI 365
2. Ask what type of business they run
3. Show how you could handle calls for that specific business (briefly role-play)
4. Highlight benefits naturally: 24/7 availability, no hold times, automatic lead capture, appointment scheduling, every call logged and summarized
5. Ask if they'd like a human from the team to reach out

Pricing (share if asked): Starting from $0.05/minute. Setup in 3-7 business days. No long-term contracts.

Keep it natural. Be curious about their business. Show genuine enthusiasm.`,

      begin_message: "Hi there! I'm Empower, the AI voice assistant from Empower AI 365. I handle business calls just like this one — 24 hours a day. What kind of business do you run?",
    });
    console.log(`   ✅ LLM created: ${llm.llm_id}`);
  } catch (err) {
    console.error('   ❌ LLM creation failed:', err.message);
    process.exit(1);
  }

  // 4. Create Retell Agent
  console.log('\n4️⃣  Creating Empower AI 365 Demo Agent...');
  let agent;
  try {
    agent = await retell.createAgent({
      agent_name: 'Empower AI 365 — Demo Agent',
      voice_id:   selectedVoice.voice_id,
      response_engine: {
        type:   'retell-llm',
        llm_id: llm.llm_id,
      },
      language:                  'en-US',
      enable_backchannel:        true,
      backchannel_frequency:     0.9,
      backchannel_words:         ['okay', 'sure', 'got it', 'of course', 'right'],
      normalize_for_speech:      true,
      end_call_after_silence_ms: 20000,
      max_call_duration_ms:      300000, // 5 min demo
      post_call_analysis_data: [
        { name: 'interested',     type: 'boolean', description: 'True if the caller showed interest in getting a voice agent' },
        { name: 'business_type',  type: 'string',  description: 'Type of business the caller runs' },
        { name: 'contact_info',   type: 'string',  description: 'Any contact info the caller shared' },
      ],
    });
    console.log(`   ✅ Agent created: ${agent.agent_id}`);
    console.log(`   🎙️  Voice: ${selectedVoice.voice_name}`);
  } catch (err) {
    console.error('   ❌ Agent creation failed:', err.message);
    process.exit(1);
  }

  // 5. Print results
  console.log('\n' + '='.repeat(60));
  console.log('✅  PHASE 2 SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nAdd this to your backend/.env file:');
  console.log(`\nRETELL_DEMO_AGENT_ID=${agent.agent_id}`);
  console.log(`\nLLM ID (keep for reference): ${llm.llm_id}`);
  console.log(`Voice used: ${selectedVoice.voice_name} (${selectedVoice.voice_id})`);
  console.log('\nNext steps:');
  console.log('  1. Add RETELL_DEMO_AGENT_ID to backend/.env');
  console.log('  2. Restart the backend: node server.js');
  console.log('  3. Click "Talk to Empower" on the landing page — live demo!');
  console.log('  4. Set webhook URL in Retell dashboard:');
  console.log('     https://your-api-domain.com/api/webhooks/retell');
  console.log('='.repeat(60) + '\n');
}

setup().catch(err => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
