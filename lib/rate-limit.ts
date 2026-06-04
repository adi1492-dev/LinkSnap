// In-memory store for rate limiting (prototype only)
// In production, use Redis or a similar persistent store.

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, RateLimitInfo> | undefined;
};

const rateLimitStore = globalForRateLimit.rateLimitStore || new Map<string, RateLimitInfo>();
if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.rateLimitStore = rateLimitStore;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { success: boolean, remaining: number, resetAt: number } {
  const now = Date.now();
  const info = rateLimitStore.get(key);

  if (!info || now > info.resetAt) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (info.count >= limit) {
    return { success: false, remaining: 0, resetAt: info.resetAt };
  }

  // Increment
  info.count += 1;
  return { success: true, remaining: limit - info.count, resetAt: info.resetAt };
}
