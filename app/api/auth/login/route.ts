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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400, headers: corsHeaders });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Fetch user
    const userRes = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND password = ?',
      args: [trimmedEmail, password]
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401, headers: corsHeaders });
    }

    const user = userRes.rows[0];

    // Fetch user keys along with requestsCount
    const keysRes = await db.execute({
      sql: `
        SELECT k.*, COUNT(l.id) AS requestsCount
        FROM api_keys k
        LEFT JOIN api_usage_logs l ON k.id = l.key_id
        WHERE k.user_id = ? AND k.status = 'active'
        GROUP BY k.id
      `,
      args: [user.id]
    });

    const mappedKeys = keysRes.rows.map(k => ({
      id: k.id as string,
      key: k.key_value as string,
      name: k.name as string,
      createdAt: k.created_at ? new Date(k.created_at as string).getTime() : Date.now(),
      requestsCount: Number(k.requestsCount || 0),
      userId: k.user_id as string,
      allowedOrigins: ['*']
    }));

    return NextResponse.json({
      data: {
        user: {
          id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          createdAt: user.created_at ? new Date(user.created_at as string).getTime() : Date.now(),
          quotaLimit: Number(user.quota_limit || 1000)
        },
        keys: mappedKeys
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
