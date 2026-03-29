// ============================================================
//  VOICEDESK — Notification Service
//  Fires after every call — Slack alerts + n8n CRM webhooks
//  Called from routes/webhooks.js (both Retell + Pipecat)
// ============================================================

/**
 * sendNotifications(callLog, client)
 * Fire-and-forget — never throws. All errors are logged only.
 */
async function sendNotifications(callLog, client) {
  const tasks = [];

  // ── n8n automation webhook ────────────────────────────────
  // Fires for every call — triggers CRM sync, follow-ups, etc.
  const n8nUrl = client.n8n_webhook_url || process.env.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    tasks.push(sendN8nWebhook(n8nUrl, callLog, client));
  }

  // ── Slack alerts ──────────────────────────────────────────
  const slackToken = process.env.SLACK_BOT_TOKEN;
  if (slackToken) {
    if (callLog.is_escalation) {
      tasks.push(sendSlackMessage(
        slackToken,
        process.env.SLACK_CHANNEL_ALERTS || '#voicedesk-alerts',
        buildEscalationBlock(callLog, client)
      ));
    } else if (callLog.is_lead) {
      tasks.push(sendSlackMessage(
        slackToken,
        process.env.SLACK_CHANNEL_LEADS || '#voicedesk-leads',
        buildLeadBlock(callLog, client)
      ));
    }
  }

  // Run all notifications concurrently, log any individual failures
  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[Notifications] Task ${i} failed:`, r.reason?.message || r.reason);
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  n8n Webhook
// ─────────────────────────────────────────────────────────────

async function sendN8nWebhook(url, callLog, client) {
  const secret = process.env.N8N_SECRET;
  const headers = {
    'Content-Type': 'application/json',
    ...(secret ? { 'X-VoiceDesk-Secret': secret } : {}),
  };

  const body = JSON.stringify({
    event:         'call.completed',
    call_id:       callLog.id,
    client_id:     client.id,
    client_name:   client.name,
    layer:         callLog.layer,
    intent:        callLog.intent,
    outcome:       callLog.outcome,
    sentiment:     callLog.sentiment,
    is_lead:       callLog.is_lead,
    is_escalation: callLog.is_escalation,
    duration_secs: callLog.duration_secs,
    caller_number: callLog.caller_number,
    summary:       callLog.summary,
    tags:          callLog.tags,
    started_at:    callLog.started_at,
  });

  const res = await fetchWithTimeout(url, { method: 'POST', headers, body }, 8000);
  if (!res.ok) {
    throw new Error(`n8n returned ${res.status}`);
  }
  console.log(`[Notifications/n8n] Fired for ${client.name} — ${callLog.intent}`);
}

// ─────────────────────────────────────────────────────────────
//  Slack
// ─────────────────────────────────────────────────────────────

async function sendSlackMessage(token, channel, blocks) {
  const res = await fetchWithTimeout(
    'https://slack.com/api/chat.postMessage',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, blocks, unfurl_links: false }),
    },
    8000
  );

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack error: ${data.error}`);
  }
  console.log(`[Notifications/Slack] Sent to ${channel}`);
}

/** Build Slack Block Kit message for a new lead */
function buildLeadBlock(callLog, client) {
  const dur = Math.floor((callLog.duration_secs || 0) / 60);
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🎯 New Lead Detected', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Client:*\n${client.name}` },
        { type: 'mrkdwn', text: `*Layer:*\n${callLog.layer === 'managed' ? '⚡ Cloud Managed' : '🖥️ Direct Deploy'}` },
        { type: 'mrkdwn', text: `*Intent:*\n${callLog.intent || 'General Inquiry'}` },
        { type: 'mrkdwn', text: `*Duration:*\n${dur} min` },
        { type: 'mrkdwn', text: `*Caller:*\n${callLog.caller_number || 'Unknown'}` },
        { type: 'mrkdwn', text: `*Sentiment:*\n${sentimentEmoji(callLog.sentiment)} ${callLog.sentiment}` },
      ],
    },
    callLog.summary ? {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Summary:*\n${callLog.summary}` },
    } : null,
    { type: 'divider' },
  ].filter(Boolean);
}

/** Build Slack Block Kit message for an escalation */
function buildEscalationBlock(callLog, client) {
  const dur = Math.floor((callLog.duration_secs || 0) / 60);
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🚨 Emergency Escalation', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Client:*\n${client.name}` },
        { type: 'mrkdwn', text: `*Caller:*\n${callLog.caller_number || 'Unknown'}` },
        { type: 'mrkdwn', text: `*Intent:*\n${callLog.intent || 'Emergency'}` },
        { type: 'mrkdwn', text: `*Duration:*\n${dur} min` },
      ],
    },
    callLog.summary ? {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Summary:*\n${callLog.summary}` },
    } : null,
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Action required* — review this call immediately.` },
    },
    { type: 'divider' },
  ].filter(Boolean);
}

function sentimentEmoji(s) {
  return s === 'positive' ? '😊' : s === 'negative' ? '😟' : '😐';
}

// ─────────────────────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────────────────────

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

module.exports = { sendNotifications };
