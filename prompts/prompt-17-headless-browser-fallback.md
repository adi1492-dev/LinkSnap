# Prompt 17: Headless Browser Scraper Fallback

## Objective
Update the server-side extraction pipeline in `lib/og-parser.ts` to support scraping metadata from client-side JavaScript-rendered pages using a headless browser service.

## Requirements
- Introduce a fallback mechanism that triggers if standard cheerio extraction returns an empty title or description.
- Query the free Microlink headless browser service (`https://api.microlink.io/?url=...`) to retrieve the fully-rendered page metadata.
- Merge the returned logo, date, publisher, and image data with the parsed Open Graph objects.
- Ensure that network failures on the headless browser query fail gracefully and fall back to standard cheerio values.
