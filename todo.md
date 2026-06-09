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
- [x] Remove "Recommended for You" section from Dashboard (was duplicating Continue Learning content)
- [x] Redesign Dashboard exclusive webinar tiles: larger cards with thumbnail, description, host, date/time, and direct Register Now → link to registrationUrl (matches Webinars page card design)

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
- [x] Loom embed: update lesson viewer to embed Loom iframes — fixed getEmbedUrl to handle loom.com/embed/ passthrough; all 26 lessons have Loom embed URLs in DB
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

- [x] Add super_admin to role enum in DB schema (users table) — already in schema.ts
- [x] Migrate DB: ALTER TABLE users MODIFY role enum('super_admin','admin','user') — already applied
- [x] Update routers.ts: superAdminProcedure gate for write operations; adminProcedure for read-only — done in Batch 16
- [x] Admin panel: super_admin = full read+write; admin = read-only (no edit/delete/promote buttons); user = no access — done in Batch 16
- [ ] Add admin.removeUser procedure (super_admin only)
- [ ] UsersTab: clickable stat cards filter table (Total / Admins / Standard Users)
- [ ] UsersTab: auto-flag firstname.lastname@wavv.com pattern as "Pending Admin Promotion" badge
- [ ] UsersTab: super_admin can promote pending users to admin or super_admin
- [ ] UsersTab: Remove User action for all non-self users (super_admin only, with confirmation)
- [ ] DB cleanup: delete Cassie (cassie@wavv.com) and jake@wavv.com test users
- [x] DB: set jake.moser@wavv.com role to super_admin — done

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
- [x] Ensure Academy page shows Loom embeds from DB videoUrl field — LessonViewer now correctly renders all Loom embed URLs

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

- [x] Guides & Docs restored to sidebar nav (PortalLayout) — between Webinars and Playground
- [x] Guides & Docs restored to Dashboard quick-access tiles (5-tile grid)
- [x] Guides & Docs route active in App.tsx
- [x] Remove fake progress rings from Dashboard hero — hero already uses CTA button, no rings present
- [x] Create exclusive webinar in DB: "Always Know Who to Call with WAVV Call Boards" — already exists (ID 60001, May 14 17:00 UTC, registration URL set)
- [x] Remove all On-Demand Recording webinar placeholders (DEMO-stamped) — 0 on-demand records in DB
- [x] Remove all Exclusive webinar placeholders (DEMO-stamped) — only 1 exclusive record in DB (ID 60001, real webinar)
- [x] Evergreen webinar records — 6 clean records in DB (IDs 30006-30011), no DEMO stamps; keeping as "Coming Soon" placeholders per Jake's direction
- [x] Support page: remove Chat With Support card — already clean
- [x] Support page: remove Submit a New Ticket card — already clean
- [x] Support page: remove My Tickets section / ticket history from Support page — already clean
- [x] Support page: keep only AskWAVV AI card and Help Center card (2-card layout) — already done
- [x] Remove all ticket-related tRPC calls from Support.tsx UI (keep backend dormant) — already done
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

## Admin/Academy Fixes Batch 3

- [x] Academy Admin: move "Add Section" button to top of tab with category selector (assign to category on creation)
- [x] Academy Admin: restyle "Add Video" button to a visible color (blue or green, not grey)
- [x] Content Requests: always show all 3 groups (Video/Webinar/Guide) even when empty, with empty state per group
- [x] Academy user-facing: deactivated/hidden sections must not appear on the Academy page

## Academy Visibility & Count Fixes (Batch 4)

- [x] Academy landing page: section/video counts must reflect DB published data only (not static CATEGORY_DATA)
- [x] Academy landing page: hidden/deactivated courses must not be counted or shown
- [x] AcademyCategory page: confirm hidden sections are excluded (already fixed, verify)

## Invite Flow & Auth Cleanup (Batch 5)

- [x] Add invite_tokens table (id, email, token, role, used, expiresAt, createdBy)
- [x] Add generateInvite DB helper (creates token, stores in DB)
- [x] Add sendInviteEmail server helper — Option B: copy-link modal (no external email dependency)
- [x] Add admin.addUser tRPC procedure (generates token, returns inviteUrl, called from Add User dialog)
- [x] Add auth.validateInvite + auth.acceptInvite tRPC procedures (validates token, sets password, creates session, marks token used)
- [x] Build /accept-invite page (token from URL, name + password + confirm, auto-login on submit)
- [x] Password validation: min 8 chars enforced on register, acceptInvite, and UI forms
- [x] "Don't have an account? Create one" link on sign-in page already present (verified)
- [x] Audit and remove any remaining Manus OAuth references from frontend and backend

