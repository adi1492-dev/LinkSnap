# Prompt 08: Embed Page Implementation

## Objective
Implement a lightweight rendering page under the `/embed` path in `app/embed/page.tsx` that serves as the iframe source.

## Requirements
- Accept the target URL parameter from query string.
- Fetch metadata server-side using the extraction pipeline.
- Render a self-enclosed, mobile-friendly metadata card designed specifically for third-party websites.
- Apply inline styles or isolated classes to prevent stylesheet leaks and conflicts.
