import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';
import { randomUUID } from 'crypto';

const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    await initializeDatabase();
    
    // In a real app, you would authenticate the user here
    // For now, we'll just fetch all keys (or mock it if DB fails)

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: 'SELECT * FROM api_keys WHERE user_id = ?',
      args: [userId]
    });

    return NextResponse.json({ data: rows }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing userId or name' }, { status: 400 });
    }

    const id = randomUUID();
    const keyValue = 'ls_' + randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');

    await db.execute({
      sql: 'INSERT INTO api_keys (id, key_value, user_id, name, allowed_origins) VALUES (?, ?, ?, ?, ?)',
      args: [id, keyValue, userId, name, '*']
    });

    return NextResponse.json({ 
      data: { id, key_value: keyValue, user_id: userId, name, allowed_origins: '*' } 
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
