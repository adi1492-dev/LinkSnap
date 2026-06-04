# Prompt 5: state management

**Act as an expert Next.js and React Developer.**

Please help me build the 'state management' feature for my LinkSnap application.

**User Prompt:**
Add a history feature so users can see all the previews they've generated. Use `zustand` with `persist` middleware to store the history in `localStorage`. Allow users to search their history, add tags, and organize previews into collections. Update the UI to include a sidebar with tabs for "Preview Builder" and "History & Collections".

**AI Response:**
Created `lib/store.ts` using Zustand to manage the application state, including `history`, `apiKeys`, and user sessions. Updated `app/page.tsx` to include a sidebar navigation and split the UI into `HomeTab` and `HistoryTab`. Implemented the search and collection filtering logic in the history view.
