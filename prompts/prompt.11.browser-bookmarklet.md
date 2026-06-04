# Prompt 11: browser bookmarklet

**Act as an expert Next.js and React Developer.**

Please help me build the 'browser bookmarklet' feature for my LinkSnap application.

### Context:
Provide an installation panel in the dashboard for a drag-and-drop browser bookmarklet to let users preview links from any site.

## Requirements
- Create a bookmarklet containing self-executing JavaScript (`javascript:(function(){...})()`).
- The script must create a floating overlay iframe on the current browser tab, pointing to your `/embed?url=` route.
- Include a red close button (`✕`) at the top right of the overlay tab to dismiss the overlay.
- Wrap the bookmarklet inside a visual drag button on the layout.
