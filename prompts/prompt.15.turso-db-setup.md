# Prompt 15: turso db setup

**Act as an expert Next.js and React Developer.**

Please help me build the 'turso db setup' feature for my LinkSnap application.

### Context:
Establish database connectivity in `lib/db.ts` utilizing `@libsql/client` and create an automated setup script to provision tables.

## Requirements
- Initialize database client with local SQLite fallback (`file:local.db`) when cloud environment variables are missing.
- Write an `initializeDatabase()` script executing on the first request:
  - Create the `users` table.
  - Create `api_keys` with foreign key relations, support status, and `allowed_origins`.
  - Create `api_usage_logs` to log requests.
- Seed a default test account (`user@example.com`/`password`) and test key (`pk_e5a822e0dcac4d08a8e7a56698f7ccbbb50cc4e345ba4470809997f536401f08`) automatically.
