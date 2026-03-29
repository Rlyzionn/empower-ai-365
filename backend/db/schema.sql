-- ============================================================
--  VOICEDESK — PostgreSQL Schema (Run in Supabase SQL Editor)
--  https://supabase.com → Your Project → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  PLATFORMS  (The Tier 3 owner — you)
-- ============================================================
CREATE TABLE platforms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL DEFAULT 'VoiceDesk',
  tagline       TEXT DEFAULT 'AI Voice Agent Platform',
  brand_color   TEXT DEFAULT '#7c6aff',
  logo_url      TEXT,
  support_email TEXT,
  owner_id      UUID REFERENCES auth.users(id),
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  PROFILES  (Extends Supabase auth.users for team members)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id),
  name        TEXT,
  role        TEXT DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'support')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CLIENTS  (Your resale clients — the businesses you serve)
-- ============================================================
CREATE TABLE clients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id         UUID REFERENCES platforms(id) NOT NULL,
  name                TEXT NOT NULL,
  contact_name        TEXT,
  contact_email       TEXT,
  contact_title       TEXT,
  industry            TEXT,
  phone_number        TEXT,
  location            TEXT,

  -- Infrastructure
  layer               TEXT NOT NULL CHECK (layer IN ('managed', 'self-hosted')),
  plan                TEXT NOT NULL DEFAULT 'Growth',
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  compliance          TEXT[] DEFAULT '{}',

  -- Pricing (stored for margin calculation)
  price_per_min       NUMERIC(6, 4),
  cost_per_min        NUMERIC(6, 4),
  extra_price_per_min NUMERIC(6, 4),
  minutes_included    INTEGER DEFAULT 2000,

  -- Tech config
  voice_model         TEXT DEFAULT 'Cartesia Sonic',
  ai_model            TEXT DEFAULT 'GPT-4o',
  crm_system          TEXT DEFAULT 'None',
  calendar_system     TEXT DEFAULT 'None',
  languages           TEXT[] DEFAULT '{English}',
  concurrent_calls    INTEGER,

  -- Integration IDs
  retell_agent_id     TEXT,              -- Retell AI agent ID (managed layer)
  n8n_webhook_url     TEXT,              -- Client-specific n8n webhook
  slack_webhook_url   TEXT,             -- Client team Slack webhook

  active_since        DATE DEFAULT CURRENT_DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  CALL LOGS  (Every call handled by the AI)
-- ============================================================
CREATE TABLE call_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  platform_id      UUID REFERENCES platforms(id) NOT NULL,
  external_call_id TEXT UNIQUE,           -- Retell call_id or Pipecat call_id

  -- Call details
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  duration_secs    INTEGER DEFAULT 0,
  caller_number    TEXT,
  called_number    TEXT,
  direction        TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),

  -- AI analysis
  intent           TEXT,
  outcome          TEXT,
  sentiment        TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  is_lead          BOOLEAN DEFAULT FALSE,
  is_escalation    BOOLEAN DEFAULT FALSE,
  is_voicemail     BOOLEAN DEFAULT FALSE,
  call_successful  BOOLEAN DEFAULT TRUE,
  summary          TEXT,
  transcript       JSONB DEFAULT '[]',
  tags             TEXT[] DEFAULT '{}',

  -- Storage
  recording_url    TEXT,
  layer            TEXT CHECK (layer IN ('managed', 'self-hosted')),
  raw_payload      JSONB,               -- Full webhook payload (for debugging)
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  LEADS  (Extracted from calls where AI detected interest)
-- ============================================================
CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_log_id  UUID REFERENCES call_logs(id),
  client_id    UUID REFERENCES clients(id) NOT NULL,
  platform_id  UUID REFERENCES platforms(id) NOT NULL,
  caller_number TEXT,
  summary      TEXT,
  score        TEXT DEFAULT 'medium' CHECK (score IN ('high', 'medium', 'low')),
  status       TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  crm_synced   BOOLEAN DEFAULT FALSE,
  crm_id       TEXT,
  crm_system   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  MONTHLY USAGE  (Tracks minutes per client per month)
