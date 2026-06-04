# Prompt 07: Embed Code Snippet Generator

## Objective
Build an embed code generation widget in the dashboard to let users copy HTML snippets for external websites.

## Requirements
- Render a code block displaying a standard `<iframe>` HTML element.
- The `src` attribute of the iframe must point to your `/embed` endpoint with the URL parameter properly escaped.
- Add an interactive copy-to-clipboard button with visual state feedback (e.g. checkmark icon and "Copied" toast).
