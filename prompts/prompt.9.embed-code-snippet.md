# Prompt 9: embed code snippet

**Act as an expert Next.js and React Developer.**

Please help me build the 'embed code snippet' feature for my LinkSnap application.

### Context:
Build an embed code generation widget in the dashboard to let users copy HTML snippets for external websites.

## Requirements
- Render a code block displaying a standard `<iframe>` HTML element.
- The `src` attribute of the iframe must point to your `/embed` endpoint with the URL parameter properly escaped.
- Add an interactive copy-to-clipboard button with visual state feedback (e.g. checkmark icon and "Copied" toast).