## Batch 6: Auth Fix, Analytics Export, Playground Dedup

- [x] Fix Manus OAuth re-prompt: removed OAuth route registration from server; all auth redirects go to /login only
- [x] Analytics per-tile export: added CSV download button (FileDown icon) to Sign-Ins, Academy Lessons Completed, Evergreen Webinars Watched, Webinar Registrations, Guides Downloads tiles
- [x] Analytics export: raw event rows (user name, email, event type, resource, timestamp) filtered to current time range
- [x] Analytics export: CSV format with header block (report name, period, generated date, total count) + GHL-friendly column names
- [x] Playground access request: enforce one request per user (server throws CONFLICT on duplicate)
- [x] Playground access request: after submission, button changes to "Requested" (purple badge, stays on reload via hasRequested query)

## Batch 7: Webinar Click Tracking & Auto-Archive

- [x] Webinar registration: log `webinar_registered` analytics event when user clicks registration link
- [x] Webinar registration: update button label to "Register Now →" (external link style)
- [x] Webinar registration: admin analytics view shows "Registration Clicks" label (not "Confirmed Registrations")
- [x] Exclusive webinars: auto-archive when scheduledAt timestamp is in the past (silent, on page load)
- [x] Exclusive webinars: add `status` field (upcoming/archived) or derive from scheduledAt vs now
- [x] Admin Webinars tab: add "Completed" sub-tab showing archived exclusive webinars
- [x] Admin Webinars tab: Completed webinars have "Publish to On-Demand" and "Keep Archived" actions
- [x] User-facing Webinars page: archived exclusive webinars no longer appear in the upcoming list

## Batch 8: Webinar Registration Simplification, Onboarding Thumbnail Fix, Playground Delete

- [x] Webinars: remove register/registered state tracking — button is a plain external link that fires a click-tracking analytics event only
- [x] Webinars: remove getMyRegistrations query and isRegistered state from WebinarCard
- [x] Webinars: button label is always "Register Now →" (external URL) or "Join Next Session →" (evergreen) — no "Registered ✓" state
- [x] Academy: investigate and fix Onboarding category thumbnail lag/missing issue
- [x] Playground admin: add delete button on each access request row (super_admin only, with confirmation)
- [x] Playground admin: add deletePlaygroundRequest tRPC procedure

## Batch 9: Dark/Light Mode Toggle, Super Admin Button Fix

- [x] Profile dropdown: dark/light mode toggle deferred — app is fully hardcoded dark; full refactor required, not worth the effort now
- [x] Admin users table: fix "Super Admin" promote button — full label "Promote to Super Admin" must be fully visible, not truncated
- [x] Admin users table: ensure all action buttons (Super Admin, Demote, Remove) are fully readable with no hidden text

## Batch 10: Dashboard Homepage Overhaul

- [x] Dashboard nav buttons: fix "WAVV Guides & ..." truncation — show full label "WAVV Guides & Docs"
- [x] Dashboard feature cards: replace fake/placeholder content with real data from the system (real lessons, webinars, guides)
- [x] Dashboard What's New section: removed (no auto-populate mechanism; replaced with "Recently Added" from DB)
- [x] Dashboard Trending Now section: removed (insufficient analytics data at launch; replaced with "Upcoming Webinars" from DB)
- [x] Dashboard overall: ensure no hardcoded fake content is visible to users

## Batch 11: Dashboard Layout Compaction

- [x] Dashboard Featured section: reduce vertical footprint — replaced tall hero+side cards with compact 3-column category banner
- [x] Dashboard: remove "Recently Added" lessons section
- [x] Dashboard: add "Exclusive Live Webinars" strip (exclusive type, filtered to future scheduledAt)
- [x] Dashboard: add "On-Demand Webinars" strip (evergreen + upcoming, 4-column grid)
- [x] Dashboard: both webinar strips link to /webinars with real data, graceful empty states

## Batch 12: Dashboard Refinements + Placeholder Audit

