# Prompt 02: Cheerio Parser Implementation

## Objective
Build a fast server-side HTML parser in `lib/og-parser.ts` to extract Open Graph and Twitter Card metadata from any webpage.

## Requirements
- Use standard `fetch` with a browser User-Agent header to download webpage HTML.
- Load the HTML tree using Cheerio for efficient memory-based querying.
- Extract title, description, high-res image, canonical URL, and favicon using hierarchical fallbacks:
  - **Title**: `og:title` -> `twitter:title` -> `<title>` tag -> first `<h1>`
  - **Description**: `og:description` -> `twitter:description` -> `<meta name="description">` -> first paragraph `<p>` text
  - **Image**: `og:image` -> `twitter:image` -> `<meta itemprop="image">` -> first `<img>` source
- Resolve relative image and favicon paths to absolute URLs using the request domain.
