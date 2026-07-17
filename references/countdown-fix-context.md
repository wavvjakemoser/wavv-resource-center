# Countdown Fix Context

## Issue 1: Session Detail Page Error (FIXED)
- Root cause: React hooks ordering violation in AcceleratorSession.tsx
- `listLiveCalls` queries were called AFTER conditional returns (loading/not-found/no-access)
- Fix: Moved queries above the conditional returns (lines 436-437)

## Issue 2: Countdown Clock Missing on Accelerator Landing Page
- Root cause: The `accelerator_live_calls` table is empty (no events created yet)
- `useAcceleratorSchedule` hook returns `{ status: "done" }` when liveCalls array is empty
- The countdown IS rendered in the hero (line 682) which is shared by both member and non-member views
- It's in the main hero box (line 633-750) which renders regardless of hasAccess
- The hero section is NOT conditionally hidden for non-members

## What needs to happen:
1. The countdown should show a "No events scheduled yet" state when DB is empty (not "All sessions complete")
2. OR better: fall back to the old `sessionDateTime` field from `accelerator_sessions` table when no live calls exist
3. The user needs to create live call events via CMS admin for the countdown to work properly

## Current LiveCallCountdown behavior:
- Line 335-448 in Accelerator.tsx
- When `isDone` (status === "done"): shows "All sessions complete. Recordings available..."
- When `countdown` exists: shows the digit boxes
- The "done" state is triggered when liveCalls is empty OR all calls are in the past

## Fix approach:
- When liveCalls is empty, fall back to `sessionDateTime` from `accelerator_sessions` (dbSessions)
- This preserves backward compatibility until live call events are populated via CMS
