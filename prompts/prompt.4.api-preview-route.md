# Prompt 4: api preview route

**Act as an expert Next.js and React Developer.**

Please help me build the 'api preview route' feature for my LinkSnap application.

### Context:
Create the public API preview endpoint in `app/api/preview/route.ts` that acts as the gateway for metadata requests.

## Requirements
- Support GET requests with a `url` query parameter.
- Add formal URL scheme validations (ensure it starts with http/https).
- Configure standard CORS headers (`Access-Control-Allow-Origin: *`, allowed headers, and methods) to support client access.
- Wire up the parser to fetch metadata and return it in a structured JSON schema.
- Gracefully handle extraction errors by returning a standard error message and status code (500/400).
