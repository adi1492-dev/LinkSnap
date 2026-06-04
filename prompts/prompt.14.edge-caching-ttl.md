# Prompt 14: edge caching ttl

**Act as an expert Next.js and React Developer.**

Please help me build the 'edge caching ttl' feature for my LinkSnap application.

### Context:
Configure response headers in the preview API route to enforce CDN caching, keeping request latencies below 2 seconds.

## Requirements
- Add standard cache control headers: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
- Leverage Vercel's Edge network caching to skip serverless function boots on repeated queries.
- Ensure that cache lookups happen downstream, but rate limiting and authentication checks still run ahead of metadata fetches.
