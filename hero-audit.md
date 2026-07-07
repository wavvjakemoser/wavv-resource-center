# Hero Section Audit

## Current State (what needs to be standardized)

### Dashboard (Home) - `/` route
- File: Dashboard.tsx, lines 249-314
- Outer: `rounded-2xl`, `minHeight: "320px"`
- Inner padding: `py-10 sm:py-14 lg:py-18`
- NO spacer div before hero (no `minHeight: "32px"` spacer)

### Academy - `/academy`
- File: Academy.tsx, lines 306-345
- Has spacer: `<div style={{ minHeight: "32px" }} />` (line 307)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: `py-8 sm:py-12`

### Webinars - `/webinars`
- File: Webinars.tsx, lines 515-554
- Has spacer: `<div style={{ minHeight: "32px" }} />` (line 516)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: `py-8 sm:py-12`

### Resource Hub (GuidesAndDocs) - `/resourcehub`
- File: GuidesAndDocs.tsx, lines 520-531
- Has spacer: `<div style={{ minHeight: "32px" }} />` (line 521)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: (need to check, likely `py-8 sm:py-12`)

### Playground (HandsOn) - `/playground`
- File: HandsOn.tsx, lines 301-312
- Has spacer: `<div style={{ minHeight: "32px" }} />` (line 302)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: (need to check)

### Accelerator - `/accelerator`
- File: Accelerator.tsx, lines 233-344
- Has spacer: `<div style={{ minHeight: "32px" }}>` (line 234, wraps toggle)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: `py-8 sm:py-10` (DIFFERENT from others)

### Partners - `/partners`
- File: Partners.tsx, lines 232-330
- Has spacer: `<div style={{ minHeight: "32px" }}>` (line 233, wraps toggle)
- Outer: `rounded-2xl`, `minHeight: "280px"`
- Inner padding: `py-8 sm:py-12`

## Target Standard
- All heroes: `minHeight: "280px"` (Dashboard currently 320px — needs to match)
- All heroes: inner padding `py-8 sm:py-12 text-center`
- All pages: spacer `<div style={{ minHeight: "32px" }} />` before hero
- Accelerator inner: change `py-8 sm:py-10` → `py-8 sm:py-12`
- Dashboard: change `minHeight: "320px"` → `"280px"`, change `py-10 sm:py-14 lg:py-18` → `py-8 sm:py-12`, add spacer

## Partners CTA Button Text Fix
- Hero CTA says "Become a WAVV Partner" → change to "Apply Now"
- Bottom CTA already says "Apply Now" ✓
- Sticky bar says "Apply Now" ✓
- Popup says "Apply Now" ✓
