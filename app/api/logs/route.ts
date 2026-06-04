import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    const { rows } = await db.execute({
      sql: `
        SELECT l.id, l.target_url, l.status_code, l.duration_ms, l.created_at, k.key_value, k.name as key_name, k.user_id
        FROM api_usage_logs l
        JOIN api_keys k ON l.key_id = k.id
        WHERE k.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT 150
      `,
      args: [userId]
    });

    const mappedLogs = rows.map(l => ({
      id: String(l.id),
      userId: l.user_id as string,
      apiKey: l.key_value as string,
      keyName: l.key_name as string,
      url: l.target_url as string,
      timestamp: l.created_at ? new Date(l.created_at as string).getTime() : Date.now(),
      status: Number(l.status_code || 200),
      responseTime: Number(l.duration_ms || 0),
      method: 'GET'
    }));

    return NextResponse.json({ data: mappedLogs }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
