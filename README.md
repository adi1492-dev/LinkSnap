# LinkSnap - Open Graph Preview API & Developer Dashboard

LinkSnap is a high-performance, edge-ready full-stack Open Graph metadata extraction API and Developer Dashboard built using Next.js 15 and backed by a Turso SQLite database. It extracts titles, descriptions, high-resolution images, and favicons from any URL in milliseconds, falling back to a headless browser scraping service when necessary.

---

## Key Features

- **Rich Preview Cards**: Visualizes Open Graph and Twitter Card metadata instantly with responsive hover effects.
- **Preview History**: Fully searchable browser history with custom collections (folders) and tagging mechanisms.
- **Unified Public API**: A public `GET /api/preview` endpoint that returns structured metadata JSON.
- **HTML Embed Snippet Generator**: Instantly generate iframe embed code to display cards on any site.
- **Batch Processing & CSV Ingestion**: Scrape dozens of links concurrently by pasting lists or importing a `.csv` file.
- **Developer API Key Portal**: Complete user authentication, secure key creation, key revocation, and request logging.
- **Interactive API Playground**: Simulate preview API requests with your custom API keys and inspect real-time log traces.
- **Browser Bookmarklet**: Drag-and-drop JavaScript button to overlay preview link cards from any browser tab.

---

## Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (Premium Dark Theme with Glassmorphism)
- **Database**: Turso Edge SQLite (via `@libsql/client`)
- **State Management**: Zustand (local state synced with database endpoints)
- **HTML Scraper**: Cheerio (fast server-side HTML tree parsing)
- **Headless Fallback**: Microlink API (headless browser scraping for client-side JS-rendered pages)

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed descriptions of the metadata pipeline, fallbacks, database migrations, and rate limiting details.

---

## Local Development & Setup

### Prerequisites
- **Node.js**: version 18 or higher
- **Turso DB Account** (Optional: falls back to local `local.db` file-based SQLite out-of-the-box)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables (Optional for Turso)
Create a `.env` or `.env.local` file in the root directory:
```env
TURSO_DATABASE_URL=libsql://your-db-name-username.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```
*Note: If these variables are not provided, LinkSnap will automatically initialize and seed a local SQLite database file `local.db` in your workspace.*

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the homepage, and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to log in or register.

---

## Default Seeded Credentials
To facilitate immediate testing:
- **Test Developer Account**:
  - **Email**: `user@example.com`
  - **Password**: `password`
- **Seeded Active API Key**:
  - `pk_e5a822e0dcac4d08a8e7a56698f7ccbbb50cc4e345ba4470809997f536401f08`

---

## Project Structure
```text
├── app/
│   ├── api/
│   │   ├── auth/           # Login and registration endpoints
│   │   ├── keys/           # API Keys CRUD endpoints
│   │   ├── logs/           # Request logs query endpoints
│   │   └── preview/        # Public metadata scraper route
│   ├── dashboard/          # Developer dashboard portal UI
│   ├── embed/              # Iframe rendering page
│   └── layout.tsx & page.tsx
├── components/             # Reusable UI components
├── lib/
│   ├── db.ts               # Turso database connection & auto-migrations
│   ├── og-parser.ts        # Cheerio & Microlink scraping pipeline
│   ├── rate-limit.ts       # Sliding window rate limiting
│   └── store.ts            # Zustand client state store
├── prompts/                # Step-by-step developer prompts & AI declaration
└── ARCHITECTURE.md         # Detailed system design
```

---

## AI Collaboration Declaration
All developer prompts, system iterations, and architectural pivots have been saved in the `prompts/` directory. Refer to [prompts/ai-declaration.md](prompts/ai-declaration.md) for more details on the human-AI collaborative pair programming process.
