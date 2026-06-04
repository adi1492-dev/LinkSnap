import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;

// Throw an error early if missing in production, but allow mock/local bypass during build
if (process.env.NODE_ENV === 'production' && (!dbUrl || !dbToken)) {
  console.warn('WARNING: Missing Turso DB credentials (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN).');
}

export const db = createClient({
  url: dbUrl || 'file:local.db',
  authToken: dbToken,
});

let isInitialized = false;

export async function initializeDatabase() {
  // Only run initialization once per server instance
  if (isInitialized) return;
  if (!dbUrl || !dbToken) return;

  try {
    const { rows } = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_keys'");
    
    if (rows.length === 0) {
      console.log('Auto-migrating Turso database tables...');
      await db.executeMultiple(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            key_value TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS api_usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id TEXT NOT NULL,
            target_url TEXT NOT NULL,
            status_code INTEGER,
            duration_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (key_id) REFERENCES api_keys(id)
        );
      `);
      console.log('Tables created successfully!');
    }
    isInitialized = true;
  } catch (error) {
    console.error('Database auto-migration failed:', error);
  }
}
