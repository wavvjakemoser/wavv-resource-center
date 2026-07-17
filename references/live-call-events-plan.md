# CMS-Managed Live Call Events — Implementation Plan

## Current State (Before)
- Live calls are hardcoded in `SCHEDULE` array in both `AcceleratorSession.tsx` and `Accelerator.tsx`
- Each entry: `{ id, week, sessionInWeek (1|2), label, utcMs, joinUrl? }`
- 12 total sessions: 2 per week × 6 weeks, starting Jul 21 2026, Tue+Thu 12pm MT (18:00 UTC)
- The `accelerator_sessions` table has week-level `joinUrl`, `registrationUrl`, `sessionDateTime` fields (single per week)
- Hero countdown in `Accelerator.tsx` uses `useAcceleratorSchedule()` hook which reads from SCHEDULE array
- SessionCallCard in `AcceleratorSession.tsx` renders per-call cards from SCHEDULE array

## New Architecture (After)
### New DB Table: `accelerator_live_calls`
```sql
CREATE TABLE accelerator_live_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_number INT NOT NULL,          -- 1-6 (maps to week/session)
  call_number INT NOT NULL DEFAULT 1,   -- 1 or 2 (which call in the week)
  title VARCHAR(255) NOT NULL,          -- e.g. "Session 1 · Call 1 of 2"
  description TEXT,                     -- short description for the card
  scheduled_at TIMESTAMP NOT NULL,      -- UTC datetime of the call
  duration_minutes INT NOT NULL DEFAULT 90,
  registration_url TEXT,                -- Zoom registration link
  join_url TEXT,                        -- Zoom join link
  thumbnail_url TEXT,                   -- custom thumbnail for the card
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW() NOT NULL
);
```

### tRPC Procedures (in accelerator router)
- `accelerator.listLiveCalls` — publicProcedure, input: { sessionNumber?: number }, returns all visible live calls
- `accelerator.createLiveCall` — publisherProcedure, creates a new live call event
- `accelerator.updateLiveCall` — publisherProcedure, updates an existing live call event
- `accelerator.deleteLiveCall` — publisherProcedure, deletes a live call event

### Admin CMS (in Admin.tsx AcceleratorTab)
- New "Live Call Events" section in the session content area
- Form fields: Title, Description, Scheduled At (date/time picker), Registration URL, Join URL, Thumbnail (upload or URL)
- List of existing live calls per session with edit/delete

### Frontend Changes
- `AcceleratorSession.tsx`: Replace SCHEDULE-driven SessionCallCard with DB-driven cards
  - Fetch `trpc.accelerator.listLiveCalls.useQuery({ sessionNumber: weekId })`
  - Render webinar-style cards (thumbnail header, title, description, date, Register + Join buttons)
  - Digit box countdown (already implemented) uses `scheduledAt` from DB
- `Accelerator.tsx`: Replace SCHEDULE-driven `useAcceleratorSchedule()` with DB query
  - Fetch all live calls, find next upcoming/live, compute countdown
  - Hero countdown uses DB events

### Key Constants
- JOIN_WINDOW_MS = 15 * 60 * 1000 (15 minutes before)
- CALL_DURATION_MS = 90 * 60 * 1000 (default, but now per-event via duration_minutes)

### Webinar Card Style Reference (from Dashboard.tsx lines 461-545)
- Thumbnail header block with badge overlay
- Title + description + host + date/time body
- Register CTA button (always visible, greyed when no URL)
- Join button (greyed until 15 min before, active during call)
- Asterisk note: "* Join button opens 15 minutes before session"

### Files to Modify
1. `drizzle/schema.ts` — add acceleratorLiveCalls table
2. `server/db.ts` — add CRUD helpers
3. `server/routers.ts` — add tRPC procedures
4. `client/src/pages/Admin.tsx` — add Live Call Events CMS section
5. `client/src/pages/AcceleratorSession.tsx` — rewrite SessionCallCard, remove SCHEDULE
6. `client/src/pages/Accelerator.tsx` — update useAcceleratorSchedule to use DB

### Existing Session-Level Fields to Keep (for now)
- `registrationUrl` on accelerator_sessions — can be deprecated later but keep for backward compat
- `joinUrl` on accelerator_sessions — same
- `sessionDateTime` on accelerator_sessions — same
These will be superseded by per-call records but don't need to be removed immediately.
