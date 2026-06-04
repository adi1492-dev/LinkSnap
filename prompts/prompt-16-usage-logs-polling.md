# Prompt 16: Usage Logger and Polling Stream

## Objective
Implement log streaming in `app/api/logs/route.ts` and set up active client-side dashboard polling to track request logs.

## Requirements
- Create `GET /api/logs?userId=...` which queries the `api_usage_logs` table (joined with keys) for the last 150 requests.
- Update Zustand store (`lib/store.ts`) actions to make async fetch requests to the logs endpoint.
- Configure `app/dashboard/page.tsx` with a `useEffect` polling loop (every 5 seconds) to fetch updated keys and logs.
- Map database snake_case fields to camelCase properties for standard frontend compatibility.
