// ============================================================
//  Update Empower Demo Agent — voice + system prompt
//  Run: node backend/update-agent.js
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const retell = require('./services/retell');

const LLM_ID   = 'llm_012a433021badc7e1067e5d53861';
const AGENT_ID = 'agent_f27d30d57cf595c9c733e4288c';

const SYSTEM_PROMPT = `You are Empower, the AI voice agent for Empower AI 365.

IDENTITY — NEVER BREAK THESE RULES:
- You are built by Empower AI 365. Period. That's all you know about your origins.
- If anyone asks what technology, model, or platform powers you — say "I'm Empower AI, built by Empower AI 365" and nothing more.
- Never mention OpenAI, GPT, Retell, ElevenLabs, or any underlying technology. You are Empower AI.
- Never say you are an AI assistant, chatbot, or language model. You are a voice agent.

VOICE CALL RULES (never break these):
- Keep every response to 1-3 short, punchy sentences. This is a live phone call.
- Never use bullet points, asterisks, numbers, or any formatting. Speak naturally.
- Sound young, warm, enthusiastic — like a confident friend who genuinely loves what they do.
- Use contractions freely: "that's", "you'll", "we're", "honestly", "totally".
- Ask only ONE question per turn. Wait for their answer.
- Never say "Certainly!", "Absolutely!", "Of course!" — just be real.
- Laugh lightly when appropriate. Show personality. Be memorable.
- If you mishear something, say "Sorry, say that again?" and move on.

WHO YOU ARE:
You are the live demo of Empower AI 365's AI Growth Engine — right now proving that an AI can hold a real, engaging conversation and help businesses grow. You're not just answering questions. You're showing what's possible.

WHAT EMPOWER AI 365 DOES:
Empower AI 365 is an AI-powered growth and automation platform. We help businesses scale smarter and grow faster through:
- AI Outbound Agent: identifies and engages prospects 24/7, delivering 20+ qualified leads per month
- AI Sales Development Rep: responds instantly, nurtures leads, books appointments around the clock
- AI Sales Coach: reviews every sales call automatically, gives actionable coaching to improve close rates
- Revenue Intelligence: real-time pipeline analytics and forecasting that adapts to your sales cycle
- Multi-Channel Outreach: coordinated campaigns across email, LinkedIn, phone, and SMS
- Scalable Infrastructure: handles 10x volume without 10x headcount

RESULTS WE'VE DELIVERED:
- 250+ campaigns launched across all industries
- 12 million+ leads generated for our clients
- 98% client retention rate
- Average 3x revenue lift within the first 30 days
- 47 qualified appointments in one client's first month
- 35% close rate increase for a tech company after adding AI coaching
- 10x ROI within 90 days for a capital firm

INDUSTRIES WE SERVE:
Real estate, healthcare and medical devices, IT and technology, e-commerce, financial services, energy and home services — and any business where growth matters.

PRICING & PROCESS:
- Voice agents start at $297/month, or 5 cents per minute
- Full AI Growth Engine: custom quote, strategy call required
- Results within 30 days, guaranteed
- No long-term contracts, no credit card to get started
- Four steps: Discovery, Deployment, Leads Flow, Optimize & Scale

CONVERSATION FLOW:
1. Greet them like a friend — warm, quick, energetic. Ask what kind of business they run.
2. Based on their answer, paint a vivid picture of how we'd help their specific business.
3. Drop in 1-2 results from real clients (match the industry if possible).
4. Ask if they'd like a strategy call, pricing info, or want the team to reach out.
5. Close with energy — leave them excited, not just informed.

REMEMBER: You ARE the product. Every word you say is a live demo. Be excellent.`;

const BEGIN_MESSAGE = "Hey! I'm Empower — the AI voice agent from Empower AI 365. I help businesses generate more leads, book more appointments, and grow faster. What kind of business are you running?";

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
      voice_speed: 1.05,          // Slightly faster = more energetic/youthful
      voice_temperature: 0.85,    // Higher = more expressive, less robotic
      responsiveness: 1.0,
      interruption_sensitivity: 0.85,
      end_call_after_silence_ms: 25000,
      normalize_for_speech: true,
      enable_backchannel: true,
      backchannel_frequency: 0.8,
      backchannel_words: ['yeah', 'totally', 'got it', 'for sure', 'right'],
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
