-- ══════════════════════════════════════════════════════════════════
-- PIRATE DEVS & CHATTERROOM: COMMUNITY CLOUD DATABASE SCHEMA
-- Compatible with Supabase, Neon, and Standard PostgreSQL
-- ══════════════════════════════════════════════════════════════════

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS & CONTRIBUTORS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_jid VARCHAR(100) UNIQUE,
    phone_number VARCHAR(30),
    whatsapp_name VARCHAR(100),
    github_username VARCHAR(100) UNIQUE,
    email VARCHAR(150),
    track VARCHAR(50) DEFAULT 'General', -- 'Frontend', 'Backend', 'QA / DevOps', 'Documentation & Design'
    xp INTEGER NOT NULL DEFAULT 0,
    rank VARCHAR(50) NOT NULL DEFAULT 'Minion',
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    verification_type VARCHAR(50), -- 'starred', 'forked', 'pr_contributor', 'manual'
    verified_at TIMESTAMPTZ,
    messages_count INTEGER NOT NULL DEFAULT 0,
    prs_merged_count INTEGER NOT NULL DEFAULT 0,
    commits_count INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    last_xp_earned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_github ON users(LOWER(github_username));
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_jid);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_track ON users(track);

-- 3. XP TRANSACTIONS / AUDITABLE LEDGER
CREATE TABLE IF NOT EXISTS xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(100),
    amount INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'pr_merged', 'chat_activity', 'task_claim', 'vip_verification', 'game', 'manual_award'
    reason TEXT NOT NULL,
    source_ref VARCHAR(100), -- 'PR#42', 'Issue#10', 'commit:33f0636'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_github ON xp_ledger(LOWER(github_username));
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created ON xp_ledger(created_at DESC);

-- 4. PULL REQUESTS (MERGED CONTRIBUTIONS)
CREATE TABLE IF NOT EXISTS pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number INTEGER NOT NULL,
    repo_name VARCHAR(100) NOT NULL DEFAULT 'PiratesOfDevs/ChatterRoom',
    title TEXT NOT NULL,
    author_github VARCHAR(100) NOT NULL,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'merged',
    merged_at TIMESTAMPTZ,
    merged_by VARCHAR(100),
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    track VARCHAR(50),
    pr_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (repo_name, pr_number)
);

CREATE INDEX IF NOT EXISTS idx_prs_author ON pull_requests(LOWER(author_github));
CREATE INDEX IF NOT EXISTS idx_prs_repo ON pull_requests(repo_name);

-- 5. COMMITS TABLE
CREATE TABLE IF NOT EXISTS commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_sha VARCHAR(40) NOT NULL,
    repo_name VARCHAR(100) NOT NULL DEFAULT 'PiratesOfDevs/ChatterRoom',
    author_github VARCHAR(100) NOT NULL,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    committed_at TIMESTAMPTZ,
    pr_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (repo_name, commit_sha)
);

CREATE INDEX IF NOT EXISTS idx_commits_author ON commits(LOWER(author_github));
CREATE INDEX IF NOT EXISTS idx_commits_sha ON commits(commit_sha);

-- 6. TASKS / ISSUE CLAIMS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_number INTEGER NOT NULL,
    repo_name VARCHAR(100) NOT NULL DEFAULT 'PiratesOfDevs/ChatterRoom',
    title TEXT NOT NULL,
    track VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    claimed_by_github VARCHAR(100),
    claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    deadline_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    issue_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (repo_name, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_tasks_claimer ON tasks(LOWER(claimed_by_github));
CREATE INDEX IF NOT EXISTS idx_tasks_track ON tasks(track);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 7. BOT SETTINGS & SWITCHES
CREATE TABLE IF NOT EXISTS bot_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANALYTIC VIEWS FOR LEADERBOARD & METRICS
CREATE OR REPLACE VIEW view_leaderboard AS
SELECT
    ROW_NUMBER() OVER (ORDER BY u.xp DESC, u.prs_merged_count DESC) AS ranking,
    u.id,
    u.whatsapp_name,
    u.github_username,
    u.whatsapp_jid,
    u.track,
    u.xp,
    u.rank,
    u.is_premium,
    u.prs_merged_count,
    u.commits_count,
    u.messages_count,
    u.last_active_at
FROM users u
ORDER BY u.xp DESC;

CREATE OR REPLACE VIEW view_track_stats AS
SELECT
    COALESCE(track, 'Unassigned') AS track_name,
    COUNT(*) AS total_contributors,
    SUM(xp) AS total_xp,
    SUM(prs_merged_count) AS total_prs_merged
FROM users
GROUP BY track;
