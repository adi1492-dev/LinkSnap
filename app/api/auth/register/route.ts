import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing name, email, or password' }, { status: 400, headers: corsHeaders });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const userCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [trimmedEmail]
    });

    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400, headers: corsHeaders });
    }

    const userId = crypto.randomUUID();
    const defaultKeyId = crypto.randomUUID();
    const defaultKeyValue = 'pk_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

    // Insert user and their default API key
    await db.executeMultiple(`
      INSERT INTO users (id, name, email, password, quota_limit) 
      VALUES ('${userId}', '${name.replace(/'/g, "''")}', '${trimmedEmail}', '${password.replace(/'/g, "''")}', 1000);
      
      INSERT INTO api_keys (id, key_value, user_id, name, status) 
      VALUES ('${defaultKeyId}', '${defaultKeyValue}', '${userId}', 'Default Development Key', 'active');
    `);

    // Fetch the inserted key back to return
    const keyData = {
      id: defaultKeyId,
      key: defaultKeyValue,
      name: 'Default Development Key',
      createdAt: Date.now(),
      requestsCount: 0,
      userId: userId,
      allowedOrigins: ['*']
    };

    return NextResponse.json({
      data: {
        user: {
          id: userId,
          name: name.trim(),
          email: trimmedEmail,
          createdAt: Date.now(),
          quotaLimit: 1000
        },
        defaultKey: keyData
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
