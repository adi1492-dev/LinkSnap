# Prompt 11: API Rate Limiter Implementation

## Objective
Establish a secure rate-limiting subsystem in `lib/rate-limit.ts` to defend API routes from request flooding.

## Requirements
- Enforce a strict threshold of 60 requests per minute per identifier (e.g. API key or client IP).
- Implement an in-memory sliding window cache or token bucket mechanism to compute limits.
- Return a `429 Too Many Requests` error with standard rate-limit headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
