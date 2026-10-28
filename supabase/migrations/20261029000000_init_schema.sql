-- ==============================================================================
-- NexusPulse AI Facebook Content Automation Platform
-- Supabase PostgreSQL Production Schema & Migrations
-- Author: Zia-ul-din (Full Stack AI & Automation Architect)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. System Settings & Configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
    post_times JSONB NOT NULL DEFAULT '["10:00", "15:00", "20:00"]'::jsonb,
    language TEXT NOT NULL DEFAULT 'english', -- 'english' | 'urdu' | 'bilingual'
    auto_posting_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_provider TEXT NOT NULL DEFAULT 'gemini', -- 'gemini' | 'openai' | 'groq'
    ai_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    image_generation_enabled BOOLEAN NOT NULL DEFAULT true,
    emergency_paused BOOLEAN NOT NULL DEFAULT false,
    notification_webhook_url TEXT,
    qstash_schedule_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Connected Facebook Pages
CREATE TABLE IF NOT EXISTS facebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT UNIQUE NOT NULL,
    page_name TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Stored securely (Page Access Token)
    category TEXT,
    followers_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    permissions TEXT[] DEFAULT ARRAY['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Research Topics & Source Evidence
CREATE TABLE IF NOT EXISTS research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL, -- 'trending_ai' | 'practical_expertise' | 'business_value'
    source_url TEXT,
    source_name TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    research_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    relevance_score NUMERIC(4,2) DEFAULT 0.95,
    is_verified_trend BOOLEAN NOT NULL DEFAULT true, -- false = 'editorial_recommendation'
    status TEXT NOT NULL DEFAULT 'approved', -- 'approved' | 'used' | 'archived' | 'excluded'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Content Drafts
CREATE TABLE IF NOT EXISTS content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES research_topics(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- 'trending_ai' | 'practical_expertise' | 'business_value'
    slot_index INTEGER NOT NULL CHECK (slot_index IN (1, 2, 3)),
    title TEXT NOT NULL,
    hook TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    image_prompt TEXT,
    language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'ur' | 'bilingual'
    quality_score INTEGER DEFAULT 92 CHECK (quality_score BETWEEN 0 AND 100),
    duplicate_hash TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'approved' | 'rejected' | 'published'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Scheduled Posts Queue
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES content_drafts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    slot_index INTEGER NOT NULL CHECK (slot_index IN (1, 2, 3)),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'
    idempotency_key TEXT UNIQUE NOT NULL, -- Format: 'post_YYYY-MM-DD_slot_X'
    target_page_id TEXT REFERENCES facebook_pages(page_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Publishing Jobs & Distributed Queue
CREATE TABLE IF NOT EXISTS publishing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    locked_by TEXT, -- Unique worker instance ID for distributed locking
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued' | 'running' | 'completed' | 'failed'
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Post Publications (Official Facebook Graph API Receipts)
CREATE TABLE IF NOT EXISTS post_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
    page_id TEXT NOT NULL,
    fb_post_id TEXT UNIQUE NOT NULL,
    fb_post_url TEXT NOT NULL,
    content_snapshot TEXT NOT NULL,
    category TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Post Analytics (Supported Meta Metrics)
CREATE TABLE IF NOT EXISTS post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fb_post_id TEXT NOT NULL REFERENCES post_publications(fb_post_id) ON DELETE CASCADE,
    reach INTEGER,
    impressions INTEGER,
    reactions INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    metrics_available BOOLEAN NOT NULL DEFAULT false,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs & System Health
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT,
    event_type TEXT NOT NULL,
    source TEXT NOT NULL, -- 'scheduler' | 'research' | 'ai_engine' | 'facebook_api' | 'user'
    status TEXT NOT NULL, -- 'info' | 'success' | 'warn' | 'error'
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Notification Records
CREATE TABLE IF NOT EXISTS notification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL, -- 'webhook' | 'email' | 'in_app'
    recipient TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- 'pending' | 'sent' | 'failed'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High Performance & Zero-Conflict Querying
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_idempotency ON scheduled_posts(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_status_retry ON publishing_jobs(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_research_topics_category ON research_topics(category, status);
CREATE INDEX IF NOT EXISTS idx_post_publications_page ON post_publications(page_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==============================================================================
-- Initial Seed Record for System Settings
-- ==============================================================================
INSERT INTO system_settings (
    id,
    timezone,
    post_times,
    language,
    auto_posting_enabled,
    ai_provider,
    ai_model
) VALUES (
    'default',
    'Asia/Karachi',
    '["10:00", "15:00", "20:00"]'::jsonb,
    'english',
    true,
    'gemini',
    'gemini-2.0-flash'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users & service role full access
CREATE POLICY "Authenticated users have full access to system_settings" ON system_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to facebook_pages" ON facebook_pages FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to research_topics" ON research_topics FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to content_drafts" ON content_drafts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to scheduled_posts" ON scheduled_posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to publishing_jobs" ON publishing_jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to post_publications" ON post_publications FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to post_analytics" ON post_analytics FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to audit_logs" ON audit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to notification_records" ON notification_records FOR ALL TO authenticated USING (true);
