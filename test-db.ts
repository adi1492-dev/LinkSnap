import { initializeDatabase, db } from './lib/db';

async function main() {
  await initializeDatabase();
  console.log("Database initialized.");

  const users = await db.execute("SELECT * FROM users;");
  console.log("Users:", users.rows);
  
  const keys = await db.execute("SELECT * FROM api_keys;");
  console.log("Keys:", keys.rows);
}

main().catch(console.error);
