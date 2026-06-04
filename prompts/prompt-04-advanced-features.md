# Prompt 04 - Advanced Features & Architecture Refactoring

**User Request:**
"ok create a landing page for it and i am deploying backend on railway and frontend on vercel so also make changes according to that make api dashboard more advance and make the app more advance"

**AI Action Plan & Implementation:**
1. **Architecture Split (Railway/Vercel):** We updated `app/api/preview/route.ts` to include an `OPTIONS` method handler and explicit `Access-Control-*` CORS headers. We updated client `fetch` calls to rely on `process.env.NEXT_PUBLIC_API_URL` so the Vercel frontend can safely ping the remote Railway backend instance.
2. **Advanced UI (Landing Page):** We built a completely custom `app/page.tsx` landing page featuring a sleek `slate-950` dark mode, interactive code blocks, and a `framer-motion` hero section.
3. **Advanced App Features (Batch Processing):** We added a "Batch Mode" toggle to the dashboard previewer allowing users to paste multiple URLs line-by-line. The client handles parallel/sequential requesting to the API and renders a grid of Open Graph preview cards.
4. **Dashboard Reskin:** The user noted the dashboard light theme didn't match the new landing page dark theme. We created a custom Node `reskin.js` script to systematically replace all `bg-white` and `gray-*` Tailwind utility classes across the 1350-line `app/dashboard/page.tsx` file with corresponding `slate-900` dark theme variants.

**Challenges & Fixes:**
During implementation, compiling the production build (`npm run build`) conflicted with the actively running local dev server by invalidating the `.next` cache. The dev server started throwing 404s for chunked `.css` resources, causing a temporary "white screen" error. We used a browser-subagent to diagnose the issue and subsequently rebooted the `npm run dev` task to cleanly regenerate the development chunks.
