# Link Preview API Architecture

## Overview
This project provides a robust, fast Open Graph (OG) metadata extraction API and a comprehensive Dashboard for managing link previews. It is built as a complete Next.js full-stack application.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Dark Theme)
- **State Management**: Zustand (with localStorage persistence)
- **HTML Parsing**: Cheerio (Server-side extraction)
- **Deployment Topology**: Split Architecture
  - **Frontend**: Vercel (Hosting UI and Dashboard components)
  - **Backend API**: Railway (Hosting `/api/preview` endpoint for compute-heavy node extraction)

## Execution Flow & Caching Strategy
1. **API Endpoint (`/api/preview`)**
   - Receives target URL and API key validation check.
   - Triggers `fetchOGMetadata`.
   - `fetch` handles up to 20 native redirects automatically (meeting the 5-hop requirement safely).
   - AbortController terminates after 8000ms to prevent hanging.
   - Caching headers (`Cache-Control: public, s-maxage=3600`) enforce downstream caching to ensure <2s response times on repeated calls.

2. **Parser Logic (`lib/og-parser.ts`)**
   - Fetches the HTML string via standard `fetch`.
   - Parses the HTML tree to Memory using Cheerio (lightweight equivalent of jsdom, much faster, O(N) complexity).
   - Uses prioritized selector fallbacks to extract content:
     - `og:image` -> `twitter:image` -> `img:first`
     - `og:description` -> `twitter:description` -> `meta description` -> `paragraph:first`
   - Handles relative URLs by creating a canonical domain base and transforming via standard `new URL(path, base)`.

3. **Rate Limiting (`lib/rate-limit.ts`)**
   - Simple in-memory Map structure tracking API key usages and resetting intervals cleanly every 60 seconds (60 req/min/key rule). In production, this drops in directly for Redis without changing interface.

## Embed Snippet Generation
The HTML embed snippet delegates to an iFrame-based rendering layer via `/embed/page.tsx` pointing to raw OG metadata fetching, wrapping it efficiently in a self-enclosed container preventing DOM conflicts with the host webpage.

## API Key Authentication & CORS
API keys are handled via a Dashboard (simulating DB insertion locally mapping client capabilities to secure server contexts). Mock backend endpoints observe the keys via LocalStorage synchronizations.

To support the split-deployment model, the backend API (`/api/preview`) exposes a generic `OPTIONS` handler and responds with explicit `Access-Control-Allow-Origin: *` to allow requests originating from the Vercel frontend. The frontend configures the target backend domain via the `NEXT_PUBLIC_API_URL` environment variable.

## Conclusion
The architecture is monolithic serverless, combining fast runtime extraction via Cheerio with a robust client-side visualization layer, suitable as an MVP for rich-link preview systems.
