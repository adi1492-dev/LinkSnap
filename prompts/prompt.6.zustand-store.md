# Prompt 6: zustand store

**Act as an expert Next.js and React Developer.**

Please help me build the 'zustand store' feature for my LinkSnap application.

### Context:
Establish a persistent client-side state store using Zustand in `lib/store.ts` to manage link history, tags, and collections offline.

## Requirements
- Define interfaces for `PreviewData` and `HistoryItem`.
- Set up a Zustand store using `persist` middleware to save state in the browser's `localStorage` automatically.
- Implement actions to:
  - Add previews to history (avoiding duplicate URLs).
  - Remove items from history.
  - Update items with custom collection names and tags.
