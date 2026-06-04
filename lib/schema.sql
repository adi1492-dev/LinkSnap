-- SQLite schema for LinkSnap API Keys and Usage Tracking

-- 1. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,           -- e.g. 'key-123'
    key_value TEXT UNIQUE NOT NULL,-- the actual raw key or hash 'ls_...'
    user_id TEXT NOT NULL,         -- reference to User ID
    name TEXT NOT NULL,            -- e.g. 'Production Key'
    allowed_origins TEXT,          -- comma-separated origins, or '*'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'   -- 'active', 'revoked'
);

-- 2. API Usage Logs Table
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_id TEXT NOT NULL,
    target_url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration_ms INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(key_id) REFERENCES api_keys(id)
);

-- Note: We can expand this schema later to support caching or collections if needed.
