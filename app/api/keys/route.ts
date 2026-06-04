import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400, headers: corsHeaders });
    }

    // Fetch keys joined with usage counts from logs
    const { rows } = await db.execute({
      sql: `
        SELECT k.*, COUNT(l.id) AS requestsCount
        FROM api_keys k
        LEFT JOIN api_usage_logs l ON k.id = l.key_id
        WHERE k.user_id = ? AND k.status = 'active'
        GROUP BY k.id
        ORDER BY k.created_at DESC
      `,
      args: [userId]
    });

    const mappedKeys = rows.map(k => ({
      id: k.id as string,
      key: k.key_value as string,
      name: k.name as string,
      createdAt: k.created_at ? new Date(k.created_at as string).getTime() : Date.now(),
      requestsCount: Number(k.requestsCount || 0),
      userId: k.user_id as string,
      allowedOrigins: ['*']
    }));

    return NextResponse.json({ data: mappedKeys }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { userId, name, keyValue } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing userId or name' }, { status: 400, headers: corsHeaders });
    }

    const id = crypto.randomUUID();
    const finalKeyValue = keyValue || 'pk_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

    await db.execute({
      sql: 'INSERT INTO api_keys (id, key_value, user_id, name) VALUES (?, ?, ?, ?)',
      args: [id, finalKeyValue, userId, name]
    });

    const keyData = {
      id,
      key: finalKeyValue,
      name,
      createdAt: Date.now(),
      requestsCount: 0,
      userId,
      allowedOrigins: ['*']
    };

    return NextResponse.json({ data: keyData }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: Request) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ error: 'Missing keyId parameter' }, { status: 400, headers: corsHeaders });
    }

    // Soft delete or hard delete. Let's hard delete to keep the database tidy, or soft delete by setting status='revoked'
    // To ensure usage logs referential integrity, we can set status to 'revoked' so the keys are still in the DB but inactive.
    await db.execute({
      sql: "UPDATE api_keys SET status = 'revoked' WHERE id = ?",
      args: [keyId]
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
