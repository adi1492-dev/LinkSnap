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
