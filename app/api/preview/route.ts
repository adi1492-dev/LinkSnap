import { NextResponse } from 'next/server';
import { fetchOGMetadata } from '@/lib/og-parser';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    let apiKey = searchParams.get('api_key');

    if (!apiKey) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
      }
    }

    if (!url) {
      return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      return NextResponse.json({ error: 'Invalid "url" format' }, { status: 400 });
    }

    // Rate Limiting: 60 requests per minute per key (or per IP if no key, but we'll enforce key if we want)
    // To support the free dashboard UI hitting the API, we can allow no-key or use a default key.
    const identifier = apiKey || request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = checkRateLimit(identifier, 60, 60 * 1000); // 60/min

    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        resetAt: new Date(rateLimitResult.resetAt).toISOString()
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1000).toString()
        }
      });
    }

    // Track usage (mock - in real world we'd update a DB).
    // For this prototype, we'll expose another endpoint or use local storage on Client side for dashboard.

    const metadata = await fetchOGMetadata(url);

    return NextResponse.json({
      data: metadata,
      meta: {
        providedUrl: url,
        cached: false // In Next.js App Router with caching, actual caching is handled by fetch if configure properly, but we'll just return false here for simplicity.
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour minimally
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1000).toString(),
        'Access-Control-Allow-Origin': '*', // Allow CORS for embed
      }
    });

  } catch (error: any) {
    console.error('OG API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to extract metadata', 
      details: error.message 
    }, { status: 500 });
  }
}
