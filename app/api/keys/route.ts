import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { rows } = await db.execute({
      sql: 'SELECT * FROM api_keys WHERE user_id = ?',
      args: [userId]
    });

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
