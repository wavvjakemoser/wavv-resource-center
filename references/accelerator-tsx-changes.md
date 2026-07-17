# Accelerator.tsx Changes Needed

## Current State
- Lines 25-86: Hardcoded SCHEDULE array + useAcceleratorSchedule() hook + formatCountdown()
- Lines 341-459: LiveCallCountdown component (uses useAcceleratorSchedule)
- Lines 462-573: UpcomingCallsList component (uses SCHEDULE directly)
- The SESSIONS array (lines 101-150) is NOT being removed — it's static session metadata (titles, colors, etc.)

## What to Replace
1. **Remove SCHEDULE array** (lines 28-47) — replaced by DB query
2. **Remove JOIN_WINDOW_MS and CALL_DURATION_MS constants** — keep them but they're now used with DB data
3. **Rewrite useAcceleratorSchedule()** to use `trpc.accelerator.listLiveCalls.useQuery({})` instead of SCHEDULE
4. **Rewrite UpcomingCallsList** to use DB query instead of SCHEDULE

## Key Details
- `useAcceleratorSchedule()` returns: `{ status: "upcoming"|"live"|"done", next/current: session, secondsLeft, hasPast }`
- `LiveCallCountdown` uses this to show digit boxes + CTA button
- `UpcomingCallsList` shows next 6 upcoming calls with countdown text + join buttons
- Both reference `SESSIONS` array for colors (via `sessionRef.week` → `SESSIONS.find(s => s.id === weekNum)`)

## Important: Hook Rules
- `useAcceleratorSchedule()` is called at the top of `LiveCallCountdown` component
- It uses useState + useEffect + useMemo internally
- The new version needs to accept live call data as a parameter (can't use hooks conditionally)
- OR: make it a standalone hook that fetches its own data

## Approach
- Replace `useAcceleratorSchedule()` to accept `liveCalls` array parameter (from parent query)
- In the main `Accelerator` component, add `trpc.accelerator.listLiveCalls.useQuery({})` 
- Pass the data down to `LiveCallCountdown` and `UpcomingCallsList`

## Files Already Done
- AcceleratorSession.tsx: ✅ Fully converted to DB-driven
- Admin.tsx: ✅ CMS form added
- drizzle/schema.ts: ✅ Table added
- server/db.ts: ✅ CRUD helpers added
- server/routers.ts: ✅ tRPC procedures added
