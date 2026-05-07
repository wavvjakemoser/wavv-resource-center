# WAVV Resource Center - TODO

## Database & Backend
- [x] Define full database schema (courses, lessons, progress, webinars, guides, tickets, analytics)
- [x] Run schema migrations
- [x] Seed initial WAVV Academy content (courses + lessons from GHL)
- [x] Seed initial webinars (upcoming + past recordings)
- [x] Seed initial guides & docs
- [x] tRPC router: Academy (courses, lessons, progress)
- [x] tRPC router: Webinars (list, register, watch)
- [x] tRPC router: Guides & Docs (list, download)
- [x] tRPC router: Support (submit ticket, list tickets)
- [x] tRPC router: WAVV AI (chat with LLM, WAVV knowledge base)
- [x] tRPC router: Analytics (track events, get stats)
- [x] tRPC router: Admin (CRUD for all content types)
- [x] Owner notification on new support ticket submission

## Frontend - Core
- [x] WAVV brand theme (dark #121212, blue #0074F4, green #67C728, light blue #00A9E2)
- [x] Global CSS variables and typography (Inter/sans-serif)
- [x] WAVV logo in header
- [x] Auth-gated layout with sidebar navigation
- [x] Login/landing page for unauthenticated users
- [x] Dashboard overview page with module cards and AI search bar
- [x] Responsive layout (mobile + desktop)

## Frontend - WAVV Academy
- [x] Academy landing page with course grid
- [x] Course detail page with lesson list and progress bar
- [x] Lesson viewer with video embed and completion tracking
- [x] Course categories: Onboarding, How-To, Strategy and Best Practices, Dialer Setup, CRM Integrations, Spam Protection
- [x] Progress persistence per user per lesson
- [x] "Continue Learning" widget on dashboard

## Frontend - Webinars
- [x] Webinars page with Upcoming Live and On-Demand sections
- [x] Webinar registration flow (upcoming)
- [x] Webinar watch/embed (on-demand recordings)
- [x] Webinar metadata: title, host, date, views

## Frontend - Guides & Docs
- [x] Guides page with card grid
- [x] File download / view in new tab
- [x] Category/tag filtering

## Frontend - Support
- [x] Support hub page with 4 options (Live Chat, Help Center, Book a Call, Submit Ticket)
- [x] Support ticket submission form (subject, category, description, priority)
- [x] Ticket confirmation and history view
- [x] Automated notification to WAVV team on ticket submission

## Frontend - WAVV AI
- [x] Floating WAVV AI chat button (persistent across all pages)
- [x] Chat panel with message history and streaming responses
- [x] WAVV-specific system prompt (product knowledge, deflection logic)
- [x] AI search bar on dashboard overview

## Frontend - Admin Panel
- [x] Admin-only route (/admin)
- [x] Course management (create, edit, delete courses and lessons)
- [x] Webinar management (add upcoming, upload past recordings)
- [x] Guides management (upload, edit, delete)
- [x] User management (view users, promote to admin)
- [x] Analytics dashboard (course completions, ticket volume, webinar views)

## Testing
- [x] Vitest: Academy progress tracking
- [x] Vitest: Support ticket submission + notification
- [x] Vitest: Auth protection on protected routes
- [x] 24 tests passing across auth, academy, webinars, guides, support, admin, analytics, and WAVV AI

## UI Refinements (Round 2)
- [x] Login page: add WAVV logo top-left
- [x] Login page: change to email + password form (matching WAVV sign-in style)
- [x] Login page: remove "Learn About WAVV" button
- [x] Login page: add footer with © 2026, Privacy Policy, Terms of Service
- [x] Dashboard: replace Academy card icon with graduation cap

## UI Overhaul (Round 3)
- [x] Landing page: clean hero, no sign-in form visible on load
- [x] Landing page: Sign In button opens a modal overlay (not inline form)
- [x] Sign-in modal: WAVV official logo, email + password, matches WAVV brand screenshot
- [x] Use official WAVV logo SVG/PNG from wavv.com branding
- [x] Full WAVV brand polish across nav and landing page

## Auth Overhaul (Round 4) - Native Email/Password
- [x] Add password_hash column to users table
- [x] Add email_verified, is_active columns to users table
- [x] Build server-side auth: hashPassword, verifyPassword, createSession, validateSession
- [x] Add tRPC procedures: auth.login, auth.logout, auth.me (no Manus OAuth)
- [x] Build admin user management: create/invite users with temp password
- [x] Update PortalLayout to use new session-based auth (not Manus OAuth)
- [x] Update Home.tsx sign-in modal to POST credentials to new auth endpoint
- [x] Remove all getLoginUrl() / Manus OAuth references from frontend
- [x] Seed initial admin user (jake@wavv.com) for first login

## Demo Mode
- [x] Add demo bypass: any credentials accepted, logs in as a demo user for portal review

## UX Polish
- [x] Add thin yellow demo environment banner at top of portal (inside authenticated layout)

## Copy Updates (Round 5)
- [x] Landing page: rename title to "WAVV Success Center"
- [x] Landing page: remove "AI-powered support" from subheadline
- [x] Landing page: change "Instant support tickets" to "Create support tickets"

## Feature Additions (Round 6)
- [x] AI-powered search bar in portal top bar (sparkle icon, searches Academy/Webinars/Guides)
- [x] Trophy Case: user achievement badges for completed courses, lessons, and milestones
- [x] Trophy Case accessible from top bar via Trophy Case button

## Hero Copy & Visual Updates (Round 7)
- [x] Hero: replace feature pills with exactly 4 items: Self-Service Learning, Progress Tracking, AI-Powered Answers, On-Demand Recordings
- [x] Hero: apply blue-to-green gradient across all words in "WAVV Success Center" headline

## PortalLayout Redesign (Session 2)

- [x] Move demo banner above top nav (not overlapping content)
- [x] Widen AI search bar; placeholder = "Search for learning content"; keep "WAVV AI" label inside box
- [x] Add notifications bell icon to top bar (top right)
- [x] Add user avatar/initials button to top bar (top right)
- [x] User avatar dropdown: Profile, Account Settings, History, Trophy Case, Bookmarks, Sign Out
- [x] Remove "Help" section/button from top bar
- [x] Sidebar: rename "Overview" to Home icon only (no text label)
- [x] Sidebar nav items exactly: Home, Academy, Webinars, Guides & Docs, Support (each navigates to page)
- [x] Remove Admin Panel from sidebar nav (keep page accessible via URL)
- [x] Quick Links: replace "WAVV App" with "Chrome Extension"
- [x] Quick Links: remove "Help Center" link

## UI Refinements Round 3 (Session 2 cont.)

- [x] Fix sidebar logo: "Success Center" text truncation — ensure it fits without clipping
- [x] Remove sidebar user footer (name/email/avatar) — already shown in top-right dropdown
- [x] Search bar: replace WAVV AI label + sparkle icon with magnifying glass icon only
- [x] Move WAVV AI button to right of search bar in top bar (opens chat widget on click)
- [x] Rename "Trophy Case" to "Medals" everywhere (dropdown, modal title, badge)
- [x] Add "Hands-On" nav item below Support in sidebar (sandbox environment page)
- [x] Dashboard: replace resources/courses grid with personal usage stats panel
  - Logins (last week / month / year-to-date)
  - Total searches made
  - Total AI conversations started
  - Total open tickets
  - Registered webinars

## UI Refinements Round 4

- [x] Move notifications bell + avatar/name cluster to far right of top bar
- [x] Sidebar logo: show only WAVV logo, remove "Success Center" text
- [x] Remove Medals button from bottom-left of sidebar
- [x] Remove "WAVV AI is here to help" CTA banner from dashboard
- [x] Welcome banner: "Welcome {first name}!" + "Everything you need to succeed with WAVV starts here!"
- [x] Add "Continue Where You Left Off" section with 3 placeholder cards (last course/video/recording)

## Admin Analytics Dashboard

- [x] Create analytics_events table (event_type, user_id, resource_id, metadata JSON, timestamp)
- [x] Build server-side event logging helper (logEvent function)
- [x] Create admin-only tRPC procedures for aggregated analytics queries
- [x] Build /admin/analytics page with role-gating (admin only)
- [x] Dashboard cards: total sign-ins, active users (DAU/WAU/MAU), content views, searches, AI conversations
- [x] Charts: sign-ins over time, top content by views, user engagement trend
- [x] Time-range filter (7d / 30d / 90d / all time)
- [x] Wire event tracking into login flow
- [x] Wire event tracking into page views / content interactions
- [x] Wire event tracking into search and AI chat usage
- [x] Add admin nav item in sidebar (visible only to admin-role users)

## Admin Analytics Gaps (follow-up)

- [x] Add Searches stat card to admin analytics dashboard
- [x] Add page-view event tracking (client-side trackEvent on route changes)

## Self-Contained Auth (Replace Manus OAuth)

- [x] Add password_hash column to users table (migration) — already existed
- [x] Build server-side register procedure (name, email, password → hashed, create user, set session)
- [x] Build server-side login procedure (email, password → verify hash, set session) — already existed
- [x] Build WAVV-branded Login page (email/password form, link to register)
- [x] Build WAVV-branded Register page (name, email, password, confirm password)
- [x] Update routing: replace Manus OAuth redirect with local login/register pages
- [x] Update PortalLayout: remove Manus OAuth references, use local auth state
- [x] Preserve admin role gating for analytics dashboard
- [x] Session management via JWT cookie (same pattern, local credentials)

## CSV Export for Admin Analytics

- [x] Add CSV export button to admin analytics dashboard
- [x] Export includes: event counts, sign-in trend, top content, summary stats

## Admin User Management

- [x] Add tRPC procedure: admin.listUsers (searchable by name/email, client-side filtering)
- [x] Add tRPC procedure: admin.updateUserRole (promote/demote user to admin/user)
- [x] Build /admin/users page with user table (name, email, role, registered date)
- [x] Add search/filter input to find users by name or email
- [x] Add one-click role toggle (admin/user) with confirmation
- [x] Add "Users" nav item under Admin section in sidebar (admin-only)
- [x] Register /admin/users route in App.tsx

## Academy Restructure + Sidebar Fix (Round 5)

- [x] Fix sidebar: make left nav fixed/sticky so it does not scroll with page content
- [x] Generate 3 WAVV-branded category thumbnails (Onboarding, How-To, Strategy & Best Practices)
- [x] Restructure Academy to exactly 3 categories: Onboarding, How-To, Strategy & Best Practices
- [x] Map all existing courses into the 3 categories
- [x] Add Trending / Recommended placeholder section at bottom of Academy page
- [x] Upload thumbnails to static assets and reference via CDN URL

## Admin Navigation Consolidation (Round 6)

- [x] Consolidate /admin/analytics and /admin/users into single /admin route with in-page tab switching
- [x] Sidebar Analytics and Users links navigate to /admin?tab=analytics and /admin?tab=users respectively
- [x] Tab selection syncs from URL query param so direct links work correctly
- [x] Sidebar stays fully static — no page navigation triggered when switching admin tabs

## Loom Videos + Visibility Toggle (Current Session)

- [x] Fix JSX error in AcademyCategory (dynamic Tag pattern → conditional anchor/div)
- [x] Brighten and bold course count badge on Academy category banners
- [x] Wire real Loom videos into Onboarding sections (9 videos across 6 sections)
- [x] Add is_visible (published boolean) field to lessons/videos in DB schema — already existed
- [x] Admin panel: add Active/Inactive toggle switch per video in course management
- [x] Admin panel: show inactive videos in a separate collapsible "Inactive" section
- [x] Public category pages: filter out inactive videos from display

## Content Status Management

- [x] Simplified to Active/Inactive only (needs_update → inactive with reason note)
- [x] Added inactiveReason text column to lessons table (migration applied)
- [x] updateLesson helper already accepts published + inactiveReason
- [x] adminUpdateLesson procedure updated to accept inactiveReason + title + description
- [x] Admin panel: Content Management tab showing all lessons with Active/Inactive sections
- [x] Admin panel: per-lesson Deactivate/Activate toggle with optional inactiveReason dialog
- [x] Inactive section shows all deactivated lessons with reason label for bulk review
- [x] Public category pages: filter out inactive lessons from display (getLessonsByCourse filters by published)
- [x] Inactive/reason is admin-only — no public indicator

## Banner Cleanup + Tags + NEW Badge

- [x] Academy.tsx: remove watermark/background text from banners ("Get started with WAVV", "Step-by-step guides", "Best Practices")
- [x] Academy.tsx: rename Strategy label to "Strategy & Best Practices"
- [x] Academy.tsx + AcademyCategory.tsx: swap Target icon to Lightbulb for Strategy
- [x] Add tags text column to lessons table (comma-separated preset tags), migrate
- [x] Update adminUpdateLesson tRPC to accept tags field
- [x] Admin Content tab: tag editor with preset pills (Most Popular, Must Watch, New, Featured, Spam Protection, Connection Rates)
- [x] AcademyCategory: display tag pills on video rows
- [x] AcademyCategory: auto-show NEW badge on videos added within last 30 days

## How-To + Strategy Video Content

- [x] Upload 3 PDFs to webdev storage (2a, 5a, 5b)
- [x] Wire How-To Loom URLs into AcademyCategory static data (8 videos, all available)
- [x] Wire Strategy Loom URLs into AcademyCategory static data (6 videos + 3 downloadable PDFs)
- [x] Auto-apply "Most Popular" tag to Connection Rates section videos in DB
- [x] Add downloadable file support to video rows (PDF download button with label)
- [x] Update DB lesson titles to match new static titles for How-To and Strategy

## Academy Banner Restore

- [x] Restore thumbnail+gradient overlay banners on Academy.tsx category cards (with correct labels/icons, no watermark)
- [x] Restore thumbnail+gradient overlay on AcademyCategory.tsx hero (with correct labels/icons)

## Trending Section Fix

- [x] Remove auto-populated tag pills from Trending section on homepage

## Profile Dropdown Redesign

- [x] Remove "Account Settings" from profile dropdown
- [x] Add full Profile page: name, email, avatar upload, activity history, analytics
- [x] Move "Your Activity" from homepage to profile dropdown/page
- [x] Profile dropdown shows name + email at top

## Homepage Cleanup + New Sections

- [x] Remove "Your Activity" section from homepage
- [x] Keep "Pick up where you left off" section on homepage
- [x] Add "New Releases" section to homepage
- [x] Add "Recommended" section to homepage
- [x] Move Trending from sidebar nav to homepage section

## Admin Enhancements

- [x] Admin: full tag CRUD — add custom tags, remove tags from videos, delete tags from DB
- [x] Admin: edit video URL and title inline
- [x] Admin: edit/replace downloadable files per video (fileUrl field in LessonRow edit form)
- [x] Admin: hide/show entire sections or categories (SectionVisibilityPanel in ContentTab)
- [x] Admin: hide/show individual videos (via Active/Inactive toggle — already existed)

## Academy Banner + Dropdown Cleanup (Round 2)

- [x] Academy.tsx banners: labels read "Onboarding", "How-To", "Strategy" (no subtitle), icon on RIGHT side only
- [x] Remove "Your Activity" from profile dropdown (it's accessible via Profile page)

## Admin Content Restructure

- [x] Add tags column to courses table (section-level tags), migrate DB
- [x] Update adminUpdateCourse tRPC to accept tags field
- [x] Admin Content tab: reorganize by Category > Section (course) > Video (lesson) hierarchy
- [x] Admin: section-level tag editor (same preset pills as lesson tags) on each course/section row
- [x] Admin: section tags display on the section header in view mode

## Content Filtering + Bookmarking

- [x] AcademyCategory: add filter bar to filter videos by tag (Most Popular, Trending, custom tags, Bookmarked)
- [x] DB: bookmarks table (userId, lessonId/videoTitle, category), migrate
- [x] Add bookmark tRPC procedures: toggle, list
- [x] AcademyCategory: bookmark icon on each video row (toggle on click)
- [x] Profile page: show bookmarked content in a dedicated section
- [x] Filter bar includes "Bookmarked" filter option

## Banner + Admin Layout Fix (Batch 4)
- [x] Upload 3 provided geometric banner images to webdev storage
- [x] Academy.tsx: use uploaded images as banner backgrounds (rocket/checklist/chevron)
- [x] Academy.tsx: banner labels read "Onboarding", "How-To", "Strategy & Best Practices"
- [x] Academy.tsx: restore color-coded section/video count badges on category cards
- [x] Academy.tsx: icon on right side, no subtitle text
- [x] Admin content tab: restructure to exactly mirror Academy layout (same category/section/video order)
- [x] Admin SectionRow2: color-coded video count badge (blue pill for count, red pill for Hidden status)

## Count Consistency Fix (Strategy & Best Practices)

- [x] Audit DB courses for Strategy category — identify which courses are canonical vs extra
- [x] Fix Academy.tsx banner count badges to use static CATEGORY_DATA counts (3 sections, 8 videos for Strategy)
- [x] Fix AcademyCategory.tsx static data: removed duplicate str-3-4, replaced str-3-5b with Intermediate Foundational Setup
- [x] Fix Admin panel: canonical course filter per category; Spam Protection moves to Legacy/Extra block

## WAVV Playground Update
- [x] Rename "Hands-On Sandbox" page title to "WAVV Playground"
- [x] Update sidebar nav label from "Hands-On" to "WAVV Playground" (already was set)
- [x] Change section header from "PLANNED SANDBOX TOOLS" to "PLANNED WAVV PLAYGROUNDS"
- [x] Replace 4 cards with 3: WAVV Dialer Playground, WAVV Call Boards Playground, WAVV Settings Playground
- [x] Replace bottom CTA banner with inline feature request form (name, email, playground interest, message)
- [x] Add tRPC procedure for feature request submission (stores to DB + notifies owner)
- [x] Add playground_requests table to schema (migration applied)

## WAVV Playground Modal + Admin Dashboard
- [x] Replace inline form with modal dialog (CTA button → popup form → submit)
- [x] Clean up bottom section to simple headline + description + "Notify Me" button
- [x] Add tRPC query for playground request analytics (total requests, per-playground breakdown, recent submissions)
- [x] Add Playground tab in Admin.tsx with stats cards, bar chart, and request list table

## Admin Tab Restructure
- [x] Rename "Content" tab to "WAVV Academy" (keep all existing ContentTab logic)
- [x] Add "WAVV Webinars" admin tab with webinar CRUD management (create/edit/delete, view count)
- [x] Add "WAVV Guides & Docs" admin tab with guide CRUD management (create/edit/delete, download count, published toggle)
- [x] Move Support ticket management into "WAVV Playground" tab (alongside playground requests/analytics)
- [x] Add CSV export button to Playground tab request list (downloads playground-requests.csv)
- [x] Add "Most Requested" badge to top playground card on HandsOn.tsx (driven by live DB stats)

## Landing Page + Export + Webinar Restructure
- [x] Landing page: rename feature cards to "WAVV Guides & Docs", "WAVV Playground", "WAVV Support"
- [x] Admin Webinars tab: add CSV export of webinar registrants (name, email, webinar title, date registered)
- [x] Admin Guides tab: add CSV export of guide downloaders (name, email, guide title, date downloaded)
- [x] Admin Playground & Support tab: add CSV export of support ticket submitters (name, email, subject, category, date)
- [x] Add tRPC admin procedures: getWebinarRegistrantsExport, getGuideDownloadersExport, getSupportSubmittersExport
- [x] Webinars page: restructured into 3 sections — Upcoming Exclusive, Evergreen, On-Demand Recordings
- [x] DB: extended webinars type enum to include exclusive/evergreen (migration applied)
- [x] Admin Webinars tab: type selector updated (Upcoming Exclusive, Evergreen, On-Demand Recording, Upcoming Legacy)
- [x] Webinars page: Upcoming Exclusive section with amber accent and empty state
- [x] Webinars page: Evergreen section with 5 seeded webinars in a 3-col grid
- [x] Webinars page: On-Demand Recordings section with 3 existing recordings

## Admin 7-Tab Reorder + Webinar Tabs + Evergreen Countdown
- [x] Admin: reorder to 7 tabs — Advanced Analytics, Users, WAVV Academy, WAVV Webinars, WAVV Guides & Docs, WAVV Playground, WAVV Support
- [x] Admin: split WAVV Support into its own dedicated tab (SupportTab component)
- [x] Admin: renamed Playground tab to "WAVV Playground" (no more support tickets inside it)
- [x] Webinars page: 3-section tab bar (Upcoming Exclusive | Evergreen Webinars | On-Demand Recordings)
- [x] Webinars page: clicking a tab shows only that section's content
- [x] Seed 8 evergreen webinar placeholders with rolling 30-min schedule (IDs 30006-30013)
- [x] Evergreen cards: live countdown clock to next session start (updates every second, staggered per card)

## Webinar Tab Reorder + Shared Countdown Fix
- [x] Reorder Webinars tabs: Evergreen Webinars → Upcoming Exclusive Webinars → On-Demand Recordings
- [x] Rename "Upcoming Exclusive" tab to "Upcoming Exclusive Webinars"
- [x] Fix all 8 evergreen cards to share one unified countdown clock synced to :00 and :30 of each hour
- [x] Removed per-card staggered countdown logic; all cards use sharedNextSession = nextHalfHour()

## Evergreen Color Palette + Gold Exclusive Accent
- [x] Add `accentColor` column to webinars table (varchar 20, nullable) — migration applied
- [x] Update 8 evergreen webinar records with per-topic colors (Dialer=blue, Boards=green, Settings=purple, Spam=amber, Wallet=teal, Dialer Options=indigo, Connection Rates=orange, Onboarding=emerald)
- [x] Update WebinarCard to use webinar.accentColor when present, fallback to section default
- [x] Change Upcoming Exclusive section accent from amber #F59E0B to gold #D4AF37

## Webinar Card Polish + Header Gradient
- [x] Fix evergreen countdown bar to use per-card accentColor instead of hardcoded blue
- [x] Generate 8 WAVV-branded webinar thumbnails (one per topic, matching accent color)
- [x] Upload thumbnails and wire to webinar DB records via thumbnailUrl
- [x] Apply blue-to-green gradient to all section page headers (WAVV Webinars, WAVV Academy, etc.)

## Webinar Card + Banner Fixes (Round 2)
- [x] Move countdown timer from overlay on thumbnail to below the thumbnail (separate row, not covering image)
- [x] Generate new Call Boards webinar thumbnail (kanban/board layout style, green accent)
- [x] Upload and update DB thumbnail_url for Call Boards webinar (ID 30007)
- [x] Regenerate Strategy & Best Practices Academy banner with glowing lightbulb (not chart/arrow)
- [x] Upload and update Academy.tsx + AcademyCategory.tsx with new strategy banner path

## Landing Page + Sign-In Overhaul (Round 3)
- [x] Landing page: force 5 feature cards into a single row (5-column grid, no wrap)
- [x] Sign-in modal: remove "Need access? Contact your WAVV rep" link
- [x] Sign-in modal: add "Continue with Google" button (Google OAuth)
- [x] Backend: Google OAuth tRPC procedure (exchange code → get profile → upsert user → create session)
- [x] Frontend: Google OAuth callback page / handler
- [x] Wire GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets

## Customer Gating + Auth Cleanup
- [x] Remove Google OAuth button from sign-in modal (deferred — no credentials available)
- [x] Keep Google OAuth backend code in place but dormant (activate when Client ID is available)
- [x] Document customer-gating strategy: active WAVV customer verification via API
- [ ] Future: wire WAVV customer status API to gate login (only active subscribers can access)
- [ ] Future: Google OAuth as secondary sign-in option once Client ID is available

## Sign-In Copy + Magic Link Architecture
- [x] Update sign-in modal subtitle to "Enter your WAVV account credentials to sign in"
- [ ] Future: magic link endpoint — WAVV platform embeds a one-click link that auto-authenticates active customers into the Resource Center

## Webinar Card Thumbnail Redesign
- [x] Remove thumbnail images from webinar cards — replace with clean dark gradient header showing title text only (no WAVV logo, no image clutter)

## Landing Page Card Style Refresh
- [x] Update feature cards on Home.tsx to match reference style: deep navy gradient background, colored rounded icon badges, blue accent title text, premium card feel

## Academy Banner Fixes
- [x] Remove small icon badge overlays from Academy category banners (rocket/wrench/lightbulb icons)
- [x] Fix gray/green right-side bleed on How-To and Strategy banners — add dark fade overlay so image blends into card background

## Academy Banner Regeneration
- [x] Regenerate How-To banner: neon wrench icon only, no baked-in text, dark background, matches Onboarding banner style
- [x] Regenerate Strategy banner: neon lightbulb icon only, no baked-in text, dark background, matches Onboarding banner style
- [x] Upload and update Academy.tsx with new banner paths

## Banner Text Restore
- [x] Restore category label + subtitle text overlay on Academy banners (How-To and Strategy) — keep clean icon image, add text back as overlay content

## Banner Ghost Text Style
- [x] Regenerate How-To banner with ghost/watermark text baked in (matching Onboarding style)
- [x] Regenerate Strategy banner with ghost/watermark text baked in (matching Onboarding style)
- [x] Remove React text overlay from banners (title/subtitle rendered by component), keep only section/video count badges
- [x] Upload and update Academy.tsx + AcademyCategory.tsx with new banner paths

## Banner Sizing Fix
- [x] Fix banner image sizing: all 3 banners must display at same zoom level as Onboarding (object-contain, fixed height, consistent across all categories)

## Banner Style Match (v2)
- [x] Regenerate How-To banner to exactly match Onboarding banner: same aspect ratio, same dark navy background, same large ghost text style, same neon icon placement, same font treatment
- [x] Regenerate Strategy banner to exactly match Onboarding banner: same style as above
- [x] Revert banner image rendering to object-cover so banners fill the space (not object-contain)

## Banner Sharpness + Label Overlays
- [x] Regenerate How-To banner (v6) with crisp white bold ghost text matching Onboarding contrast
- [x] Regenerate Strategy banner (v7) with crisp white bold ghost text matching Onboarding contrast
- [x] Add React text overlay to all 3 banners: accent-colored "WAVV Academy" label, bold white category name, gray subtitle, count badges

## Content Request Forms (3 Pages)

### DB + Backend
- [x] Add content_requests table: id, user_id, request_type (video/guide/webinar), topic, description, category, priority, created_at
- [x] Run schema migration
- [x] tRPC procedure: submitContentRequest (protected, stores to DB, notifies owner)
- [x] tRPC procedure: admin.getContentRequests (admin only, filterable by type)

### Academy — Video Request Form
- [x] Add "Request a Video" section at bottom of Academy page (below Trending This Week)
- [x] Form fields: Topic/Feature Area (dropdown), What do you want to learn? (textarea), Category (Onboarding/How-To/Strategy), Priority (Low/Medium/High)
- [x] Submit triggers owner notification with request details

### Guides & Docs — Written Guide Request Form
- [x] Add "Request a Guide" section at bottom of Guides & Docs page
- [x] Form fields: Topic (text), What problem are you trying to solve? (textarea), Format preference (Step-by-step / Reference / Checklist), Priority (Low/Medium/High)
- [x] Submit triggers owner notification with request details

### Webinars — Webinar Request Form
- [x] Add "Request a Webinar" section at bottom of Webinars page
- [x] Form fields: Topic (text), What do you want covered? (textarea), Preferred format (Live / Evergreen / Either), Priority (Low/Medium/High)
- [x] Submit triggers owner notification with request details

### Admin Panel
- [x] Add "Content Requests" tab (or sub-section) in Admin showing all 3 request types in a unified table
- [x] Table columns: Type badge, Topic, Description, Category, Priority, User, Date
- [x] CSV export of all content requests

## Content Request Forms — Modal Conversion
- [x] Refactor ContentRequestForm into a modal dialog (Dialog/DialogContent) triggered by a button
- [x] Add ContentRequestCTA component: compact strip with tagline text + "Request a Video/Guide/Webinar" button
- [x] Academy: replace inline form section with CTA strip ("Don't see what you need? Let us know what to build next." + "Request a Video" button)
- [x] Guides & Docs: replace inline form section with CTA strip + "Request a Guide" button
- [x] Webinars: replace inline form section with CTA strip + "Request a Webinar" button

## Evergreen Webinars — Production Checklist (Blocked on Content, Not Engineering)

UI is production-ready. Thumbnails, card layout, and CTA strip are finalized. The following steps must be completed before the Evergreen section can be fully wired with real content:

- [ ] Finalize all 8 webinar topics (confirm scope, audience, and JTBD for each)
- [ ] Finalize scripts for each webinar
- [ ] Finalize slide decks for each webinar
- [ ] Record all 8 webinars
- [ ] Launch recordings on a true Evergreen platform (e.g., Demio, EasyWebinar, or similar — platform TBD)
- [ ] Wire each live Evergreen URL into the webinar records in the DB (replace placeholder join links)

## Guides & Demo Stamp Updates

- [x] Trim Guides DB to exactly 3 docs: WAVV Quick Start Checklist, Connect and Rate Optimization Playbook, Spam Protection Best Practices
- [x] Add DEMO stamp to all 3 guide cards (same red rubber-stamp style)
- [x] Enlarge DEMO stamp on Webinar Exclusive/On-Demand cards to cover the full tile
- [x] Enlarge DEMO stamp on Playground tiles to cover the full tile
- [x] Swap Support sidebar icon from current to Headphones (lucide Headphones)
- [x] Swap Support page header icon to Headphones as well

## DEMO Stamp Softening

- [x] Webinars: DEMO stamp default 40% opacity, hover fades to 15% (200ms ease)
- [x] GuidesAndDocs: DEMO stamp default 40% opacity, hover fades to 15% (200ms ease)
- [x] HandsOn (Playground): DEMO stamp default 40% opacity, hover fades to 15% (200ms ease)

## Support Page Redesign

- [x] Remove "Book a Call" card from Support landing page
- [x] Reframe "Ask WAVV AI" card copy: "Get an instant answer before submitting a ticket"
- [x] Convert "New Ticket" from default open tab to modal dialog triggered by a button
- [x] Keep "My Tickets" as the default/main view on the Support page
- [x] Build Intercom integration scaffold: server-side POST to Intercom Conversations API when ticket is submitted (needs INTERCOM_API_KEY secret — BLOCKED on credentials)

## Admin Readiness Widget (5 Pages)

- [x] DB: page_readiness_items table (id, page, label, checked, sort_order, created_at)
- [x] Seed default checklist items for all 5 pages
- [x] tRPC: readiness.getItems(page) — admin only
- [x] tRPC: readiness.toggleItem(id) — admin only
- [x] ReadinessWidget component: floating bottom-right pill showing X/Y progress
- [x] Hover expands to full checklist with checkboxes, page label, and color-coded progress bar
- [x] Admin-only: hidden from non-admin users via useAuth() role check
- [x] Add widget to Academy, Webinars, GuidesAndDocs, HandsOn, Support pages

## Admin Academy Tab Cleanup + Loom Embedding

- [x] Remove duplicate "Voicemails" lesson from How-To course (keep 1, delete duplicate)
- [x] Consolidate course display in Admin to exactly 3 sections: Onboarding, How-To, Strategy & Best Practices
- [x] Admin Academy tab: tree view grouped by section → course → lesson
- [x] Per-lesson controls: edit video URL, add/edit tags, toggle hidden/visible, toggle starred
- [x] Per-course controls: edit title, description, reorder, hide/show
- [ ] Loom embed: update lesson viewer to embed Loom iframes (not redirect links) — BLOCKED on URLs from Jake
- [ ] Wire all Loom URLs into lessons once provided

## Admin Panel Tab Polish

- [x] Admin tabs: uniform size, font weight, padding across all tabs
- [x] Each tab has a correctly matched icon (GraduationCap=Academy, Video=Webinars, FileText=Guides, FlaskConical=Playground, Headphones=Support, BarChart=Analytics, Users=Users, MessageSquare=Content Requests)
- [x] Users tab: add UserCircle/person silhouette icon

## Support Page Redesign (Round 2)

- [x] Add "Chat with Support" as 3rd action card alongside Ask WAVV AI and Help Center
- [x] Chat with Support card: opens Intercom widget on click (window.Intercom('show')); graceful fallback toast if not configured
- [ ] Scaffold Intercom: load Intercom script via INTERCOM_APP_ID env var; wire into index.html or App.tsx — BLOCKED on INTERCOM_APP_ID credential
- [ ] Add INTERCOM_APP_ID to secrets (blocked on credential — scaffold only)
- [x] Consolidate My Tickets: replace large section + oversized empty state with compact inline bar (ticket count badge + New Ticket button)
- [x] My Tickets compact bar: clicking ticket count or "View All" expands a collapsible list below

## Support Page v3 + Profile My Tickets

- [x] Support page: replace current layout with 4 equal action cards (Ask WAVV AI, Help Center, Chat with Support, Submit a New Ticket)
- [x] Support page: remove My Tickets bar and ticket history entirely from Support page
- [x] Profile page: add "My Support Tickets" section showing ticket history with status/priority badges
- [x] Profile My Tickets: include New Ticket button to open submission modal from Profile

## User Dropdown Cleanup

- [x] Remove medals and bookmarks items from user dropdown in PortalLayout
- [x] User dropdown: keep only Profile and Sign Out

## Admin Panel Overhaul (Round 2)

### Webinars Tab
- [x] Admin Webinars: group webinars by type — Evergreen, Exclusive, On Demand (collapsible sections)
- [x] Each webinar group: add, edit, delete, toggle active actions

### Guides Tab
- [x] Admin Guides: group guides by type — PDF, Checklist, Playbook, Resource (collapsible sections)
- [x] Each guide group: same add/edit/delete/toggle actions as before

### Playground Tab
- [x] Replace Playground feature request form with "Notify Me" opt-in (name + email + which feature)
- [x] Restyle Playground CTA bar to match other form submission bars (dark bg, icon left, green button right)
- [x] Admin Playground tab: show opt-in list, export to CSV button

### Support Tickets Tab
- [x] Admin Support Tickets: group by category (Technical Issue, Billing, Feature Request, Onboarding, General Question, Other)
- [x] Each category group: collapsible with ticket count badge, View All toggle

### Content Requests Tab
- [x] Admin Content Requests: group by section (Video Requests, Webinar Requests, Guide Requests)
- [x] Each section group: collapsible with request count badge, View All toggle

## Admin Users Tab Overhaul

- [ ] Stat cards (Total Users, Admins, Standard Users) are clickable and filter the user table
- [ ] Auto-flag users with firstname.lastname@wavv.com pattern as "Pending Admin Promotion"
- [ ] Super admin can promote pending users to admin with one-click action
- [ ] Add Remove User action for all non-self users (with confirmation)
- [ ] Delete test users: Cassie (cassie@wavv.com) and duplicate jake@wavv.com from DB
- [ ] Keep only Jake Moser (jake.moser@wavv.com)

## 3-Tier Role System + Admin Users Overhaul

- [ ] Add super_admin to role enum in DB schema (users table)
- [ ] Migrate DB: ALTER TABLE users MODIFY role enum('super_admin','admin','user')
- [ ] Update routers.ts: superAdminProcedure gate for write operations; adminProcedure for read-only
- [ ] Admin panel: super_admin = full read+write; admin = read-only (no edit/delete/promote buttons); user = no access
- [ ] Add admin.removeUser procedure (super_admin only)
- [ ] UsersTab: clickable stat cards filter table (Total / Admins / Standard Users)
- [ ] UsersTab: auto-flag firstname.lastname@wavv.com pattern as "Pending Admin Promotion" badge
- [ ] UsersTab: super_admin can promote pending users to admin or super_admin
- [ ] UsersTab: Remove User action for all non-self users (super_admin only, with confirmation)
- [ ] DB cleanup: delete Cassie (cassie@wavv.com) and jake@wavv.com test users
- [ ] DB: set jake.moser@wavv.com role to super_admin

## Admin Academy Tab — Live/Inactive Restructure

- [x] Remove Legacy/Extra Courses block from Admin Academy tab
- [x] Admin Academy: 2 sections only — "Live Sections & Courses" and "Inactive Sections / Videos"
- [x] Live section: 3 category banners mirroring Academy landing page (same banners, subtitles, section/video count badges)
- [x] Each category banner shows: WAVV Academy label, bold title, subtitle, section count badge, video count badge
- [x] Inactive section: shows hidden courses (published=false) and deactivated videos (published=false) separately
- [x] Inactive section shows empty state when nothing is deactivated
- [x] DB restructured: each section is its own course row (17 total: 6 Onboarding, 8 How-To, 3 Strategy)

## Admin Academy — Delete, Rename, Hide, Inactive Grouping

- [x] Add adminDeleteLesson tRPC procedure (super_admin only, permanent delete)
- [x] Add adminDeleteCourse tRPC procedure (super_admin only, permanent delete — only if no lessons)
- [x] Inactive section: grouped by category (same 3 banners) showing unpublished courses/lessons per category
- [x] Delete button on inactive lessons (with confirmation dialog) — only visible when lesson is inactive
- [x] Delete button on inactive courses (with confirmation dialog) — only visible when course is inactive
- [x] Section inline rename: pencil icon → editable input → save (adminUpdateCourse title)
- [x] Section hide toggle: hide/show entire section (sets course published=false/true)
- [x] Remove star (starred) function from SectionRow2 and LessonRow UI

## Admin Academy — Visual Polish

- [x] Inactive section: make category banners collapsible (click to expand/collapse sections within)
- [x] Live Sections & Courses: increase banner height and font size for stronger visual presence
- [x] Inactive Sections: increase banner height; add clear visual separator (divider line + spacing) between Live and Inactive blocks

## Admin Stat Cards — Clickable Detail Drill-Down

- [x] Add getStatDetail tRPC procedure: returns event rows (userId, userName, userEmail, eventType, resourceType, resourceId, metadata, createdAt) filtered by eventType(s) and days
- [x] Make StatCard component accept onClick prop and render as clickable (cursor-pointer, hover ring)
- [x] Build StatDetailDrawer component: slide-out panel showing a table of individual event rows for the selected metric
- [x] Wire all 8 stat cards to open the drawer with the correct event type filter
- [x] Drawer shows: user name/email, event type, resource, timestamp — sortable by date

## DB Video Title Sync

- [x] Sync all 20 DB lesson titles to match exact titles on Academy landing page (AcademyCategory.tsx)

## Admin Self-Service: Create New, Reorder, Collapse, DB-Driven Academy

- [x] Admin Academy: all sections collapsed by default (expand on click)
- [x] Admin Academy: "Add Video" button per section to create a new lesson inline
- [x] Admin Academy: "Add Section" button per category to create a new course/section
- [ ] Admin Webinars: "Create New Webinar" button with full form (title, type, date, description, registration link, thumbnail URL)
- [ ] Admin Guides: "Create New Guide" button with full form (title, description, file URL, tags, category)
- [x] Admin Academy: up/down reorder arrows on sections (super_admin only) — updates sortOrder
- [x] Admin Academy: up/down reorder arrows on videos within a section (super_admin only)
- [ ] Admin Webinars: up/down reorder arrows on webinar list (super_admin only)
- [ ] Admin Guides: up/down reorder arrows on guide list (super_admin only)
- [x] Backend: add/verify sortOrder field on courses, lessons, webinars, guides tables
- [x] Backend: add reorderCourse, reorderLesson, reorderWebinar, reorderGuide tRPC procedures
- [ ] Migrate AcademyCategory.tsx: replace static CATEGORY_DATA array with DB query (trpc.academy.getCategories) — deferred, backend ready
- [x] Backend: add getCategories procedure returning courses grouped by category with their published lessons
- [ ] Ensure Academy page shows Loom embeds from DB loopUrl field (no external redirects) — blocked on Loom URLs from Jake

## Home Page Redesign (Round 8)

- [x] Hero: full-viewport layout with animated gradient orb/glow behind headline
- [x] Hero: asymmetric layout — headline left, visual element right (not centered column)
- [x] Hero: bold outcome-focused sub-headline
- [x] Hero: primary CTA with glow pulse animation; secondary "See what's inside" anchor
- [x] Feature cards: 3-column grid with large icons, bold labels, hover animated border
- [x] Social proof bar: inline stats row in hero (29 videos, 3 categories, 24/7 AI)
- [x] Bottom CTA band: full-width dark-to-blue gradient with sign-in button
- [x] Preserve all auth logic (login modal, form, mutations) exactly as-is

## Dashboard Redesign + Home Page Revert (Current Sprint)

- [x] Revert Home.tsx to original simple pre-login landing page (from git history)
- [x] Dashboard: hero banner taller with user name prominent + weekly progress strip (circular progress rings per category)
- [x] Dashboard: quick-access bar (5 icon tiles) moved inside hero, just below greeting
- [x] Dashboard: featured content section — 1 large hero card (2/3 width) + 2 smaller side cards
- [x] Dashboard: continue learning — 3 cards with progress bars (larger, more breathing room)
- [x] Dashboard: what's new — 2-column grid with description text and category labels
- [x] Dashboard: trending — colored rank badges + category labels; side-by-side with What's New (3/5 + 2/5 grid)
- [x] Dashboard: removed bottom Navigate tiles (replaced by quick-access bar in hero)

## Tags: Admin → User-Facing Reflection

- [ ] Audit tag data model: how tags are stored on courses/lessons in DB and returned by API
- [ ] AcademyCategory page: display section-level tags (e.g. "Most Popular") on section cards
- [ ] AcademyLesson / video cards: display lesson-level tags as colored badges (e.g. "NEW", "MUST WATCH", "MOST POPULAR")
- [ ] Ensure tags are included in the getLessonsByCourse and getCategories API responses

## Tags Wiring — Completed

- [x] Audit tag data model: tags stored as comma-separated text on courses/lessons tables
- [x] Add getCoursesByCategory tRPC procedure (returns published courses for a category, includes tags field)
- [x] AcademyCategory.tsx: call getCoursesByCategory, build dbCourseMap keyed by normalized section title
- [x] SectionRow: add courseTags prop; render colored tag pills on section header (same TAG_COLORS style as lesson tags)
- [x] Lesson-level tags already working via getLessonsByCategory + dbLessonMap

## Continue Learning — Real Data Wiring

- [x] Wire Dashboard Continue Learning to real DB progress data
- [x] Add empty state: "You're all caught up! Explore the WAVV Success Center for more helpful resources"

## Launch Readiness Pass

- [ ] Remove Guides & Docs from sidebar nav (PortalLayout)
- [ ] Remove Guides & Docs from Dashboard quick-access tiles
- [ ] Remove Guides & Docs route from App.tsx
- [ ] Remove fake progress rings from Dashboard hero (replace with "Start your first course" CTA)
- [ ] Create exclusive webinar in DB: "Always Know Who to Call with WAVV Call Boards" — May 14 11am MDT, gold accent
- [ ] Remove all On-Demand Recording webinar placeholders (DEMO-stamped) from DB and UI
- [ ] Remove all Exclusive webinar placeholders (DEMO-stamped) from DB and UI
- [ ] Replace all 8 evergreen webinar DB records with 6 clean "Coming Soon" placeholder cards (no DEMO stamps, no countdown)
- [ ] Support page: remove Chat With Support card
- [ ] Support page: remove Submit a New Ticket card
- [ ] Support page: remove My Tickets section / ticket history from Support page
- [ ] Support page: keep only AskWAVV AI card and Help Center card (2-card layout)
- [ ] Remove all ticket-related tRPC calls from Support.tsx UI (keep backend dormant)
- [ ] Admin — Webinars tab: verify "Create New Webinar" form is fully functional with all fields (title, type, date, host, description, registration URL, video URL, thumbnail URL, accent color picker)
- [ ] Admin — Webinars tab: ensure accent color picker is a real color input (not just text field)
- [ ] Admin — Academy tab: verify "Add Section" and "Add Video" flows work end-to-end
- [ ] Admin — Academy tab: verify edit/delete/reorder all work without developer involvement

## Guides & Docs — File Upload + Category System

- [ ] Add guides.upload tRPC procedure (accepts file buffer, stores in S3, returns masked URL)
- [ ] Add category dropdown to Admin Guides form (PDF, Checklist, Playbook, Resource)
- [ ] Add file upload input to Admin Guides form (PDF/DOCX/XLSX, max 16MB)
- [ ] Add file type selector to Admin Guides form (top 3: PDF, DOCX, XLSX — default PDF)
- [ ] Update user-facing GuidesAndDocs page to group cards by category with correct color coding

## Section Visibility Controls

- [ ] Add site_settings table to store webinar tab visibility and guides category visibility flags
- [ ] Add tRPC procedures: admin.getSiteSettings, admin.updateSiteSettings
- [ ] Admin Webinars tab: add visibility toggles for Evergreen / Exclusive / On-Demand sections
- [ ] Admin Guides tab: add visibility toggles for PDF / Checklist / Playbook / Resource sections
- [ ] User-facing Webinars page: hide tabs/sections where visibility = false
- [ ] User-facing Guides & Docs page: hide category sections where visibility = false

## Admin Improvements Batch (Current Sprint)

- [x] Academy Admin: full Add/Edit video form with Loom URL auto-embed, category + section assignment, create new section inline
- [x] Admin Support tab: large "under construction" banner replacing ticket content
- [x] Requests tab: break down by Academy / Webinars / Guides with per-category CSV export
- [x] Users tab: clickable user profiles with analytics, badges, revoke access, role promotion
- [x] Analytics: reset button with triple confirmation (zeros all data)
- [x] Playground notify opt-in: unchecked by default, Notify Me button grayed out until opted in

## Admin Improvements Batch 2 (Current Sprint)

- [x] Content Requests: simplify user-facing submission form to date/topic/description/user only (remove category, format, priority fields)
- [x] Content Requests: add Delete button per row in admin view (super_admin only, with confirmation)
- [x] Content Requests: add Flag/Strike button per row — marks user account with a strike, visible in User Profile modal
- [x] Content Requests: update DB schema to remove category/formatPreference/priority columns (or make optional/hidden)
- [x] Users tab: Add User button opens a form (name, email, role) — creates account directly
- [x] Academy Admin: confirmed Add Section and Add Video flows work end-to-end
