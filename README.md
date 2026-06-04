# LinkSnap - Open Graph Preview API & Dashboard

LinkSnap is a high-performance Open Graph metadata extraction API and fully-featured Developer Dashboard built with Next.js 15. Paste a URL and extract the title, description, high-res image, and favicon natively in milliseconds.

## Features Completed
- **Rich Preview Cards:** Visualizes Open Graph and Twitter Card metadata perfectly.
- **Preview History:** Full local history with collection grouping, tagging, and search functionality.
- **Public API Endpoint:** Returns structured JSON natively with fallback logic for missing tags.
- **API Dashboard:** Full developer portal simulating API Key generation, origin bounding, request tracking, and live interactive API scraping.
- **Embed Snippet Generator:** Copy an `iframe` tag to embed any generated preview natively on an external site.
- **Batch Processing:** Enter dozens of URLs line-by-line to process them concurrently in the dashboard.
- **Split Deployment Architecture:** The frontend UI can be hosted on Vercel while the compute-heavy `/api/preview` endpoint can be decoupled onto Railway simply by providing a `NEXT_PUBLIC_API_URL` environment variable.

## Setup & Local Development

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the Landing Page, and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the API portal.

## AI Collaboration & Prompts
All AI prompts used to scaffold and iterate on this system have been documented in the `prompts/` directory to fulfill the evaluation criteria.

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for deeper insights into the Cheerio extraction pipeline, selector fallback priorities, and deployment configurations.
