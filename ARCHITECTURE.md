# 🏗 LinkSnap System Architecture

## 📖 Overview
LinkSnap is designed as a highly scalable, serverless-first Next.js application. It seamlessly marries a responsive, client-side dashboard with a robust suite of API route handlers designed for high-throughput metadata extraction.

---

## 🧩 Core System Pipeline

```mermaid
graph TD
    Client[Client / External App] -->|GET /api/preview| EdgeAPI[Next.js API Route]
    EdgeAPI -->|Rate Limit Check| Limiter{60 req / min}
    Limiter -->|Pass| AuthCheck{API Key Provided?}
    Limiter -->|Fail| 429[429 Too Many Requests]
    AuthCheck -->|Yes| DBValidate[(Turso DB: Validate Key)]
    AuthCheck -->|No| PublicRoute[Allow Public Preview]
    DBValidate -->|Valid| Logger[Async Log Usage]
    DBValidate -->|Invalid| 401[401 Unauthorized]
    PublicRoute --> CacheCheck
    Logger --> CacheCheck{Edge Cache Hit?}
    CacheCheck -->|Yes| Response[Return JSON]
    CacheCheck -->|No| Fetcher[Fetch Target HTML]
    Fetcher --> Parser[Cheerio DOM Parser]
    Parser --> ValidMeta{Metadata Found?}
    ValidMeta -->|Yes| Response
    ValidMeta -->|No (SPA/React)| Headless[Microlink Headless Service]
    Headless --> Response
```

---

## 🗄️ Database Schema & Persistence

We utilize **Turso** (libSQL) to provide globally distributed SQLite, ensuring millisecond latency for API key validation. The system falls back seamlessly to a `local.db` file for offline development.

### Schemas
1. **`users`**: Manages developer accounts, authentication credentials, and global quota limits.
2. **`api_keys`**: Stores uniquely generated API keys with prefixing (e.g., `pk_...`), tying them to specific users with `active` or `revoked` statuses.
3. **`api_usage_logs`**: A high-throughput logging table tracking target URLs, HTTP status codes, and latency durations for analytics visualization.

*Note: Database schemas auto-migrate on the first API request via a highly reliable sequential batch execution script.*

---

## ⚡ Caching & Performance Strategy

1. **Parser Efficiency**: The primary extraction engine uses Cheerio instead of Puppeteer. This reduces parsing time from ~2-3 seconds down to ~150-200ms.
2. **Headless Fallback**: Recognizing that many modern sites are Client-Side Rendered (CSR), the parser automatically detects missing metadata and dynamically proxies the request through a headless browser rendering service.
3. **Edge Caching**: Responses from `/api/preview` are decorated with `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` to ensure aggressive downstream caching at the Vercel Edge Network.

---

## 🔐 Security & Rate Limiting
- **API Key Hashing**: Key generation leverages cryptographically secure UUIDs.
- **Rate Limiting**: An in-memory sliding window algorithm strictly limits requests to 60 per minute per identifier (IP or API Key).
- **CORS Protection**: Access Control headers are strictly enforced to prevent cross-site request forgery while allowing configurable `allowed_origins`.
