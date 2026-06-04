# Prompt 1: Initial Setup and Architecture

**User Prompt:**
Create a Next.js 15 application using the App Router and Tailwind CSS for an Open Graph (OG) preview generator. The app should have a clean UI where I can paste a URL and it will fetch the OG metadata (title, description, image, domain, favicon). Use `cheerio` on the server-side to parse the HTML and extract the metadata. Make sure to handle fallbacks: if `og:image` is missing, try `twitter:image`, then the first `<img>` tag. If `og:description` is missing, try `twitter:description`, `<meta name="description">`, or the first `<p>` tag.

**AI Response:**
Created the basic Next.js project structure, added `cheerio` for parsing, and implemented the `lib/og-parser.ts` utility to fetch and parse the HTML with appropriate fallback selectors. Also created the initial UI in `app/page.tsx` with a simple input form to test the extraction.
