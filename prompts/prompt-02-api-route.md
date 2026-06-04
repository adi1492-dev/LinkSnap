# Prompt 2: API Route and Rate Limiting

**User Prompt:**
Now, create a public API endpoint at `/api/preview` that takes a `url` parameter and returns the structured OG metadata as JSON. The API needs to respond in under 2 seconds for cached URLs, so use Next.js fetch caching (`revalidate: 3600`). Also, implement a simple rate limiter that limits requests to 60 per minute per API key. For now, just use an in-memory Map to store the rate limit counts. Return standard rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).

**AI Response:**
Implemented `lib/rate-limit.ts` with an in-memory Map and the `app/api/preview/route.ts` endpoint. The endpoint accepts a URL, validates it, checks the rate limit based on an API key or IP address, fetches the metadata, and returns it with `Cache-Control` headers for downstream caching.
