# 🚀 LinkSnap - Enterprise Open Graph API & Developer Hub

Welcome to **LinkSnap**, a high-performance, edge-ready Open Graph metadata extraction service. Built for scale, LinkSnap provides developers with instant, structured JSON representations of any URL, powering rich link previews for chat applications, social networks, and forums.

---

## 🌟 Key Features

- **Blazing Fast Parsing**: Sub-200ms extractions powered by server-side Cheerio DOM querying.
- **Headless Fallback Engine**: Seamlessly extracts metadata from React, Vue, and Angular SPA applications using a headless browser fallback (Microlink API).
- **Edge Caching**: Fully optimized for Vercel Edge Networks with intelligent cache TTL handling.
- **Developer API Dashboard**: Complete portal for generating API keys, tracking usage metrics, and viewing real-time request logs.
- **Public & Authenticated Previews**: Allows public landing page previews while enforcing robust rate limits and quota systems for programmatic API access.
- **Interactive Playground**: Test URLs directly in the dashboard and instantly copy iframe embed snippets for your own site.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Lucide Icons
- **Styling**: Vanilla CSS (Tailwind patterns with custom Glassmorphism and animations)
- **Backend**: Next.js Serverless Route Handlers
- **Database**: Turso Edge SQLite with `@libsql/client`
- **State Management**: Zustand (Client-side persistence)
- **Parsing**: Cheerio

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Optional: Turso Database Account (falls back to `local.db`)

### Installation

```bash
# 1. Clone the repository and install dependencies
npm install

# 2. Set up environment variables (Optional)
# If omitted, LinkSnap automatically provisions a local SQLite file.
echo "TURSO_DATABASE_URL=libsql://..." > .env.local
echo "TURSO_AUTH_TOKEN=..." >> .env.local

# 3. Start the development server
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to access the landing page and dashboard.

---

## 🔒 Default Test Credentials

For rapid testing, the system seeds a default development account upon initialization:
- **Email**: `user@example.com`
- **Password**: `password`
- **Pre-configured API Key**: `pk_e5a822e0dcac4d08a8e7a56698f7ccbbb50cc4e345ba4470809997f536401f08`

---

## 🏗 Architecture & Collaboration

LinkSnap's architecture prioritizes speed, security, and developer experience. Please refer to our [ARCHITECTURE.md](ARCHITECTURE.md) for an in-depth dive into our system design, caching layers, and database schemas.

This project was developed iteratively in collaboration with an advanced AI assistant. You can view the complete history of prompts that shaped this platform in the [`prompts/`](prompts/) directory, and read our [AI Declaration](prompts/ai-declaration.md).