-- ============================================================
CREATE TABLE usage (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  platform_id   UUID REFERENCES platforms(id) NOT NULL,
  month         DATE NOT NULL,            -- First day of month e.g. 2026-03-01
  minutes_used  NUMERIC(10, 2) DEFAULT 0,
  extra_minutes NUMERIC(10, 2) DEFAULT 0,
  call_count    INTEGER DEFAULT 0,
  UNIQUE(client_id, month)
);

-- ============================================================
--  API KEYS  (Encrypted — your infrastructure credentials)
-- ============================================================
CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id   UUID REFERENCES platforms(id) NOT NULL,
  service_name  TEXT NOT NULL,           -- 'retell', 'elevenlabs', 'twilio', etc.
  display_name  TEXT,
  masked_key    TEXT,                    -- e.g. "sk_••••••••••••3f9a" (for display only)
  encrypted_key TEXT NOT NULL,           -- AES-256 encrypted value
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_id, service_name)
);

-- ============================================================
--  TEAM MEMBERS
-- ============================================================
CREATE TABLE team_members (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id      UUID REFERENCES platforms(id) NOT NULL,
  user_id          UUID REFERENCES auth.users(id),
  email            TEXT NOT NULL,
  name             TEXT,
  role             TEXT DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'support')),
  invite_token     TEXT,
  invite_accepted  BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX idx_call_logs_client_id ON call_logs(client_id);
CREATE INDEX idx_call_logs_platform_id ON call_logs(platform_id);
CREATE INDEX idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX idx_call_logs_external_id ON call_logs(external_call_id);
CREATE INDEX idx_clients_platform_id ON clients(platform_id);
CREATE INDEX idx_clients_retell_agent ON clients(retell_agent_id);
CREATE INDEX idx_usage_client_month ON usage(client_id, month);
CREATE INDEX idx_leads_client_id ON leads(client_id);

-- ============================================================
--  ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================================
ALTER TABLE clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage        ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Platform members can only access their own platform's data
CREATE POLICY "platform_access_clients" ON clients
  FOR ALL USING (
    platform_id IN (SELECT platform_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "platform_access_calls" ON call_logs
  FOR ALL USING (
    platform_id IN (SELECT platform_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "platform_access_leads" ON leads
  FOR ALL USING (
    platform_id IN (SELECT platform_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "platform_access_usage" ON usage
  FOR ALL USING (
    platform_id IN (SELECT platform_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "platform_access_api_keys" ON api_keys
  FOR ALL USING (
    platform_id IN (SELECT platform_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
--  FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment usage when a call is logged
CREATE OR REPLACE FUNCTION increment_usage()
RETURNS TRIGGER AS $$
DECLARE
  call_minutes NUMERIC;
  month_start DATE;
  minutes_cap NUMERIC;
BEGIN
  -- Calculate minutes for this call
  call_minutes := ROUND(NEW.duration_secs::NUMERIC / 60, 2);
  month_start  := DATE_TRUNC('month', NEW.started_at)::DATE;

  -- Upsert into usage table
  INSERT INTO usage (client_id, platform_id, month, minutes_used, call_count)
  VALUES (NEW.client_id, NEW.platform_id, month_start, call_minutes, 1)
  ON CONFLICT (client_id, month) DO UPDATE SET
    minutes_used = usage.minutes_used + call_minutes,
    call_count   = usage.call_count + 1;

  -- Check if over plan limit and update extra_minutes
  SELECT minutes_included INTO minutes_cap FROM clients WHERE id = NEW.client_id;

  UPDATE usage
  SET extra_minutes = GREATEST(0, minutes_used - minutes_cap)
  WHERE client_id = NEW.client_id AND month = month_start;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_call_insert
  AFTER INSERT ON call_logs
  FOR EACH ROW EXECUTE FUNCTION increment_usage();