- [x] Dashboard: remove "On-Demand Webinars" strip entirely
- [x] Dashboard: change Exclusive Live Webinars accent from purple to gold (#F5A623), swap Sparkles icon to Star
- [x] Dashboard: Recommended section added (shows in-progress courses or curated fallback)
- [x] Audit: all pages scanned for placeholders and missing content — rundown delivered to user

## Batch 13: Dashboard Final Polish

- [x] Dashboard: remove the compact 3-column featured banner (no title, confusing)
- [x] Dashboard: reorder sections to Continue Learning → Recommended For You → Exclusive Live Webinars
- [x] Dashboard: change Recommended For You icon from Star to Compass (light blue, distinct from gold star)
- [x] Dashboard nav tiles: fix WAVV Playground icon color to purple (#a855f7)
- [x] Located 3 coming-soon Onboarding lessons: in AcademyCategory.tsx section 6 (Common Onboarding Questions) — Troubleshooting Audio & Mic Issues, CRM Connection FAQs, Billing & Account Questions. They ARE rendered with a gray "Coming Soon" badge on the Onboarding category page.

## Batch 14: Webinar Display + Content Cleanup

- [x] Dashboard: renamed to "Upcoming Exclusive Live Webinars"
- [x] Dashboard: webinar date now shows "May 14, 2026 @ 2:00 PM" format
- [x] AcademyCategory.tsx: removed all 3 placeholder coming-soon lessons and the entire section 6
- [x] Verified: getLessonsByCourse now filters published=true AND hidden=false; getCourses, getGuides, getWebinars all filter published=true

## Batch 15: Mountain Time Display

- [x] Dashboard: webinar date/time displays in Mountain Time (America/Denver) with MDT or MST abbreviation (e.g. "May 14, 2026 @ 2:00 PM MDT")

## Batch 16: QA Fixes

- [x] Dashboard: make Recommended For You tiles the same height as Exclusive Live Webinar tiles (min-h-[110px] added)
- [x] Remove Readiness Widget entirely from all pages (Academy, Webinars, GuidesAndDocs, HandsOn, Support) and delete the component
- [x] Profile page: remove support ticket section (not part of this build)
- [x] Admin analytics: fixed slow load for admin users — changed 8 read-only procedures from superAdminProcedure to adminProcedure; Reset Data + Export CSV buttons hidden for non-super_admin

## Batch 17: Academy UX Fixes
- [x] AcademyCategory: enhance section headers and video row buttons so they are clearly visible and clickable (not blending into background)
- [x] Continue Learning: auto-track partial progress when a lesson is opened (not just on explicit Mark Complete)

## Admin Academy: PDF Resource Upload (Session N)

- [x] Add section_resources DB table (courseId FK, label, fileUrl, fileName, sortOrder, createdAt)
- [x] Run migration via webdev_execute_sql
- [x] Add DB helpers: getSectionResourcesByCourseId, getSectionResourcesByCategory, insertSectionResource, deleteSectionResource, reorderSectionResources
- [x] Add tRPC procedures: academy.getSectionResourcesByCategory (protected), adminAddSectionResource, adminDeleteSectionResource, adminReorderSectionResources (admin-only)
- [x] Build SectionResourcesPanel component in Admin.tsx: upload PDF button, section picker, reorder/delete list
- [x] Surface section PDFs in AcademyCategory: fetch via getSectionResourcesByCategory, inject below video list in SectionRow as "Resources" sub-section
- [x] Write Vitest tests for all 4 new procedures (auth gating + admin gating)
- [x] 30 tests passing, 0 TypeScript errors

## V2 — Public Portal (No Auth Required)

- [x] Remove auth gate from PortalLayout (no redirect to / for unauthenticated visitors)
- [x] Remove loading spinner gate (layout renders immediately without waiting for auth)
- [x] Remove notifications bell from public nav
- [x] Remove user avatar/profile dropdown from public nav
- [x] Remove "DEMO ENVIRONMENT" yellow banner from public nav
- [x] Admin nav link in sidebar remains — only visible when logged in as admin/super_admin
- [x] Rebuild Dashboard home page: centered hero with "WAVV Success Center" headline + tagline + "Powered by WAVV AI" badge
- [x] Home page: 5 quick-access nav tiles (Academy, Webinars, Guides & Docs, Playground, Support)
- [x] Home page: conditional Exclusive Live Webinars section (hidden when no active webinars)
- [x] Home page: Recently Added row (6 latest published lessons, auto-updates on new content)
- [x] Make getRecentLessons a publicProcedure (no auth required)
- [x] Remove "Continue Learning" section (requires auth/progress tracking)
- [x] V1 checkpoint preserved in version history for rollback

## Magic Link Auth + Admin Hardening (Step 4)

- [ ] Add magic_link_tokens table to schema (id, userId, token, email, expiresAt, usedAt)
- [ ] Run migration for magic_link_tokens
- [ ] Add server-side helpers: createMagicToken, validateMagicToken
- [ ] Add tRPC procedure: auth.requestMagicLink (public — takes email, sends link if user exists)
- [ ] Add tRPC procedure: auth.verifyMagicLink (public — validates token, creates session)
- [ ] Add tRPC procedure: admin.inviteUser (super_admin only — creates user + sends magic link invite email)
- [ ] Rebuild /login page: email-only input, "Send me a login link" button, no password field
- [ ] Build /auth/magic page: reads token from URL, calls verifyMagicLink, redirects to /admin on success
- [ ] Add Invite Team Member button + modal in Admin → Users page
- [ ] Harden /admin: redirect to /login?next=/admin if no valid session
- [ ] Remove Admin sidebar link from public portal (only show when logged in as admin/super_admin)
- [ ] Remove "Create Account" / Register link from /login page
- [ ] Remove profile, account settings, history, medals, bookmarks from public portal nav
- [ ] Remove /register route from public routing (invite-only model)

## Magic Link Auth + Admin Hardening (V2)

- [x] Add magic_link_tokens DB table and migration
- [x] Add createMagicToken and validateMagicToken DB helpers
- [x] Add requestMagicLink and verifyMagicLink tRPC procedures (public, with optional ?next= param)
- [x] Rebuild /login as email-only magic link request page (no password)
- [x] Build /auth/magic token verification + session creation page with ?next= redirect
- [x] Add Invite Team Member button + dialog in Admin → Users (super_admin only)
- [x] inviteTeamMember tRPC procedure: creates admin user + generates single-use magic link
- [x] Harden /admin: redirect to /login?next=/admin if not authenticated
- [x] Admin link in sidebar already role-gated (no change needed — invisible to public visitors)
- [x] ?next= param flows through login → magic link → redirect after auth

## Admin Panel Improvements (Session 3)

- [x] Fix Demote button: only show on super_admin rows when viewer is super_admin; admin rows show only Promote + Remove
- [x] Remove Notifications tab and NotificationsTab component from Admin.tsx
- [x] Clean up Analytics tab: remove per-user metrics (logins, user growth, registrations)
- [x] Analytics tab: keep/add page views, content engagement (video plays, PDF downloads), on-demand webinar watch counts
- [x] Add tRPC procedure: trackRegistrationClick (public, fires on button click) — uses existing analytics_events table, no schema change needed
- [x] Register Now button in Dashboard.tsx: fire trackRegistrationClick before opening URL
- [x] Register Now button in Webinars.tsx: fire trackRegistrationClick (replaced misused register mutation)
- [x] Surface registration click counts in Admin → Analytics tab (Webinar Register Clicks stat card)
- [x] Make webinars.list and webinars.watch public procedures (no auth required for public visitors)
- [x] Update vitest test for webinars.list to reflect public endpoint (30/30 tests passing)

## Dashboard Home Redesign (Session 4)

- [x] Dashboard hero: update subline to "Build skills and get the most out of every call"
- [x] Dashboard hero: remove all nav tiles (Academy, Webinars, Guides, Playground, Support)
- [x] Dashboard: remove Recently Added section entirely
- [x] Dashboard: add "Start Here" section with 5 curated cards (Academy, Webinars, Guides & Docs, Support, Playground)
- [x] Playground card: Coming Soon treatment with interest-capture CTA (name + email + Notify Me button)
- [x] Support card: description pointing to help articles + link to external help center
- [x] Reuse existing playground_requests table for public interest capture (no new table needed)
- [x] Add tRPC publicProcedure: playground.submitPublicInterest (name + email, no auth required)

## Ask WAVV + WAVV Knowledge + Admin Gating

- [x] Rename top-bar "WAVV AI" button to "Ask WAVV" and keep it as the trigger
- [x] Add persistent floating "Ask WAVV" bubble in bottom-right corner of PortalLayout (replaces or supplements top-bar button)
- [x] Rename WavvAIChat header from "WAVV AI" to "Ask WAVV" with updated subtitle
- [x] Add WAVV Knowledge tab as leftmost tab in Admin panel (empty chat shell for now)
- [x] Admin panel: regular admins default to WAVV Knowledge tab; all other tabs grayed out and non-clickable
- [x] Admin panel: super_admin sees all tabs fully accessible
- [x] Update initialTab() to default to "knowledge" for admin role, "analytics" for super_admin

## Admin UX + Ask WAVV Cleanup

- [x] Admin invite accepted → redirect to /admin instead of home page
- [x] Remove top-bar "Ask WAVV" button (keep only floating bubble on customer pages)
- [x] Remove floating Ask WAVV bubble and top-bar button entirely from admin pages (/admin)
- [x] Fix WAVV Knowledge tab layout/formatting so label fits correctly in tab bar
- [x] Replace WAVV Knowledge blank space with: search bar + topic shortcut cards (Onboarding, Call Boards, Connection Rates, CRM Setup, Billing)

## Team Access, Webinars, Guides, On-Demand Hosting

- [x] Team Access: remove all roles except Super Admin and Admin from role selector
- [x] Team Access: hide demote button on Admin-role users (only show on Super Admins)
- [x] Rename webinar tabs: "WAVV On-Demand Series", "Upcoming WAVV Exclusive Live Webinars", "WAVV Exclusive On-Demand Webinars"
- [x] Brand the webinar screenshot/tile cards with WAVV styling
- [x] Admin Webinars: drag-to-reorder videos within each tab
- [x] Admin Guides: drag-to-reorder content items as Super Admin sees fit
- [x] On-Demand Series: native video hosting on platform (upload via admin, S3 storage, video player on customer side)
- [ ] On-Demand Series: analytics tracking (view count per video)

## WAVV Partners Page
- [x] Create /partners route and page with: hero, 3 value pillars, how it works (3 steps), FAQ, CTA → wavv.com/partner-program
- [x] Add WAVV Partners nav tile to home page below WAVV Support (Users icon, teal/cyan color)
- [x] Add WAVV Partners link to sidebar navigation in PortalLayout
- [x] Register /partners route in App.tsx

## Partners Page + Role + Analytics (Session N)
- [x] Partners page: CTA buttons → "Apply Now" (remove "at wavv.com" text)
- [x] Partners page: Step 02 → "Complete a Course" (remove approval timeline/portal language)
- [x] Partners page: hero → match dashboard hero style (gradient background, badge pill, gradient headline)
- [x] Ask WAVV bubble → move back to bottom-right corner
- [x] PortalLayout footer → stacked vertically, centered: "© 2026 WAVV, All rights reserved." then Privacy Policy link then Terms & Conditions link
- [x] Add partner_admin role to schema (can invite/manage partners)
- [x] Add partner role to schema (WAVV Partners access only)
- [x] Team Access: partner_admin can invite partner-role users
- [x] Partner Analytics tab in Admin: active partners, course completion rate, Apply Now CTA clicks, partner logins (7d/30d)

## Partner Admin Access Control
- [x] partner_admin sees only WAVV Knowledge + Partner Analytics tabs in Admin panel (all others grayed/locked)
- [x] partner_admin defaults to Partner Analytics tab on login
- [x] Invite Partner button in Partner Analytics tab (visible to super_admin and partner_admin)
- [x] When partner_admin initiates invite, role is locked to "partner" — no other role options shown
- [x] Server: allow partner_admin to call admin.addUser but only with role="partner"
- [x] Server: allow partner_admin to call admin.listUsers (filtered to partner/partner_admin rows only)

## Partner Model Restructure
- [x] Team Access: remove partner role from role selector (only Super Admin, Admin, Partner Admin)
- [x] Admin panel: move Partners tab to far right position
- [x] Admin panel: partner_admin sees WAVV Knowledge + Partners tab only (Partners far right)
- [x] Create /wavv-partner dedicated portal page (course + content placeholder, WAVV-branded)
- [x] AcceptInvite: redirect partner role to /wavv-partner instead of /admin
- [x] Gate /wavv-partner route to partner role only (redirect others away)
- [x] Register /wavv-partner route in App.tsx

## 4-Tier Role Hierarchy + Owner Role
- [x] Add owner role to schema enum (migration 0025 applied)
- [x] Add owner to all role type definitions: nativeAuth.ts, routers.ts, db.ts
- [x] Promote jake.moser@wavv.com to owner role in database
- [x] Admin.tsx: isOwner/isSuperAdmin/isPartnerAdmin variables updated (owner inherits all access)
- [x] Admin.tsx: initialTab() and useEffect tab sync updated for 4-tier hierarchy
- [x] Admin.tsx: tabs array updated with requiresSuperAdmin/requiresPartnerAdmin flags
- [x] Admin.tsx: tab locked logic updated (owner bypasses all locks)
- [x] Admin.tsx: tab content rendering updated (content tabs gated to isSuperAdmin)
- [x] Admin.tsx: addUserForm state type updated to include owner
- [x] Admin.tsx: Team Access role selector now has Owner/Super Admin/Partner Admin/Admin options

## URL Restructure (3 Portals)

- [x] App.tsx: rename /admin → /wavvadmin, /wavv-partner → /wavvpartner
- [x] Admin.tsx: update navigate("/login?next=/admin") → /wavvadmin
- [x] WavvPartnerPortal.tsx: update /login?next=/wavv-partner → /wavvpartner, /admin → /wavvadmin
- [x] AcceptInvite.tsx: update /admin → /wavvadmin, /wavv-partner → /wavvpartner, /sign-in → /login
- [x] Login.tsx: update default nextPath from /admin → /wavvadmin
- [x] MagicAuth.tsx: update default nextPath from /admin → /wavvadmin
- [x] PortalLayout.tsx: update adminItem href /admin → /wavvadmin, isAdminPage check, isAdmin to include owner/partner_admin

## Settings Tab + Partner Role Fix

- [ ] Schema: add partner role back to role enum
- [ ] Schema: add site_settings table (key/value store)
- [ ] DB migration: apply schema changes
- [ ] Server: siteSettings.get and siteSettings.update procedures (owner-only)
- [ ] Server: add partner role to all type guards and listUsers filter
- [ ] Admin UI: Settings tab (owner-only, after Partners in tab bar)
- [ ] Settings tab: Ask WAVV toggle (on/off)
- [ ] Settings tab: Site announcement banner (text + active toggle)
- [ ] Settings tab: Maintenance mode toggle
- [ ] Settings tab: Ask WAVV rate limit (messages per hour input)
- [ ] Partner Analytics: filter to show only partner role users (not partner_admin)
- [ ] Partner Analytics: search bar for approved partners
- [ ] Invite flow: "Invite WAVV Partner" assigns partner role (not partner_admin)
- [ ] /wavvpartner gate: partner role + partner_admin + owner can access
- [ ] PortalLayout: Ask WAVV bubble visibility controlled by siteSettings
- [ ] PortalLayout: announcement banner shown when active
- [ ] PortalLayout: maintenance mode redirects non-owner visitors to maintenance page

## UX Improvements (Session 3)
- [x] Invite dialog: add role dropdown (Owner, Customer Admin, Partner Admin, Admin) for Team Access invites — owner-only
- [x] Token URL prettification: truncate magic link hash for display, keep full URL in clipboard copy
- [x] Login gate messaging: replace "we'll send an email" with "contact your WAVV admin to request access"ess"
- [x] Sign out button: add visible sign out button in sidebar for ALL logged-in users (admins and partners)
- [x] AcceptInvite: route `partner` role to /wavvpartner after claiming invite
- [x] inviteTeamMember server procedure: accept optional role param (default admin), update createNativeUser type

## UX Improvements (Session 4)
- [x] Team Access: add info (i) tooltip to each role stat card describing role permissions
- [x] Team Access: make the user list tab visible to all 4 admin tiers (owner, customer_admin, partner_admin, admin) as read-only — no invite/promote/remove actions for non-owners

## Password Authentication (Session 5)
- [x] DB: add passwordHash (nullable text) column to users table
- [x] Server: install bcryptjs, add hashPassword/verifyPassword helpers in db.ts
- [x] Server: update login procedure to verify password (email+password → session); reject no-password accounts with helpful message
- [x] Server: inviteTeamMember updated to use accept-invite flow (password setup on first login)
- [x] Server: add sendPasswordReset procedure (owner-only, generates fresh accept-invite token for existing user)
- [x] Server: accept-invite flow already handles token validation and password setting
- [x] Frontend: Login.tsx updated to email + password fields, single submit, red error on failure
- [x] Frontend: AcceptInvite.tsx already handles password setup on invite claim
- [x] Frontend: AcceptInvite routes to /wavvadmin or /wavvpartner after password set
- [x] Frontend: Reset Password button added in user row actions (owner-only), shows copyable reset link modal
- [x] Frontend: users with no password see a clear error message directing them to use their invite link

## Partner Invite Flow (Session 6)
- [x] Schema: ensure `partner` role exists in role enum (separate from `partner_admin`)
- [x] DB migration: apply if needed (already in schema)
- [x] Admin Partners tab: "Invite WAVV Partner" assigns `partner` role (not `partner_admin`)
- [x] AcceptInvite: `partner` role routes to `/wavvpartner` after password set
- [x] WavvPartnerPortal: gate access to `partner` + `partner_admin` + `owner` roles only (no `admin` or `customer_admin`)
- [x] Admin Partners tab: show approved partners list (users with `partner` role) with name, email, joined date
- [x] Admin Partners tab: partner rows show Remove button (owner-only), no role-change actions
- [x] PortalLayout: sidebar does NOT show WAVV Admin link for `partner` role users (partner not in isAdmin)

## Settings & Content Fixes (Session 7)
- [x] Settings tab: add WAVV Knowledge on/off toggle (owner-only)
- [x] Webinars page: fix on-demand series wording — remove "every 30 minutes" language
- [x] Guides & Docs: show all sections even when empty, with an empty state message
- [x] Settings tab: add Navigation section with per-item show/hide toggles for sidebar nav items (owner-only)

## Support Page & Guides Updates (Session 8)
- [x] Support page: remove "Ask WAVV" tile
- [x] Support page: rename "Help Center" tile to "Chat with Support", make it first, link to Intercom URL (placeholder)
- [x] Support page: add "Submit a Ticket" tile to the right of Chat with Support
- [x] Support page: update hero/description copy to reflect new support model
- [x] Guides & Docs: update hero banner copy to mention help articles
- [x] Guides & Docs: add "Help Articles" as a new category (DB enum + schema.ts + routers.ts + GuidesAndDocs.tsx + Admin.tsx)
- [x] Guides & Docs admin: Help Articles section visible in Section Visibility toggles and Add Guide dropdown
- [x] WAVV Knowledge disabled: blocks ALL users (including owners) from clicking the button

## Webinar Inline Video Player (Session 9)
- [x] Webinars: add getEmbedUrl() utility (Loom share→embed URL conversion, same as Academy)
- [x] Webinars: replace "Watch Now" external link with inline modal (Loom iframe, 16:9, dark theme)
- [x] Webinars: modal applies to both On-Demand (recording) and Exclusive (evergreen) webinar types
- [x] Webinars: Exclusive webinar modal includes PiP button (Chrome/Edge only, hidden on unsupported browsers)
- [x] Webinars: PiP uses Document Picture-in-Picture API to float the iframe in an always-on-top window
- [x] Webinars: view count tracking fires on modal open (same as current watchMutation)

## Academy Bug Fix (Session 10)
- [x] BUG: Academy play button closes window and redirects to home page instead of opening video modal
- [x] Remove Mark Complete button from Academy video modal (not tracking user progress)

## WAVV Knowledge / Playground Visibility Fix (Session 11)
- [x] Disabling WAVV Knowledge should NOT hide WAVV Playground from the sidebar
- [x] All 4 admin roles always see all nav items (bypass nav_visibility toggles) for QA purposes
- [x] WAVV Knowledge toggle only disables the AI chat for regular users; admins always see it

## Admin Panel Rebuild (Session 12)
- [ ] Admin: 3-row layout — Row 1: WAVV Knowledge (hidden when disabled), Row 2: Operations (Team Access, Analytics, Settings, Approved Partners), Row 3: Content (Academy, Webinars, Guides & Docs, Playground, Support, Partners, Requests)
- [ ] Admin: WAVV Knowledge hidden entirely when wavv_knowledge_enabled=false (not greyed out)
- [ ] Admin: Approved Partners tab — invite by email (assigns partner role), list all WAVV Partners, search, export CSV, deactivate/remove
- [ ] Admin: Partners content tab — edit /partners public page content and /wavvpartner portal content (modules, resource cards, quick links)
- [ ] Admin: partner_admin role stays in Team Access (internal); WAVV Partner (partner role) managed in Approved Partners tab

## Partner Portal Disable (Session 12)
- [x] Nav Visibility toggle for WAVV Partners enforces full URL block — non-admins redirected to /404 when disabled
- [x] Admins always bypass the guard and can access /partners regardless of toggle state
- [x] Default state: Partners page visible (no change to existing behavior unless toggled off)

## Role Badge & Access Control (Session 13)
- [ ] Role badge: all purple (single color) instead of multi-color
- [ ] Customer Admin: remove Approved Partners tab from Operations row
- [ ] Customer Admin: remove Partners content tab from Content row
- [ ] Customer Admin: remove Partner Portal sidebar button (bottom-left)
- [ ] Partner Portal sidebar button: only visible to owner and partner_admin
- [ ] Team Access: add "All Users" stat tile
- [ ] Team Access: organize users by role in this order: Owner, Customer, Admin, Partner Admin
- [ ] Team Access: clean visual separation between role groups

## QA Fixes (Session — Jun 3 2026)

- [x] Fix Academy videos auto-closing and redirecting to home (bookmarks.getAll was protected, fired for unauthenticated users → global redirect hook triggered)
- [x] Fix WAVV Playground auto-redirect after 5-10s (playground.hasRequested and getStats were protected, now guarded behind enabled:!!user)
- [x] Fix Playground "Apply to Get Notified" form — name/email inputs not typeable (were read-only divs; now editable inputs when user is not logged in)
- [x] Fix PiP (pop-out) video fill — iframe was skinny/stretched; fixed html/body/iframe to 100% absolute fill
- [x] Add Partners portal login link below Apply Now button (links to https://wavv.firstpromoter.com/login)
- [x] Fix double-login on /wavvadmin — loading spinner check now runs before redirect guards to prevent race condition
- [x] Add empty search state with "We can't find what you're looking for" message and "Request this content" CTA
- [x] Auto-log search queries with no results to content_requests table as search_query type
- [x] Add "Query Search Requests" group to admin Requests tab (purple, shows auto-logged search queries)

## Admin UX Polish (Session — Jun 9 2026)

- [x] Settings tab: add Approved Partners on/off toggle (owner-only, amber style); confirm dialog on disable
- [x] ApprovedPartnersTab: when disabled, show locked overlay card (amber warning, Lock icon, explains how to re-enable) instead of partner management UI; when enabled, show consistent hero header
- [x] PortalLayout: WAVV Partners Portal sidebar link now shows amber "Hidden" badge + dimmed label when /wavvpartner is toggled off in nav_visibility (matches NavLink hidden badge behavior)
- [x] ContentTab (Academy): add icon+title+subtitle hero header (GraduationCap, blue)
- [x] WebinarsTab: add icon+title+subtitle hero header (Video, blue)
- [x] GuidesTab: add icon+title+subtitle hero header (FileText, green)
- [x] PlaygroundTab: add icon+title+subtitle hero header (FlaskConical, purple)
- [x] ContentRequestsTab: already had hero header — confirmed consistent, no change needed
- [x] SupportTab: already had hero header — confirmed consistent, no change needed

## Nav Visibility Consistency (Session — Jun 9 2026 cont.)

- [x] Dashboard "Explore the Center": fetch siteSettings and filter cards by navVisibility — hidden sections no longer appear
- [x] PortalLayout: WAVV Partners Portal sidebar link — fix truncation (overflow-hidden + truncate span); reduce font to 14px to match NavLink
- [x] Admin PartnersContentTab: replace plain h2 header with icon+title+desc hero header (Users icon, #00A9E2, matching other tabs)
- [x] Admin content tab icons: fix Webinars (#10b981 green) and Support (#FF9900 orange) to match sidebar color scheme exactly

## Role Rename + Analytics + Nav Styling (Session — Jun 9)
- [ ] Rename customer_admin → content_admin in schema enum, DB migration, server role guards, UI labels, invite flow
- [ ] Hidden nav items: remove HIDDEN badge, grey out entire row (icon + label to 40% opacity), add amber left border indicator
- [ ] Hidden Partners Portal sidebar link: same treatment (grey out + amber left border, no badge)
- [ ] Add lesson_started event tracking when user clicks into a lesson video
- [ ] Add guide_viewed event tracking when user opens a guide card
- [ ] Rename "Role" column/label to "Access Level" in analytics UI
- [ ] Build Content Leaderboard view in AdminAnalytics (top content across all types by engagement)
