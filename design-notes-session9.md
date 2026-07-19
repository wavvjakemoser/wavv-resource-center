# AcceleratorSession Sub-Page Redesign Notes (Session 9)

## Target Layout (from Academy Onboarding screenshot - 4th image)
- Back link at very top: "< WAVV Academy" (in our case: "< Back to Session 1 Overview")
- Full-width banner header: dark background, "WAVV ACADEMY" label in blue, "Onboarding" title bold white, subtitle gray, stats badges (5 sections, 9 videos)
- Below banner: numbered list rows, each is a full-width dark bar with:
  - Left colored accent edge (blue in Academy)
  - Numbered title: "1. Welcome To The Onboarding Section"
  - Right side: "1 video" count + chevron down to expand
  - Rows are collapsible (expand to show videos inside)

## Adaptation for Accelerator Sub-Pages

### Live Calls sub-page
- Banner header: blue (#0074F4), full-bleed live calls icon
- List rows (NOT cards): each live call event as a row
  - Title: "WAVV x Prospecting On Demand Session 1, Call 1"
  - Date/time on the right
  - Countdown timer (digital clock style) counting down to scheduledAt
  - Register button (colored) + Join button (grayed out until 15min before)
  - Join button activates 15 min before session

### Product Training sub-page  
- Banner header: cyan (#00A9E2), full-bleed product training icon
- List rows: each training video as a row
  - Title: "WAVV Product Training 1.1"
  - Host name on right or below
  - Watch button (opens video player) — if video available
  - "Coming Soon" badge if comingSoon=true

### Recordings sub-page
- Banner header: green (#67C728), full-bleed recordings icon
- List rows: each recording as a row
  - Title: "WAVV x Prospecting On Demand Session 1, Call 1 Recording"
  - Watch button (opens video player) — if video available
  - "Coming Soon" badge if comingSoon=true

## Key Differences from Current Implementation
- REMOVE the 2-column card grid
- REPLACE with full-width stacked rows (like Academy sections)
- Each row has a left accent color bar matching the section color
- Rows can optionally expand (chevron) to show description/details
- Keep the SubPageBanner at top (already built)
- Live calls: ADD countdown timer per row
