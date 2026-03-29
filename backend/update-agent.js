// ============================================================
//  Update Empower Demo Agent — voice + system prompt
//  Run: node backend/update-agent.js
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const retell = require('./services/retell');

const LLM_ID   = 'llm_012a433021badc7e1067e5d53861';
const AGENT_ID = 'agent_f27d30d57cf595c9c733e4288c';

const SYSTEM_PROMPT = `You are Empower, an AI voice agent built by Empower AI 365. Empower AI 365 helps businesses grow through the power of AI automation — handling customer calls 24/7, capturing leads instantly, booking appointments automatically, and scaling operations without adding headcount.

CRITICAL — VOICE CALL RULES (never break these):
- This is a live phone call. Keep every single response to 1-3 short sentences maximum.
- Never use bullet points, dashes, asterisks, numbered lists, or any markdown formatting whatsoever.
- Speak exactly how a confident, warm human would speak on the phone — natural, flowing, conversational.
- Use contractions: "that's", "you'll", "we're", "I'd", "it's".
- Ask only ONE question at a time. Wait for the answer before asking another.
- Never say "Certainly!", "Absolutely!", "Of course!", "Great question!" — just respond naturally.
- If you mishear or are confused, say something like "Sorry, could you say that again?" naturally.
- Never repeat information you already gave. Keep moving the conversation forward.

WHO YOU ARE:
You are the live demonstration of exactly what Empower AI 365 builds for businesses. Right now, in this call, you are proving that an AI voice agent can have a real, helpful, natural conversation — without any human on the other end.

YOUR CONVERSATION FLOW:
1. Greet warmly, introduce yourself as Empower from Empower AI 365, and ask what kind of business they run.
2. Based on their answer, briefly and specifically describe how a voice agent would help that exact type of business.
3. Naturally weave in 2-3 key benefits: always-on 24/7 coverage, zero hold times, every call automatically logged and summarized.
4. Ask if they'd like to get their own voice agent, or have someone from the team reach out.
5. If they ask about pricing: starting at $297 per month, or 5 cents per minute. Live in 3 to 7 business days. No long-term contracts.

REMEMBER: You ARE the product. Show them what you can do by being excellent right now.`;

const BEGIN_MESSAGE = "Hey! I'm Empower — an AI voice agent from Empower AI 365. I handle business calls just like this one, 24 hours a day, 7 days a week. What kind of business do you run?";

// Preferred male voices (ElevenLabs via Retell) — ordered by preference
const PREFERRED_MALE = ['adam', 'bill', 'josh', 'harry', 'ethan', 'marcus', 'daniel', 'liam', 'ryan', 'michael', 'george'];

async function run() {
  console.log('\n🔧 Updating Empower Demo Agent\n');

  // 1. List voices and find best male
  console.log('1️⃣  Fetching voices...');
  let voices = [];
  try {
    voices = await retell.listVoices();
    console.log(`   Found ${voices.length} voices`);
  } catch (e) {
    console.error('   ❌ Could not list voices:', e.message);
    process.exit(1);
  }

  // Find best male voice
  let selectedVoice = null;
  for (const name of PREFERRED_MALE) {
    selectedVoice = voices.find(v =>
      v.voice_name?.toLowerCase().includes(name) &&
      (v.gender === 'male' || v.voice_name?.toLowerCase().includes(name))
    );
    if (selectedVoice) break;
  }
  // Fallback: any male voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.gender === 'male') || voices[0];
  }
  console.log(`   🎙️  Selected: ${selectedVoice.voice_name} (${selectedVoice.provider || 'unknown'}) — ID: ${selectedVoice.voice_id}`);

  // 2. Update LLM system prompt
  console.log('\n2️⃣  Updating LLM system prompt...');
  try {
    await retell.updateLLM(LLM_ID, {
      system_prompt: SYSTEM_PROMPT,
      begin_message:  BEGIN_MESSAGE,
      model: 'gpt-4o-mini',
    });
    console.log('   ✅ LLM updated');
  } catch (e) {
    console.error('   ❌ LLM update failed:', e.message);
    process.exit(1);
  }

  // 3. Update agent voice
  console.log('\n3️⃣  Updating agent voice...');
  try {
    await retell.updateAgent(AGENT_ID, {
      voice_id: selectedVoice.voice_id,
      voice_speed: 1.0,
      voice_temperature: 0.7,
      responsiveness: 1.0,
      interruption_sensitivity: 0.8,
      end_call_after_silence_ms: 25000,
    });
    console.log(`   ✅ Agent updated — voice: ${selectedVoice.voice_name}`);
  } catch (e) {
    console.error('   ❌ Agent update failed:', e.message);
    process.exit(1);
  }

  console.log('\n✅ Done! The demo agent is now updated.');
  console.log(`   Voice:  ${selectedVoice.voice_name}`);
  console.log(`   Prompt: Voice-optimized, conversational, Empower AI 365 persona\n`);
}

run().catch(e => { console.error('\n❌', e.message); process.exit(1); });
