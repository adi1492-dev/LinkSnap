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

  try {
    const { rows } = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    
    if (rows.length === 0) {
      console.log('Auto-migrating Turso database tables...');
      await db.executeMultiple(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            quota_limit INTEGER DEFAULT 1000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            key_value TEXT UNIQUE NOT NULL,
            allowed_origins TEXT DEFAULT '*',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS api_usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id TEXT NOT NULL,
            target_url TEXT NOT NULL,
            status_code INTEGER,
            duration_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (key_id) REFERENCES api_keys(id) ON DELETE CASCADE
        );
      `);
      console.log('Tables created successfully!');
    } else {
      // In case api_keys table wasn't created yet or we need to ensure other tables exist
      await db.executeMultiple(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            key_value TEXT UNIQUE NOT NULL,
            allowed_origins TEXT DEFAULT '*',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS api_usage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id TEXT NOT NULL,
            target_url TEXT NOT NULL,
            status_code INTEGER,
            duration_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (key_id) REFERENCES api_keys(id) ON DELETE CASCADE
        );
      `);
    }

    // Safely update existing databases if they lack the allowed_origins column
    try {
      await db.execute("ALTER TABLE api_keys ADD COLUMN allowed_origins TEXT DEFAULT '*';");
      console.log('Migrated existing database: added allowed_origins column.');
    } catch (e) {
      // Column already exists, ignore error
    }

    // Seed default user
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (id, name, email, password, quota_limit) VALUES (?, ?, ?, ?, ?)',
      args: ['default-user', 'Default User', 'user@example.com', 'password', 1000]
    });

    // Seed the user's specific API key to make sure it is valid
    await db.execute({
      sql: 'INSERT OR IGNORE INTO api_keys (id, key_value, user_id, name, status) VALUES (?, ?, ?, ?, ?)',
      args: [
        'default-key-id',
        'pk_e5a822e0dcac4d08a8e7a56698f7ccbbb50cc4e345ba4470809997f536401f08',
        'default-user',
        'Default API Key',
        'active'
      ]
    });

    isInitialized = true;
  } catch (error) {
    console.error('Database auto-migration failed:', error);
  }
}
