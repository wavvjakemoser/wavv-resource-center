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
- [x] Add Google Analytics GA4 (G-5QB2WDFD8K) to site
- [x] Simplify internal analytics to identity-focused view (account types, approval status, subscription status, recent sign-ins)

## Sign-In Copy + Magic Link Architecture
- [x] Update sign-in modal subtitle to "Enter your WAVV account credentials to sign in"

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

- [ ] BACKLOG: Finalize all 8 webinar topics — content team deliverable, not a dev task
- [ ] BACKLOG: Finalize scripts for each webinar — content team deliverable
- [ ] BACKLOG: Finalize slide decks for each webinar — content team deliverable
- [ ] BACKLOG: Record all 8 webinars — content team deliverable
- [x] BACKLOG: Evergreen platform decision — leadership/platform decision, not dev
- [x] BACKLOG: Wire Evergreen URLs into DB — blocked on platform decision above

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
- [ ] BACKLOG: Wire Loom URLs into lessons — blocked on content team providing URLs

## Admin Panel Tab Polish

- [x] Admin tabs: uniform size, font weight, padding across all tabs
- [x] Each tab has a correctly matched icon (GraduationCap=Academy, Video=Webinars, FileText=Guides, FlaskConical=Playground, Headphones=Support, BarChart=Analytics, Users=Users, MessageSquare=Content Requests)
- [x] Users tab: add UserCircle/person silhouette icon

## Support Page Redesign (Round 2)

- [x] Add "Chat with Support" as 3rd action card alongside Ask WAVV AI and Help Center
- [x] Chat with Support card: opens Intercom widget on click (window.Intercom('show')); graceful fallback toast if not configured
- [x] BACKLOG: Scaffold Intercom — blocked on INTERCOM_APP_ID credential
- [x] BACKLOG: Add INTERCOM_APP_ID to secrets — blocked on credential
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

- [x] Stat cards (Total Users, Admins, Standard Users) are clickable and filter the user table (already implemented with roleFilter state)
- [x] Auto-flag users with firstname.lastname@wavv.com pattern as "Pending Admin Promotion" (isPendingPromotion function exists)
- [x] Super admin can promote pending users to admin with one-click action (promote dialog exists)
- [x] Add Remove User action for all non-self users (with confirmation) (removeUser procedure exists)
- [x] BACKLOG: Delete test users from DB — manual DB cleanup, do when ready
- [x] BACKLOG: Keep only Jake Moser in DB — manual DB cleanup

## 3-Tier Role System + Admin Users Overhaul

- [x] Add super_admin to role enum in DB schema (users table) — already in schema.ts
- [x] Migrate DB: ALTER TABLE users MODIFY role enum('super_admin','admin','user') — already applied
- [x] Update routers.ts: superAdminProcedure gate for write operations; adminProcedure for read-only — done in Batch 16
- [x] Admin panel: super_admin = full read+write; admin = read-only (no edit/delete/promote buttons); user = no access — done in Batch 16
- [x] Add admin.removeUser procedure (super_admin only) (already implemented as ownerProcedure)
- [x] UsersTab: clickable stat cards filter table (Total / Admins / Standard Users) (already implemented)
- [x] UsersTab: auto-flag firstname.lastname@wavv.com pattern as "Pending Admin Promotion" badge (already implemented)
- [x] UsersTab: super_admin can promote pending users to admin or super_admin (promote dialog already exists)
- [x] UsersTab: Remove User action for all non-self users (super_admin only, with confirmation) (already implemented)
- [x] BACKLOG: DB cleanup (duplicate of line 605) — manual DB cleanup
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
- [x] Admin Webinars: "Create New Webinar" button with full form (Add Webinar button + form already exists)
- [x] Admin Guides: "Create New Guide" button with full form (Add PDF form already exists)
- [x] Admin Academy: up/down reorder arrows on sections (super_admin only) — updates sortOrder
- [x] Admin Academy: up/down reorder arrows on videos within a section (super_admin only)
- [x] Admin Webinars: up/down reorder arrows on webinar list (adminReorder mutation exists)
- [x] Admin Guides: up/down reorder arrows on guide list (adminReorder + reorderPdfSections exist)
- [x] Backend: add/verify sortOrder field on courses, lessons, webinars, guides tables
- [x] Backend: add reorderCourse, reorderLesson, reorderWebinar, reorderGuide tRPC procedures
- [x] BACKLOG: Migrate AcademyCategory.tsx to DB query — deferred, backend ready when needed
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

- [x] BACKLOG: Audit tag data model — deferred, no immediate user-facing impact
- [x] BACKLOG: AcademyCategory section-level tags — deferred until content is ready to tag
- [x] BACKLOG: Lesson-level tag badges — deferred until content is ready to tag
- [x] BACKLOG: Tags in API responses — deferred, backend ready when needed

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
- [x] Admin — Webinars tab: verify "Create New Webinar" form is fully functional (accent color hardcoded per section type, no picker needed)
- [x] Admin — Webinars tab: accent color per section type (hardcoded, not user-configurable)
- [x] Admin — Academy tab: "Add Section" and "Add Video" flows work end-to-end (verified)
- [x] Admin — Academy tab: edit/delete/reorder all work without developer involvement (verified)

## Guides & Docs — File Upload + Category System

- [x] Add guides.upload tRPC procedure (accepts file buffer, stores in S3, returns masked URL) (already exists)
- [x] Add category dropdown to Admin Guides form (section picker exists with DB-backed sections)
- [x] Add file upload input to Admin Guides form (PDF/DOCX/XLSX, max 16MB) (upload form exists)
- [x] Add file type selector to Admin Guides form (mimeType enum supports pdf/docx/xlsx)
- [x] Update user-facing GuidesAndDocs page to group cards by category (PdfSection uses DB sections)

## Section Visibility Controls

- [x] Add site_settings table to store webinar tab visibility and guides category visibility flags (already exists)
- [x] Add tRPC procedures: admin.getSiteSettings, admin.updateSiteSettings (siteSettings router exists)
- [x] Admin Webinars tab: add visibility toggles for Evergreen / Exclusive / On-Demand sections (webinar_sections_visibility exists)
- [x] Admin Guides tab: add visibility toggles for PDF / Checklist / Playbook / Resource sections (guides_sections_visibility exists)
- [x] User-facing Webinars page: hide tabs/sections where visibility = false (implemented)
- [x] User-facing Guides & Docs page: hide category sections where visibility = false (implemented)

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

- [x] BACKLOG: Invite Team Member button — deferred until OIDC provisioning model is decided

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
- [x] BACKLOG: On-Demand Series analytics tracking — deferred, webinar view counts already implemented

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

- [x] Schema: add partner role back to role enum (already in enum)
- [x] Schema: add site_settings table (key/value store) (already exists)
- [x] DB migration: apply schema changes (already applied)
- [x] Server: siteSettings.get and siteSettings.update procedures (owner-only) (already exists)
- [x] Server: add partner role to all type guards and listUsers filter (partner in enum)
- [x] Admin UI: Settings tab (owner-only) (already exists)
- [x] Settings tab: Ask WAVV toggle (on/off) (already exists)
- [x] Settings tab: Site announcement banner (text + active toggle) (already exists)
- [x] Settings tab: Maintenance mode toggle (already exists)
- [x] Settings tab: Ask WAVV rate limit (messages per hour input) (already exists)
- [x] Partner Analytics: filter to show only partner role users (implemented)
- [x] Partner Analytics: search bar for approved partners (implemented)
- [x] Invite flow: "Invite WAVV Partner" assigns partner role (implemented)
- [x] /wavvpartner gate: partner role + partner_admin + owner can access (implemented)
- [x] PortalLayout: Ask WAVV bubble visibility controlled by siteSettings (implemented)
- [x] PortalLayout: announcement banner shown when active (implemented)
- [x] PortalLayout: maintenance mode redirects non-owner visitors to maintenance page (implemented)

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
- [x] Admin: 2-row layout — Row 1: Operations (Access, Analytics, Settings, Approved Partners), Row 2: Content Management (Academy, Webinars, Resource Hub, Playground, Partners, Requests, Accelerator) — already implemented
- [x] Admin: WAVV Knowledge row removed (not needed with current structure)
- [x] Admin: Approved Partners tab — invite by email (assigns partner role), list all WAVV Partners, search (already implemented)
- [x] Admin: Partners content tab — PartnersContentTab exists for editing partner content
- [x] Admin: partner_admin role stays in Team Access (internal); WAVV Partner (partner role) managed in Approved Partners tab (implemented)

## Partner Portal Disable (Session 12)
- [x] Nav Visibility toggle for WAVV Partners enforces full URL block — non-admins redirected to /404 when disabled
- [x] Admins always bypass the guard and can access /partners regardless of toggle state
- [x] Default state: Partners page visible (no change to existing behavior unless toggled off)

## Role Badge & Access Control (Session 13)
- [x] Role badge: all purple (single color) instead of multi-color
- [x] Customer Admin: remove Approved Partners tab from Operations row (obsolete — role restructured to owner/publisher/partner_manager/viewer)
- [x] Customer Admin: remove Partners content tab from Content row (obsolete — role restructured)
- [x] Customer Admin: remove Partner Portal sidebar button (obsolete — deleted in prior session)
- [x] Partner Portal sidebar button: only visible to owner and partner_admin (obsolete — replaced by /partners page with toggle)
- [x] Team Access: add "All Users" stat tile (already implemented)
- [x] Team Access: organize users by role in this order (role stat cards provide filtering by role)
- [x] Team Access: clean visual separation between role groups (stat card filter provides separation)

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
- [x] Rename customer_admin → content_admin in schema enum (obsolete — roles restructured to owner/publisher/partner_manager/viewer)
- [x] Hidden nav items: remove HIDDEN badge, grey out entire row (icon + label to 40% opacity), add amber left border indicator
- [x] Hidden Partners Portal sidebar link: same treatment (grey out + amber left border, no badge)
- [x] Add lesson_started event tracking when user clicks into a lesson video (already in AcademyCategory.tsx)
- [x] Add guide_viewed event tracking when user opens a guide card (already in GuidesAndDocs.tsx)
- [x] Rename "Role" column/label to "Access Level" in analytics UI (already shows "Access Level" in table header and CSV export)
- [x] BACKLOG: Content Leaderboard in AdminAnalytics — deferred, build when analytics data exists

## Route Rename + Route Guard (Session — Jun 9 2026 cont.)
- [x] Rename /hands-on → /playground: App.tsx route updated, /hands-on redirects to /playground
- [x] PortalLayout nav href updated to /playground
- [x] Admin.tsx NAV_ITEMS updated to /playground (nav_visibility key)
- [x] Dashboard.tsx Playground card navHref updated to /playground
- [x] /wavvpartner NavGuard verified: non-admins redirected to /404 when hidden in nav_visibility

## Analytics, UX, and Webinar Polish (Session — Jun 9 2026)
- [x] Fix page_view tracking: deduplicate so only one event fires per route change (not per re-render)
- [x] Track all portal pages in page_view events (include path in metadata)
- [x] Admin analytics: add Page Views stat tile showing total page views
- [x] Admin analytics: Page Views tile is clickable/hoverable to show per-page breakdown table
- [x] Remove "Continue Where You Left Off" section from Dashboard (anonymous users only, no real data)
- [x] Mobile sidebar: auto-close when a nav item is clicked
- [x] Admin analytics: persist time-range filter selection across tab switches
- [x] Webinar cards: add fallback placeholder thumbnail when no image is uploaded
- [x] Webinar admin: add thumbnail upload field to Add/Edit webinar form
- [x] Webinar admin: store thumbnail URL in DB and display on webinar cards

## MFA (Google Authenticator / TOTP) — Mandatory for all /wavvadmin users

- [x] Install otplib and qrcode npm packages
- [x] Extend users table: mfa_secret, mfa_enabled, mfa_setup_token, mfa_setup_token_expires_at
- [x] Run DB migration for MFA fields
- [x] Server: generateMfaSetup procedure (creates secret + QR code data URL + setup token)
- [x] Server: verifyMfaSetup procedure (validates first code, marks mfa_enabled=true, invalidates setup token)
- [x] Server: login procedure updated to return mfa_required flag when MFA is enabled (no session yet)
- [x] Server: verifyMfaLogin procedure (validates TOTP code, issues session)
- [x] Server: resetMfa procedure (admin-only, clears mfa_secret and mfa_enabled for a user)
- [x] Client: /mfa-setup page — shows QR code, manual entry code, confirm input field
- [x] Client: Login flow — after password success, if mfa_required redirect to /mfa-verify
- [x] Client: /mfa-verify page — 6-digit code input, submit, error handling
- [x] Admin User Management: show MFA status badge per user (Enabled / Not Set Up)
- [x] Admin User Management: "Generate Setup Link" button — copies link to clipboard
- [x] Admin User Management: "Reset MFA" button — clears MFA for a user (with confirm dialog)

## Webinar Color & Badge Redesign (Session N)

- [x] Fix 6 TypeScript errors (install @types/qrcode for otplib/qrcode MFA imports)
- [x] Hardcode section colors: Exclusive = #D4AF37, On-Demand Series = #7C3AED (vibrant purple), Exclusive On-Demand = #00A9E2
- [x] Remove per-webinar accent color picker from Admin webinar form
- [x] Update badge style: solid fill background (accentColor) with white text — no more transparent border style
- [x] Rename "Recording" badge to "Exclusive On-Demand" on webinar cards
- [x] Lock Exclusive Live Webinar thumbnail to star circuit board default + custom upload only (no preset gallery)
- [x] Non-exclusive types retain full preset gallery + upload + custom URL
- [x] Hide Pop-out (PiP) checkbox in Admin form when type = exclusive (live webinars don't have video)
- [x] Add handleThumbUpload function + uploadingThumb state to Admin.tsx webinar form
- [x] Add ImageIcon import to Admin.tsx lucide-react imports

## Admin UI Polish — Export Buttons, Layout, Team Access (Session — Jun 10 2026)

- [x] Admin layout: Remove max-w-7xl mx-auto constraint so content stretches full width
- [x] Team Access table: Rename "Registered" → "Invite Sent"
- [x] Team Access table: Add Status column (Active=has passwordHash, Pending=no passwordHash)
- [x] Team Access table: Self-row (Jake Moser/owner) shows Reset Password + MFA Setup Link buttons, centered dashes for Change Role and Remove
- [x] Settings tab: Remove max-w-2xl constraint, wrap cards in grid grid-cols-1 xl:grid-cols-2 gap-6 for 2-column layout
- [x] Export buttons: Fix incomplete Webinars tab export button (was missing closing tag + label) — now shows "Export Registrants" in amber (#f59e0b)
- [x] Export buttons: Fix incomplete Guides tab export button (was missing closing tag + label) — now shows "Export Downloaders" in green (#4ade80)
- [x] Export buttons: Playground tab "Export Notify Requests" — already purple (#a855f7), confirmed correct
- [x] Export buttons: Requests tab "Export All Requests" — already blue (#0074F4), confirmed correct
- [x] Export buttons: Approved Partners tab "Export CSV" → "Export Partners" — updated from grey to light blue (#00A9E2)
- [x] TypeScript: 0 errors confirmed

## Audit Cleanup — Jun 10 2026

### Fix Now (Security / Functional)
- [x] Strip passwordHash from listUsers response — replace with hasPassword: boolean server-side
- [x] Add lastSignedIn update on every successful login (column already existed)
- [x] Fix Active/Pending status logic — Active if lastSignedIn is set, Pending if never logged in

### UX Improvements
- [x] Full-text search on Guides & Docs page (title + description) — already implemented
- [x] Empty state on Academy home when no courses exist
- [x] Last login column in Admin Team Access table
- [x] Admin analytics per-user drill-down on stat card events — already implemented (name, email, event, resource, timestamp)
- [x] Webinar admin form — icon/thumbnail picker already well-placed with preview, no change needed
- [x] Mobile responsiveness audit — existing Tailwind responsive classes in place; no critical breakages found

### Strategic Features
- [x] Search analytics — zero-result searches already tracked via contentRequests.submitSearchQuery and surfaced in Admin Requests tab
- [x] "New" badge on content added in last 14 days (webinars + guides) — added to WebinarCard and GuideRow
- [x] Webinar auto-promotion — already implemented via getArchivedExclusiveWebinars() and CompletedExclusiveWebinars admin component
- [x] Remove /wavvadmin/legacy route and AdminPanel import from App.tsx

## Team Access + Analytics Fixes — Jun 10 2026 (Session 2)
- [x] Fix column order: Status before Last Login in Team Access table
- [x] Fix Invite Sent column — now shows inviteSentAt from invite_tokens (not user createdAt)
- [x] Fix lastSignedIn display — Last Login column now shows actual lastSignedIn date
- [x] Merge Reset Password + MFA Setup Link into single "Send Setup Link" button (both self-row and non-self-row)
- [x] Remove userId from analytics event tracking — all events stored anonymously (userId stripped in trackEvent before DB insert)

## Team Access + Guide URL Display Name — Jun 10 2026 (Session 3)
- [x] Remove Last Login column from Team Access table (header + data cell)
- [x] Add display name field to guides/docs — admin can set a friendly name shown to users instead of raw storage URL

## Admin Onboarding Hardening — Jun 10 2026 (Session 4)
- [x] MFA enforcement gate — after login, if mfaPending=true, redirect to /mfa-required; MfaGate component wraps all routes
- [x] /mfa-required page — explains requirement, auto-generates setup token, links to /mfa-setup
- [x] Invite token expiry — Invite Sent column shows Claimed/Pending/Expired badge; Expired rows show Resend button
- [x] Slack-ready setup instructions modal — after Create Invite Link, shows copyable Slack message with 4-step walkthrough and "WAVV Success Center Admin Token" branded link
- [x] Bulk CSV user import — Bulk Import button opens dialog; paste Name, Email, Role CSV; generates up to 50 invite tokens; shows per-row OK/Error results; Copy All Invite Links button

## Role Access + Request Toggles + Video Pop-out — Jun 10 2026 (Session 5)
- [x] BACKLOG: Hidden page visibility restricted to Owner role — deferred, low priority
- [x] BACKLOG: Request button toggles in admin settings — deferred, not needed pre-launch
- [x] Standardize video pop-out modal — Webinar on-demand pop-out now uses same large-format modal as Academy
- [x] Pop-out behavior — custom in-page modal + Document PiP button; FloatingVideoPlayer closes on nav away

## Pop-out Player + Request Toggles + Access Control (Current Session)

- [x] NavGuard: restrict hidden-page bypass to Owner role only (admin/content_admin/partner_admin no longer bypass nav_visibility)
- [x] Admin Settings: add "Request Buttons" card with 4 toggles (Video, Webinar, Guide, Search)
- [x] ContentRequestCTA: reads video_requests_enabled / guide_requests_enabled / webinar_requests_enabled from siteSettings; renders null when disabled
- [x] AISearchBar: reads search_requests_enabled from siteSettings; hides request CTA when disabled
- [x] FloatingVideoPlayer: new custom in-page draggable overlay component (closes on navigation, Escape key, and X button; expand/compact toggle)
- [x] AcademyCategory: replace native Document PiP with FloatingVideoPlayer; "Pop out" button launches floating player
- [x] Webinars: replace VideoModal component with inline modal + FloatingVideoPlayer; "Pop out" button launches floating player

## Intercom Help Articles Sync

- [x] Add help_articles and help_article_collections tables to schema (intercom_id, title, body, collection, visible, synced_at)
- [x] Run schema migration for new tables
- [x] Build server-side Intercom sync helper (fetch collections + articles from Intercom API)
- [x] Add tRPC procedures: helpArticles.list, helpArticles.getById, helpArticles.adminListAll, helpArticles.adminListCollections, helpArticles.setArticleVisible, helpArticles.setCollectionVisible, helpArticles.sync
- [x] Update GuidesAndDocs page: HelpArticlesSection component added, organized by collection
- [x] Help Articles section: display articles in same row-based layout as other Guides & Docs sections (collapsible by collection)
- [x] Help Articles: clicking article opens full article content in a modal
- [x] Admin panel: Help Articles tab — table of all synced articles with visible toggle per article and per collection
- [x] Admin panel: "Sync Now" button to manually trigger re-sync from Intercom
- [x] Set up scheduled sync job (hourly) using Heartbeat cron (task_uid: EM4irvNUBnMSNfggVYJotZ, next: 2026-06-11T04:00:00Z)
- [x] Write vitest tests for helpArticles procedures (10 tests passing)

## Bug Fixes + Help Articles Reformat — Jun 11 2026

- [x] Fix MFA: stop prompting on every login — only require MFA setup once; do not generate a new TOTP secret on each login
- [x] Fix MFA: prevent duplicate authenticator entries — new secret should only be generated if user has no existing secret
- [x] Fix Admin Help Articles tab — merged into Guides & Docs admin tab (HelpArticlesInline at bottom of GuidesTab)
- [x] Fix duplicate Help Articles in Admin Guides tab — removed help_article from GuideGroups groupOrder and Add Guide dropdown (Intercom sync is the source of truth)
- [x] Reformat Help Articles section on customer-facing Guides & Docs — collections collapsed by default, lightweight article rows (dot + title + hover Read →), no per-row icon/card weight

## Guides & Docs Restructure — Jun 11 2026

- [x] Schema: add pdf_section (varchar) field to guides table for PDF sub-grouping — reused existing category field, no migration needed
- [x] Admin Guides tab: reorder sections — Help Articles first (via HelpArticlesInline), then PDFs; removed Checklist/Playbook/Resource groups
- [x] Admin Guides tab: simplified Section Visibility to only Help Articles + PDFs
- [x] Admin Guides tab: Add Guide form — always PDF, added Section field with datalist autocomplete from existing sections
- [x] Admin Guides tab: GuideGroups rewritten to show PDFs grouped by section with consistent header style
- [x] Customer-facing Guides & Docs: reordered — Help Articles first, then PDFs with sub-sections; removed Checklist/Playbook/Resource
- [x] Customer-facing Guides & Docs: unified formatting — both sections use same header pattern (icon + label + description + count + chevron + color divider)
- [x] Customer-facing Guides & Docs: PDFs grouped by section (category field), each section collapsible; flat list fallback when no sections set

## Guides & Docs Revamp — Help Articles + PDF Two-Section Model

- [x] Schema: create published_help_articles table (intercom_article_id, title, url, section_name, sort_order, section_order, published_at)
- [x] Backend: tRPC procedures — list published articles, publish article (with section), unpublish, reorder (sort_order), update section assignment
- [x] Backend: tRPC procedure — list Intercom collections with their articles (for admin browse panel)
- [x] Admin Guides tab: PDF section — drag-to-reorder PDFs within sections
- [x] Admin Guides tab: visual separator + "Synced from Intercom Help Center" label between PDF section and Synced Help Articles section
- [x] Admin Guides tab: Synced Help Articles section — browse Intercom collections, expand collection to see articles, Publish button per article, section name input with autocomplete
- [x] Admin Guides tab: Published Help Articles panel — shows published articles grouped by section, drag-to-reorder within section, rename section inline, remove article
- [x] Customer-facing Guides & Docs: Help Articles top-level section — reads from published_help_articles, collapsible sub-sections (by section_name), article rows link to Intercom URL
- [x] Customer-facing Guides & Docs: PDFs top-level section — collapsible sub-sections (by category), PDFs as rows with download + view
- [x] Customer-facing Guides & Docs: both top-level sections collapsible, sub-sections collapsible, consistent header style

## Admin Guides UX Revamp
- [x] Schema: add help_article_sections table (already exists in schema)
- [x] Backend: tRPC procedures for help article sections (already implemented)
- [x] Admin header: Add Help Article Section + Add PDF buttons exist
- [x] Add Help Article Section modal: implemented
- [x] Add PDF modal: section dropdown from DB sections (implemented)
- [x] Synced panel publish flow: dropdown of created help article sections (implemented)
- [x] All sub-sections collapsed by default on admin and customer-facing sides (implemented)
- [x] Top-level Help Articles and PDF headers are NOT collapsible (only sub-sections collapse) (implemented)
- [x] Page name / hero copy update on Guides & Docs page (now "WAVV Resource Hub")

## OIDC-Only Auth Migration (Session — Jun 15 2026)
- [x] Replace /login route: redirect to /api/oauth/login instead of showing password form (Login.tsx already redirects)
- [x] Remove Login.tsx password form (replaced with OIDC redirect component — already done)
- [x] BACKLOG: Update WavvPartnerPortal redirect — deferred until OIDC migration is live
- [x] BACKLOG: Update AcceptInvite for OIDC — deferred until OIDC migration is live
- [x] BACKLOG: Update acceptInvite procedure for OIDC — deferred until OIDC migration is live
- [x] BACKLOG: Remove legacy auth procedures (login, register, MFA, Google, magic link) — deferred until OIDC is fully live and stable
- [x] BACKLOG: Remove passwordHash + MFA columns from DB — deferred until OIDC is fully live and stable

## Remove Invite System (OIDC-only, roles managed post-login)
- [x] BACKLOG: Remove AcceptInvite.tsx + invite flow — deferred until OIDC provisioning model is decided
- [x] BACKLOG: Remove legacy auth pages (MagicAuth, MfaSetup, MfaVerify, MfaRequired, GoogleCallback, Register) — deferred until OIDC is fully live
- [x] BACKLOG: Remove legacy auth procedures (duplicate) — deferred until OIDC is fully live
- [x] BACKLOG: Remove passwordHash + MFA columns (duplicate) — deferred until OIDC is fully live

## Avatar / Picture Claim (OIDC)
- [x] Add `picture` column to users table in drizzle schema and run migration (avatarUrl column already existed)
- [x] Persist `picture` claim from OIDC id_token in oauth callback upsert
- [x] Expose `picture` field via auth.me response (avatarUrl already in allow-list)
- [x] Wire picture into PortalLayout header avatar (fallback to initials)
- [x] Wire picture into Admin panel user rows (initials fallback already in place)
- [x] Wire picture into Partner Portal header (uses PortalLayout, covered)

## Top Bar + Profile Page Cleanup (Jun 18)
- [x] Move Sign In / avatar button to top-right corner of PortalLayout top bar
- [x] Profile page: remove Lessons Completed, Webinars Watched, Guides Downloaded, Badges Earned stat cards
- [x] Profile page: remove Your Activity section
- [x] Profile page: replace Bookmarks section with Coming Soon placeholder
- [x] Profile page: replace Badges section with Coming Soon placeholder

## Profile Button + Resource Hub Cleanup (Jun 18)
- [x] Profile button in top bar: show avatar photo + name side by side (already implemented)
- [x] Remove export button from WAVV Resource Hub (no export button exists on customer-facing page)
- [x] Resource Hub admin: add Add PDF section alongside Add Help Article (already implemented)
- [x] Schema: add body/content column to help_articles for inline content (nativeBody column exists)
- [x] Admin: rich text editor for help article body (headers, bold, bullets, links) (Tiptap editor implemented)
- [x] Portal: render help article body inline instead of redirecting to external URL (inline modal with dangerouslySetInnerHTML)

## Inline Help Article Authoring (Native Articles)
- [x] Schema: add `source` enum (`intercom` | `native`) and `nativeBody` text column to `published_help_articles`; run migration
- [x] Server: update `guides.publishArticle` to accept `source`, `nativeBody`, `nativeAuthorName`
- [x] Server: add `guides.updateNativeArticle` mutation for editing native article body
- [x] Server: update `guides.getPublishedArticles` to return `nativeBody` (and `source` for admin only)
- [x] Admin UI: install Tiptap rich text editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`)
- [x] Admin UI: "Add Help Article" form shows Tiptap editor for body content (native articles only)
- [x] Admin UI: source badge (`Intercom` / `Native`) visible only in admin article list
- [x] Admin UI: edit button for native articles opens Tiptap editor pre-populated with existing body
- [x] Portal UI: clicking a help article opens inline modal showing rendered body HTML
- [x] Portal UI: Intercom articles render synced `body` HTML; native articles render `nativeBody`
- [x] Portal UI: no source label shown to customers
- [x] Portal UI: fallback to external link only if both `body` and `nativeBody` are null

## PDF Sections + Help Article Form Fixes (Jun 18 - Session 2)
- [x] pdf_sections table: schema added, migration applied, DB helpers (getPdfSections, createPdfSection, renamePdfSection, togglePdfSectionVisibility, deletePdfSection, reorderPdfSections) added
- [x] guides router: listPdfSections, createSection, renamePdfSection, togglePdfSectionVisibility, deletePdfSection, reorderPdfSections procedures added
- [x] PdfSectionsPanel: DB-backed, fetches from listPdfSections internally, drag-to-reorder, rename, toggle visibility, delete
- [x] Add PDF Section modal: wired to createSection mutation, invalidates listPdfSections on success
- [x] Add PDF form section pills: uses pdfSectionsAdmin (DB-backed) not guide-derived categories
- [x] Add Help Article inline form: moved to correct position (immediately after 4-button header, before Add PDF form)
- [x] createNativeHelpArticle: auto-creates helpArticleSections row if section doesn't exist

## PDF Sections Customer-Side Fix (Jun 18 - Session 3)
- [x] GuidesAndDocs: fetch listPdfSectionsPublic and pass dbSections to PdfSection component
- [x] PdfSection: use DB sections (visible only, sorted by sortOrder) as authoritative section order instead of deriving from guide category strings
- [x] PdfSection: orphaned guide categories (not in DB sections) still appear alphabetically after DB sections
- [x] PdfSection: unsectioned guides always render last

## FAQ Visual Consistency + Icon Fix (Jun 19 - Session 2)
- [x] FaqSubSection customer-side: replaced ? text characters with HelpCircle icon (matches PdfSubSection pattern exactly)
- [x] FaqSection header: replaced ? text character with HelpCircle icon
- [x] Admin FaqSectionsPanel: verified visual consistency with PdfSectionsPanel (same rounded-xl, #1d2230 bg, GripVertical drag handle, Pencil rename, Trash2 delete, green/gray visibility toggle)
- [x] Vite clean, TypeScript 0 errors, 47/47 tests passing

## Audit Remediation (Jun 19 - Audit Session)

### Verify / Fix
- [x] #1: Confirmed /resources → /guides redirect added; home page CTAs verified correct
- [x] #2: Verified — Support/Playground/Partners hidden via NavGuard; route-gated so direct URL access blocked for non-owners
- [x] #4: Verified — search.query covers courses, lessons, webinars, guides; FAQ will be added when FAQ content is populated
- [x] Access control: AdminGuard added to /wavvcommandcenter route; explicit allowlist: owner, publisher, partner_manager only
- [x] Access control: user/viewer roles redirect to /home from Command Center; hidden sections blocked via NavGuard regardless of login state

### Build
- [x] #12: FAQ section built — faq_sections + faq_entries tables, admin FaqSectionsPanel in GuidesTab, customer FaqSection in GuidesAndDocs
- [x] #3: Breadcrumbs added to LessonViewer: Academy > Course Name > Lesson trail with clickable links
- [x] #7: Loom oEmbed duration auto-fetch built — academy.fetchLoomDuration procedure, handleVideoUrlChange in Add Video dialog, durationSeconds stored in DB
- [x] PDF sections: Fixed — GuidesAndDocs now fetches listPdfSectionsPublic and renders DB-ordered visible sections

### Mobile Audit
- [x] #13: Mobile audit complete — sidebar hamburger/overlay confirmed working; Team Access and Approved Partners tables wrapped with overflow-x-auto + min-width; all content grids use responsive breakpoints (grid-cols-1 sm:2 lg:3)

### Flagged for Future / Leadership Discussion
- [x] BACKLOG: Analytics upgrade (per-user history, content viewed, completion rates) — deferred, GA4 is primary
- [x] BACKLOG: CRM segmentation (GHL vs HubSpot content tagging) — future build
- [x] BACKLOG: Help articles source of truth — discuss with leadership when Intercom is live
- [x] BACKLOG: Per-article feedback widget — future build
- [x] BACKLOG: noindex/nofollow SEO strategy — discuss with Marketing Director before public launch

## Batch 2 Fixes (Jun 19 - Session 3)
- [x] Search bar placeholder: change to "Search Help Articles, PDFs and FAQs"
- [x] Help Articles section rows: add GripVertical drag handle (match PDF/FAQ panel style from screenshot)
- [x] Admin Guides tab: move FAQ panel to render BELOW PDFs (currently at bottom, needs to be right after PDFs)
- [x] Admin Settings tab: add Playground under-construction toggle (same pattern as Support/Partners under construction, using Playground color scheme)
- [x] Admin Guides tab header: add "+ Add FAQ" button (solid yellow, opens Add FAQ Entry modal with section picker + Q&A + optional file attachment)
- [x] Admin panels: section count + article count badges on all 3 panels (Help Articles: N sections + N articles; PDFs: N sections + N PDFs; FAQs: N sections + N entries)
- [x] TypeScript: 0 errors | Tests: 47/47 passing

## Batch 3 + 4 Fixes (Jun 19 - Sessions 4+5)
- [x] Playground toggle: Enabled = Under Construction (red/warning badge), Disabled = Live (green badge)
- [x] Admin PlaygroundTab: shows under-construction overlay when toggle is Enabled
- [x] Add FAQ form: redesigned to match PDF New Guide pattern (Title, Description, Section picker, File Attachment, URL paste) — inline form, no popup modal
- [x] Add Help Article form: redesigned to match PDF New Guide pattern (Title, Description, Section picker, File Attachment, URL paste) — replaces TipTap editor
- [x] Customer FAQ FaqEntryRow: no file = inline Q+A display (no chevron); has file = expandable with chevron + download button
- [x] TypeScript: 0 errors | Tests: 47/47 passing

## Batch 5

- [x] Help Articles panel header: add sections count + total articles count badges (same format as PDF/FAQ panels)
- [x] PDF dropdown bug: newly added PDFs not appearing in section dropdown in Add PDF form (cache invalidation fix)
- [x] Expand/collapse parity: add chevron expand/collapse to Help Articles section rows and PDF section rows to match FAQ section rows exactly
- [x] Playground content management tab: permanently under construction — remove screenshot, add under-construction overlay (same as Support/Partners)
- [x] Settings: remove Playground Under Construction toggle (state hardcoded permanently)
- [x] Content Management nav: WAVV Playground tab hidden (show: false)
- [x] User-facing HandsOn.tsx: permanently shows under-construction (no toggle dependency)

## Batch 6 — Loom iframe fixes + Sign-in landing page

- [x] Add hideEmbedTopBar=true to Loom embed URLs in AcademyCategory.tsx (was missing)
- [x] Add hideEmbedTopBar=true to Loom embed URLs in LessonViewer.tsx (was missing)
- [x] Add sandbox attribute to all iframes (AcademyCategory, Webinars, LessonViewer, FloatingVideoPlayer) to block Loom redirect/clickthrough
- [x] Close floating player when new video starts (AcademyCategory.tsx handlePlay + Webinars.tsx handlePlay)
- [x] Create custom /signin landing page (SignIn.tsx) with WAVV branding, back button, and benefit copy
- [x] Add /signin route to App.tsx
- [x] Update PortalLayout.tsx Sign In button to point to /signin instead of /api/oauth/login

## Batch 7 — WAVV IdP Integration + Command Center Access Control

- [x] Schema: add account_type (employee/customer/guest), approval_status (pending/approved/denied), wavv_sub columns to users table
- [x] Schema: add wavv_account_id, subscription_status, plan, is_employee, is_customer columns to users table
- [x] Migration: apply schema changes via webdev_execute_sql
- [x] OAuth callback: parse Steve's token claims (account_type, sub, is_employee, is_customer, wavv_account_id, subscription_status, plan) and store on login
- [x] Update AdminGuard in App.tsx: gate on account_type=employee AND approval_status=approved
- [x] Update all admin tRPC procedures: server-side check for employee+approved
- [x] Seed Jake (jake@wavv.com) as approved employee/owner in DB
- [x] Admin Users tab: WAVV Team sub-tab with pending approval queue + team table (approve/deny/revoke)
- [x] Admin Users tab: Portal Users sub-tab with customer/guest table (account_type, subscription_status, plan, wavv_account_id, first seen, last login, lessons watched, bookmarks)
- [x] Owner notification when new employee signs in and enters pending queue
- [x] TypeScript check + checkpoint

## Analytics Upgrade — Date Range + Headline KPIs + Insights Tab (Session — Jun 22 2026)
- [x] Analytics date range switcher: 7D / 30D / 90D / 180D / 1Y / All (server validators updated to accept 180 and 365)
- [x] Headline KPI row: Total Signed-In Users (all time), Lessons Completed (period), Top Search Term (period)
- [x] Add Insights tab to Analytics panel tabs (alongside Overview, Academy, Webinars, Resource Hub)
- [x] Insights tab: Customer Journey Funnel (Anonymous → Signed-In → Started Lesson → Completed Lesson with drop-off %)
- [x] Insights tab: Content Performance table (Lessons — views, completions, completion rate with color-coded badges)
- [x] Insights tab: Top Search Terms ranked list
- [x] Insights tab: Zero-Result Searches ranked list (content gap signal)
- [x] Add getZeroResultSearches DB helper (queries content_requests where requestType=search_query)
- [x] Add getZeroResultSearches tRPC procedure to analytics router

## Session — Jun 25 2026
- [x] Admin.tsx: fix Babel parse error at line 350 (git merge conflict marker <<<<<<< HEAD — already resolved in prior session, confirmed clean)
- [x] Admin.tsx: replace AnonTimeRange type alias with inline union type (AnonTimeRange type removed, inline union used at usage site)
- [x] PortalLayout.tsx: remove sidebar Sign Out button (button, handleSignOut, signingOut state, LogOut icon, useAuth import all removed)
- [x] Profile.tsx: Badges icon color changed to teal #00A9E2 (Bookmarks=gold #fbbf24, Badges=teal #00A9E2)
- [x] Admin.tsx: add Bookmark icon to lucide-react imports
- [x] Admin.tsx Settings tab: add Profile Sections card with Bookmarks and Badges toggles (keys: bookmarks_enabled, badges_enabled, default visible)
- [x] Profile.tsx: read bookmarks_enabled and badges_enabled from siteSettings.getAll, conditionally render Bookmarks and Badges sections
- [x] TypeScript: 0 errors confirmed

## WAVV Accelerator — V1.0 Build (Jul 7 2026)
- [x] Add nav separator (Resources / Programs sections) to sidebar
- [x] Add WAVV Accelerator nav item in Programs section (hidden by default)
- [x] Move WAVV Playground below Resource Hub in Resources section
- [x] Create /accelerator route and Accelerator landing/marketing page
- [x] Build gated member view with 6 session tiles
- [x] Build individual session detail page (/accelerator/session/:id)
- [x] Add Accelerator visibility toggle to Command Center Settings
- [x] Subscription gating scaffold (placeholder until Stripe SKU integration confirmed)
- [x] TypeScript check passes with 0 errors
- [x] Tests pass

## Backlog
- [x] Add WAVV Chrome Extension quick link to sidebar (with visibility toggle)

## Accelerator Marketing Page Enhancements (Jul 7 2026)
- [x] Hero: rebuild as gradient box matching Academy/Partners pattern (orange accent)
- [x] Hero: larger "Available on Quarterly & Annual plans" badge
- [x] Hero: blended CTA button (gradient style, not flat orange)
- [x] Hero: add schedule line ("Live coaching calls every Tuesday & Thursday")
- [x] Add "The Partnership" section explaining WAVV × Prospecting On Demand relationship
- [x] Add social proof placeholder section
- [x] Add FAQ section (Can I join mid-cycle?, What if I miss a call?, etc.)
- [x] Add "What you'll need" prereqs line

## Chrome Extension + Visual Fixes — Jul 7 2026
- [x] Add Chrome Extension enabled/disabled toggle in Command Center Settings
- [x] Fix Playground hero gradient to match blue-primary scheme
- [x] Fix Accelerator hero text to stretch/fill like other sections
- [x] Fix Partners hero text to stretch/fill like other sections

## Accelerator Page Fixes — Jul 7 2026 (Round 2)
- [x] Fix blank space in The Partnership section (gap between cards)
- [x] Make all 6 "What's Included" tiles the same height
- [x] Increase blur on 6-Week Curriculum cards (heavier frosted glass)
- [x] Remove "What You'll Need" section — work requirement into CTA/hero
- [x] Rename sidebar Chrome Extension to "WAVV Chrome Extension" with Chrome icon

## Accelerator Member View Redesign — Jul 7 2026
- [x] Redesign unlocked/member view: 6 session tiles are the PRIMARY content above the fold
- [x] Member view: compact welcome header (no full marketing hero)
- [x] Member view: large, prominent session tile grid as the main visual element
- [x] Member view: upcoming live calls section below sessions
- [x] Member view: hide marketing copy (partnership, FAQ, social proof) for members who already have access
- [x] BACKLOG: Progress indicators on Accelerator session tiles — future build

## Accelerator Revamp — Jul 7 2026 (Round 3)
- [x] Member view: show ALL content (Partnership, FAQ, social proof, Money Math) — tiles first, marketing below
- [x] Fix Partnership section blank space / formatting cleanup
- [x] Gating logic: curriculum tiles grayed-out only for users without access (not hidden)
- [x] Gating logic: owner + Team Access users see tiles unlocked/clickable
- [x] Admin: Accelerator session editor — CRUD for 6 session landing pages in Command Center
- [x] Fix Chrome Extension sidebar name truncation ("WAVV Chrome Exten..." → shorter or non-truncating)
- [x] Session detail pages (/accelerator/session/:id) now load from database
- [x] Expose wavvPlan + subscriptionStatus in auth.me
- [x] NavGuard bypass expanded to all approved employees
- [x] CMO/CRO/COO audit of Accelerator marketing page for launch readiness

## Accelerator CMO/CRO Improvements — Jul 7 2026 (Round 4)
- [x] Rename sidebar back to "WAVV Chrome Extension" (fix truncation via CSS, not shortening name)
- [x] Remove "What Members Are Saying" placeholder section entirely
- [x] Add "Next Live Call" countdown placeholder section (ready for real dates)
- [x] Add floating/sticky upgrade CTA bar for non-access users
- [x] Add second CTA after FAQ section for non-access users
- [x] Add "What you're missing" quantification banner above upgrade CTA
- [x] Remove "enterprise" from qualifying plans (keep quarterly + annual only)
- [x] BACKLOG: Stripe billing portal redirect — blocked on Stripe integration + OIDC customer ID
- [x] BACKLOG: Add POD logo to Partnership section — pending asset from Kaden

## Route Rename — Jul 7 2026
- [x] Rename /guides route to /resourcehub (URL, sidebar nav, all internal links)

## Next Live Call Section Redesign — Jul 7 2026
- [x] Redesign "Next Live Call" section to be more eye-catching and visually commanding

## Accelerator UI Tweaks + POD Integration — Jul 7 2026
- [x] Next Live Call: make section bigger and more centered
- [x] Next Live Call: change Calendar icon to Clock icon
- [x] Next Live Call: add WAVV favicon (W) to the left
- [x] Pull POD logo from prospectingondemand.com and incorporate into Partnership section
- [x] Add "Preview as Customer" toggle for owner/employees to see the locked/gated view

## Visual Fixes + Partner Hub — Jul 7 2026
- [x] Remove W mark from Next Live Call section
- [x] Shrink clock icon and countdown boxes in Next Live Call
- [x] Standardize hero section height across all pages (Academy, Webinars, Resource Hub, Accelerator)
- [x] Build WAVV Partners page with same gating pattern as Accelerator
- [x] Partners locked state: marketing page with "Apply Now" CTA or "Sign In"
- [x] Partners unlocked state: partner hub (gated by role === partner_manager)
- [x] Employees see Partner page unlocked + Preview as Customer toggle
- [x] Add WAVV Partners to sidebar navigation (already existed)

## Toggle Labels + CTA Fixes — Jul 7 2026
- [x] Accelerator toggle: "Viewing as: WAVV Accelerator Member" / "Customer"
- [x] Partners toggle: "Viewing as: WAVV Partner" / "Customer"
- [x] WAVV Partners Portal sidebar link should navigate to /partners page (not external)
- [x] Fix Chrome Extension link (pointing to actual Chrome Web Store listing)
- [x] Customer-view CTA: "Unlock the Full Accelerator" + "Sign In" on Accelerator
- [x] Customer-view CTA: "Become a WAVV Partner" + "Sign In" on Partners page
- [x] Consistent top spacing across all pages so content doesn't shift when toggle is present/absent

## Toggle Text Fix + Sidebar Cleanup — Jul 7 2026
- [x] Toggle: remove "CUSTOMER" text on right side, only show role name that changes
- [x] Accelerator toggle: "Viewing As: WAVV Accelerator Member" ↔ "Viewing As: Non WAVV Accelerator Member"
- [x] Partners toggle: "Viewing As: WAVV Partner" ↔ "Viewing As: Non WAVV Partner"
- [x] WAVV Playground: add 32px spacer for consistent hero positioning
- [x] Delete WAVV Partners Portal sidebar link (redundant with toggle on Partners page)

## Bug Fix — Jul 7 2026
- [x] Fix: WAVV Playground flashes briefly on Home page Explore section before nav_visibility hides it

## Language & Plan Cleanup (Session Continuation)

- [x] Remove "enterprise" from QUALIFYING_PLANS in AcceleratorSession.tsx (was still present)
- [x] Remove all "bootcamp" language from Accelerator.tsx (replaced with "program" / "Accelerator")
- [x] Remove "bootcamp" from AcceleratorSession.tsx locked state message

## Hero Section Title Updates (Jul 7 2026)
- [x] Remove pill/bubble labels from all 7 hero sections (Home, Academy, Webinars, Resource Hub, Playground, Accelerator, Partners)
- [x] Keep only "COMING SOON" bubble above WAVV Playground title
- [x] Update hero titles: Home="WAVV Success Center", Academy="WAVV Academy", Webinars="WAVV Webinars", Resource Hub="WAVV Resource Hub", Playground="WAVV Playground", Accelerator="WAVV Accelerator", Partners="WAVV Partners"
- [x] Make all hero titles same size as Home section title

## Command Center Cleanup (Jul 7 2026)
- [x] Move Accelerator tab after Playground and before Partners in Content Management row
- [x] Remove "WAVV Partner Portal" from Navigation Visibility settings list
- [x] Remove Analytics tab from Operations row
- [x] Remove Approved Partners tab from Operations row
- [x] Operations row: only Access + Settings remain

## Accelerator & Partners Gating + Nav Revert (Jul 7 2026)
- [x] Revert hidden nav styling to previous look (remove grey-out + amber border, restore original hidden badge)
- [x] Accelerator non-member: add Sign In button in hero CTA (like Partners page)
- [x] Accelerator non-member: fix floating bar so it doesn't block footer (changed fixed to sticky)
- [x] Accelerator signed-in but not qualified: show pop-up "Whoops, please contact your account rep or upgrade your plan to gain access to WAVV Accelerator."
- [x] Accelerator signed-in not qualified: after dismissing pop-up, show "Upgrade your plan" button (no re-pop)
- [x] Partners signed-in but not approved: show pop-up "Whoops, looks like you're not an approved partner. Please apply, and our WAVV Partner team will be in contact with you."
- [x] Partners: same CTA pattern as Accelerator (Sign In button for non-signed-in users already existed)

## Accelerator & Partners CTA Refinements (Jul 7 2026)
- [x] Accelerator: increase blur on locked 6-week curriculum session cards
- [x] Accelerator: unify all CTA buttons to orange (hero "Become a WAVV Accelerator Member" should be orange, not blue)
- [x] Accelerator: Sign In button matches top-right corner style (solid blue, same as PortalLayout)
- [x] Accelerator: sticky bar copy → "Available on Quarterly and Annual Plans" (remove Upgrade button from sticky bar)
- [x] Accelerator: signed-in + qualified → hide all CTAs and sticky bar
- [x] Accelerator: signed-in + NOT qualified → hero shows "Upgrade Your Plan" (orange only), sticky bar informational only
- [x] Partners: Sign In button matches top-right corner style (solid blue, same as PortalLayout)
- [x] Partners: sticky bar → sticky positioning (not fixed), doesn't block footer
- [x] Partners: signed-in + approved → hide all CTAs and sticky bar
- [x] Partners: signed-in + NOT approved → after pop-up dismiss, show page normally with toned-down content (no aggressive CTA)
- [x] Accelerator: fix "The Partnership" section spacing (WAVV side vs POD side alignment)
- [x] Accelerator page: increase blur and disable interaction on locked 6-week curriculum cards
- [x] Accelerator page: update hero CTA state logic for unauthenticated vs non-qualifying users
- [x] Accelerator page: make unauthenticated UpgradeCTA styling orange and update sticky bar to informational-only copy
- [x] Accelerator page: add WAVV heading in the Partnership section to align with POD column
- [x] Partners page: show hero CTA buttons only for unauthenticated users
- [x] Partners page: show bottom CTA card only for unauthenticated users
- [x] Partners page: change sticky CTA bar from fixed to sticky and limit it to unauthenticated users

## Bug Fixes (Jul 7 2026 - Round 2)
- [x] Partners page: show hero CTA, bottom CTA, and sticky bar for all non-access users (not just unauthenticated)
- [x] Sidebar: add left border active indicator to Home nav item (same as other sections)
- [x] Admin Access tab: restore unique color-coding for role badges (Owner=green, Publisher=red, Partner Manager=blue, Viewer=slate)
- [x] Admin Access tab: color-code stat cards to match role badge colors
- [x] Admin Access tab: color-code Change Role dialog options to match role colors

## Bug Fixes (Jul 7 2026 - Round 3)
- [x] Admin Access tab: update role colors to Owner=orange, Publisher=purple, Partner Manager=blue, Viewer=yellow
- [x] Chrome Extension link: update to correct URL (https://chromewebstore.google.com/detail/wavv/ioopokcefgfbajhpcmkkbmipeenohhpe)
- [x] Chrome Extension sidebar: increase text size to match other nav items (text-sm)
- [x] Chrome Extension sidebar: neon-style Chrome logo with glow filter
- [x] Partners page: all CTA buttons consistently say "Apply Now"
- [x] Hero sections: standardize all pages to same height/padding (minHeight 280px, py-8 sm:py-12)

## WAVV Playground Redesign (Jul 7 2026)
- [x] Remove "COMING SOON" bubble from Playground hero section
- [x] Rename "WAVV Settings Playground" to "WAVV Messenger Playground" with SMS bubble icon
- [x] Make "Coming Soon" badges on cards bigger and bolder
- [x] Restructure into 3 sections: WAVV Playgrounds, Go High Level, HubSpot
- [x] Each section has 3 cards: WAVV Dialer Playground, WAVV Call Boards Playground, WAVV Messenger Playground

## Feedback Items (Jul 8 2026)
- [x] Resource Hub: remove duplicate search bar (master search bar already covers this)
- [x] SEO: add robots.txt as static file disallowing /accelerator, /partners, /playground, /profile, /wavvcommandcenter
- [x] SEO: add dynamic sitemap.xml listing public indexable URLs (home, /academy + category pages, /webinars, /resourcehub)
- [x] Webinars: implement view count tracking (increment on play, display on card)

## Actionable Items (Jul 8 2026 - Round 2)
- [x] Home: hide "What is WAVV?" section for signed-in users
- [x] Accelerator: update outcome copy to "Complete the WAVV Accelerator and walk away with a fully configured dialer, a proven outreach cadence, and the skills to hit your connection rate targets — in 6 weeks or less."

## Video Pop-out + Todo Cleanup (Jul 8 2026)
- [x] Standardize Webinar on-demand pop-out to match Academy large-format modal (title, view count, full-size iframe)
- [x] Enable native browser PiP on all video iframes (allowfullscreen + picture-in-picture policy attribute)
- [x] Clean todo.md: removed all SCRAPPED and ALREADY DONE lines
- [x] Update Evergreen Platform items: done — webinars are Loom embeds inside the Success Center, no external platform needed

## Personalization Features (July 2026)

- [x] Add personalized greeting to all hero sections for signed-in users ("Welcome back, [First Name]." replaces hero subtitle)
- [x] Add "Continue Learning" section to Home page (Academy last incomplete lesson + last viewed webinar, hidden if no activity)
- [x] Make Exclusive Live Webinar tile on Home conditional (only show when scheduledAt is in the future or within live window)

## Personalization Features (Jul 8, 2026)
- [x] Personalized greeting "Welcome back, [First Name]." in all hero sections (Dashboard, Academy, Webinars, Resource Hub, Partners, Accelerator, Support)
- [x] "Continue Learning" section on Home page — Academy in-progress course card + latest On-Demand webinar card (hidden when no activity)
- [x] Exclusive Live Webinar tile — tightened to only show when event is within 7-day window (was showing all future events indefinitely)

## Resource Hub Push Layout (Jul 8, 2026)
- [x] ResourceSidePanel: convert from fixed overlay to push layout (flex sibling in PortalLayout body row)
- [x] Push layout: main content shifts left when panel opens, no backdrop/overlay, closes only via X
- [x] PortalLayout: add optional rightPanel prop for persistent right panel slot
- [x] Hero subline: updated from "Search help articles, PDFs, and FAQs organized by topic." to "Help articles, PDFs, and FAQs organized by topic."

## Side Panel UX + PDF Security (Jul 8, 2026)
- [x] ResourceSidePanel: add drag handle on left edge to resize panel width (push layout)
- [x] ResourceSidePanel PDF viewer: block native browser download/print toolbar

## Accelerator Live Call Schedule (Jul 8, 2026)
- [x] Define 12-session schedule: Tue+Thu, 6 weeks starting Jul 21 2026, 12pm MT / 2pm ET
- [x] Build useAcceleratorSchedule hook: computes next session, current week, session number, countdown target
- [x] Replace static countdown placeholder with live ticking countdown (days/hours/min/sec)
- [x] Show current week label and session number (e.g. "Week 1 · Session 1 of 2") next to countdown
- [x] Link countdown section to the current session page (/accelerator/session/:id)
- [x] Add late-joiner asterisk note: "Joining mid-cycle? Catch up on previous sessions by clicking into each week."
- [x] "Upcoming Live Calls" section: replace placeholder with real schedule list for members

## Accelerator UI Polish + Session Pages (Jul 8, 2026)
- [x] Fix date labels in SCHEDULE array (Jul 21 is Tuesday, not Jul 22)
- [x] Enlarge countdown clock digits (bigger numbers)
- [x] Remove "First session: Tuesday, July 21" bottom bar text; replace with clean date label
- [x] Fix date display labels to spell out full date (e.g. "Tuesday, July 21st, 2026 · 12:00 PM MT / 2:00 PM ET")
- [x] Add per-session countdown + join button to UpcomingCallsList rows (grayed out until 30 min before)
- [x] AcceleratorSession.tsx: add session-level countdown timer (D/H/M/S to that session)
- [x] AcceleratorSession.tsx: add join button (grayed out until 30 min before, active during call window)
- [x] AcceleratorSession.tsx: show upcoming schedule for all sessions in that week
- [x] AcceleratorSession.tsx: add Loom recording slot (admin can paste URL, shows embedded player when set)

## OIDC Subscription Fix (Jul 2026)
- [x] oauth.ts: after login, fetch live subscription data from GET /oauth/customer/{wavv_account_id} and persist subscriptionStatus + wavvPlan + billingPeriod to DB
- [x] routers.ts: add accelerator.getEntitlement procedure (server-side live fetch, returns entitled/plan/billingPeriod/status)
- [x] routers.ts: add accelerator.getManageSubscriptionUrl mutation (fetch Stripe portal URL on demand, return for immediate redirect)
- [x] Accelerator.tsx: replace token reads (wavvPlan/subscriptionStatus) with trpc.accelerator.getEntitlement.useQuery()
- [x] Accelerator.tsx: replace static pricing link with live Stripe portal redirect button
- [x] AcceleratorSession.tsx: same entitlement fix as Accelerator.tsx
- [x] wavvOidc.ts: remove stale subscription_status/plan from token type definition

## OIDC Employee Role Fix (Jul 2026)
- [x] oauth.ts: add GET /oauth/employee/{id} live fetch for employees at login — use returned role to set internal role
- [x] wavvOidc.ts: remove stale fields from WavvIdTokenClaims (role, permissions, sections, is_super_admin, has_admin_access, given_name, family_name, email_verified)
- [x] Save OIDC reference doc to references/

## Version Polling Auto-Refresh (Jul 2026)
- [x] Add GET /api/version endpoint that returns current build hash
- [x] Inject build hash at server startup (timestamp-based, no build step required)
- [x] Build useVersionCheck hook: polls /api/version every 60s, detects change
- [x] Build UpdateBanner component: 10s countdown auto-refresh, delayed 30s if user is active
- [x] Wire UpdateBanner into App.tsx (global, always rendered)

## Auto-Refresh Toggle in Command Center (Jul 2026)
- [x] Add auto_refresh_enabled key to site_settings (default: true)
- [x] Expose toggle in Command Center Settings tab
- [x] /api/version endpoint returns auto_refresh_enabled flag
- [x] useVersionCheck respects the flag — skips auto-refresh logic when disabled

## OIDC Token Shape Change: wavv_account_id → wavv_user_id + employee_id (Jul 2026)
- [x] drizzle/schema.ts: rename wavvAccountId → wavvUserId (wavv_account_id → wavv_user_id), add employeeId (employee_id)
- [x] Run DB migration SQL via webdev_execute_sql
- [x] wavvOidc.ts: update WavvIdTokenClaims type (wavv_user_id, employee_id; remove wavv_account_id)
- [x] oauth.ts: map new token fields at login, update upsertUser calls
- [x] routers.ts: switch getEntitlement/getManageSubscriptionUrl to use wavvUserId; switch employee fetch to use employeeId; update facet checks (wavvUserId non-null instead of accountType=customer)
- [x] server/db.ts: update upsertUser to handle wavvUserId and employeeId columns
- [x] Admin.tsx: update wavvAccountId display column to wavvUserId
- [x] Update references/wavv-oidc-reference.md with new token shape

## Section Row UI Standardization + Spacebar Fix
- [x] Fix spacebar bug: add e.stopPropagation() to all inline section name edit inputs (PDF, FAQ, Help Articles)
- [x] Standardize section row UI: all three content types (Help Articles, PDFs, FAQs) use identical row layout — grip icon, chevron, name, edit pencil, count badge, visibility toggle, delete button

## Accelerator UI Fixes (Jul 10, 2026)
- [x] Remove "WAVV" prefix from Accelerator h1 heading, sidebar nav label, and page title
- [x] Move upgrade copy paragraph above "Upgrade Your Plan" button in no_access hero block
- [x] Confirm Week 1 sessions are unblurred and clickable during free window (logic was already correct)
- [x] Remove all "6 weeks" language: subline, banner, curriculum heading, FAQ answer, feature card title, and comment

## Live Subscription Check via OIDC (Jul 13, 2026)
- [x] Implement server-side GET /oauth/customer/{wavv_user_id} call for live subscription status (already implemented)
- [x] Key Accelerator access off wavv_user_id presence (not account_type) (already implemented)
- [x] Update Accelerator access gating to use live subscription data instead of login-time snapshot (already implemented)
- [x] Fix status string: add PENDING_CANCELLATION to entitled statuses (WAVV IdP uses this instead of SCHEDULED_CANCEL)
- [x] Write tests for the subscription check logic (15 tests in wavvOidc.test.ts already cover this)

## Facet-Based Identity Fix (Jul 13, 2026)
- [x] Fix is_employee to be based on !!employeeId || isWavvEmail (not exclusive account_type routing)
- [x] Fix is_customer to be based on !!wavvUserId || hasActiveSubscription (not exclusive account_type routing)
- [x] Audit and fix all account_type usage — dual employee+customer accounts must work
- [x] Ensure Command Center access works for users who are both employee AND customer
## Bugs (Jul 14, 2026)
- [x] Fix "No Subscription" filter in WAVV Users table — should show Steve Keiser and Jacob Moser (guests with no subscription)
- [x] Fix spacing between sections in the WAVV Users Command Center table

## Session 1 Free Window + Language Updates (Jul 14, 2026)
- [x] Add free-window constants (Jul 10–Jul 27) to AcceleratorSession.tsx (client-side)
- [x] Add isWeek1FreeNow() helper and week1FreeActive to useAcceleratorAccess() in AcceleratorSession.tsx
- [x] Bypass no-access gate for Session 1 during free window (sessionFree = week1FreeActive && weekId === 1)
- [x] Align server-side free window start date to Jul 10 00:00 UTC (was Jul 20)
- [x] Update all "Week" → "Session" language in AcceleratorSession.tsx (title, breadcrumb, hero tag, schedule nav, catch-up text)
- [x] Remove "of 6" from session number display
- [x] Change "By the end of this week" → "By the end of this session"
- [x] Unauthenticated users can view Session 1 without signing in during free window (confirmed: hasAccess=false + sessionFree=true bypasses lock)

## Accelerator Soft Launch Fixes (Jul 14, 2026)
- [x] Session 1 tile must be visually unlocked (no blur, clickable) for non-members during free window
- [x] Sessions 2-6 tiles remain locked/blurred for non-members
- [x] Banner text: "Week 1" → "Session 1"
- [x] Verify the tile click navigates to /accelerator/session/1 for non-members during free window

## Accelerator Non-Member UX Polish (Jul 14, 2026)
- [x] "You're Missing" → "What You're Missing" in banner section
- [x] Make the "What You're Missing" banner section bigger/more prominent
- [x] Remove duplicate "Available on Quarterly & Annual Plans" text (not needed — bigger banner pushes content down naturally)
- [x] During free window: messaging should be "Session 1 is on us — upgrade for the full program"
- [x] After free window: standard "Upgrade Your Plan" messaging
- [x] Verify upgrade CTA routes unauthenticated users through sign-in first (shows both "Unlock" + "Sign In" buttons for unauth users)
- [x] Unauthenticated users: upgrade CTA routes to sign-in first (OAuth login with return_path=/accelerator), not directly to Stripe/pricing
- [x] Employee accounts: upgrade button shows toast ("Employee preview mode — this button is for subscribers only") instead of redirecting to wavv.com/pricing

## Accelerator Session Pages Redesign + CMS (Jul 14, 2026)
- [x] Rename "Accelerator" → "WAVV Accelerator" in Content Management nav tab
- [x] Add accelerator_content DB table (type: recording | product_training, fields: session_number, title, loom_url, thumbnail_url, host_name, duration, sort_order)
- [x] Add Zoom link field to accelerator_sessions table (join_url per session)
- [x] Build tRPC CRUD procedures for accelerator content (list by session+type, create, update, delete, reorder)
- [x] Build admin CMS panel for per-session content management (add/edit/remove recordings and product training videos with Loom URL, title, host, thumbnail)
- [x] Redesign Session Recordings section: webinar-style thumbnail cards (same as WAVV Webinars on-demand)
- [x] Redesign WAVV Product Training section: smaller card-based layout (not giant video embed), same thumbnail card style
- [x] Shrink product training video area (currently way too large)
- [x] Ensure Zoom join link field in admin feeds into the "Join" button (opens 30 min before)

## Previous Session Recordings Rename + Admin Form Update (Jul 14)
- [x] Rename "Session Recordings" → "Previous Session Recordings" on all 6 session detail pages
- [x] Move "Previous Session Recordings" section below WAVV Product Training and above Full Program Schedule
- [x] Update admin CMS form for adding recordings to match webinar "New Webinar" form (Title, Host, Description, Video URL/upload or paste external URL, Thumbnail with default play circle, custom thumbnail upload/URL, enable pop-out checkbox)
- [x] Create branded default thumbnail for "Previous Session Recordings" (WAVV Accelerator play button + dark navy gradient)
- [x] Add "Coming Soon" toggle to Accelerator content form (same as webinars)
- [x] Move add/edit form to appear directly under the relevant section (recordings or training) instead of at the bottom
- [x] Remove Duration field from Accelerator content form
- [x] Match default thumbnail preview border/glow color to section accent color (blue for recordings, green for training)
- [x] Fix: Homepage "Continue Learning" and "Explore the Center" sections should not render when all modules are hidden
- [x] Add per-session fields: registrationUrl, joinUrl, sessionDateTime to accelerator schema
- [x] Add session-level "Coming Soon" flag (comingSoon) to accelerator_sessions table
- [x] Add "Current/Next Session" admin setting for the Accelerator landing page
- [x] Build admin CMS UI for per-session registration URL, join URL, date/time, and coming soon toggle
- [x] Restore countdown timer on Accelerator landing page pointing to next session
- [x] Add "Not registered? Click here to view the next session" CTA below countdown
- [x] Session cards on landing page: Coming Soon sessions show badge and are not clickable
- [x] Per-session detail page: Register button (visible when registrationUrl is set)
- [x] Per-session detail page: Join Live button (visible only 15 min before sessionDateTime)
- [x] Add large countdown timer to Accelerator landing page hero (both no-access and member views)
- [x] Add "Not registered?" CTA below countdown linking to next session detail page
- [x] Rename session registration button to just "Register" (clean label)
- [x] Replace disabled "Join link opens 15 min before" with a mini countdown that ticks down, then transforms into active "Join Live" button at T-15 min
- [x] Week 1 free (through July 26): Add "Go to Session 1" button + "Upgrade Your Plan" button side by side on the no-access Accelerator hero
- [x] Week 1 free callout copy: "Session 1 is free through July 26 — upgrade to unlock the full program."
- [x] Fix: Update SessionCallCard join button to use mini countdown (same as Session Access section)
- [x] Register button always visible on session detail pages — active when URL is set, disabled/greyed when not
- [x] Add per-session "Cheat Sheet URL" field to schema, DB, and admin CMS
- [x] Add pinned Cheat Sheet callout card on session detail page with side panel PDF viewer
- [x] Unify "Go to Session 1" button styling across member and non-member Accelerator landing pages
- [x] Color-code the "Go to Session" button to match the current active session's color
- [x] Remove "To WAVV First Dial In 10 Minutes" section from Accelerator page
- [x] Remove countdown digits from SessionCallCard (Live Call Cards on session detail pages) — replace with static Join button
- [x] Replace mini countdown on Session Access Join button with static disabled Join + asterisk note
- [x] Remove per-row countdowns from Full Program Schedule table on session detail pages
- [x] Add italicized asterisk note below Register/Join buttons: "* Join button opens 15 minutes before session"
- [x] Remove "Session Access" section from session detail page entirely
- [x] Add countdown timer to each Upcoming Live Calls card (time until that session starts)
- [x] Match "Go to Session 1" button size and arrow style to the "Upgrade Your Plan" button (non-member hero)
- [x] Move Cheat Sheet callout card into the WAVV Product Training section (not standalone above it)
- [x] Color WAVV Product Training section cards and default thumbnails to match the session's color
- [x] Change Product Training video grid to 2 columns (not 3) so cards fill the width
- [x] Update CMS admin session content page to use session-colored accents (matching member-facing side)
- [x] Fix: Page refresh forces re-sign-in (session/cookie not persisting across reloads)
- [x] Remove Cheat Sheet URL field from session-level CMS (per-week settings) and tie it to the Product Training section instead
- [x] Remove custom thumbnail upload fields from CMS forms (Resource Hub + Accelerator) — use stock color-coded thumbnails only
- [x] Add cheatSheetUrl field to individual training videos (schema + CMS form) — tie cheat sheet to specific video, not session
- [x] Redesign Live Call countdown on session detail to use digit boxes (DAYS/HRS/MIN/SEC) matching the hero countdown style
- [x] Redesign Live Call cards to match Exclusive Live Webinar style — CMS-managed events with custom thumbnails, descriptions, registration buttons
- [x] CMS-managed live call events: new accelerator_live_calls DB table (per-call records with session, call number, title, description, date/time, registration URL, join URL, thumbnail)
- [x] CMS-managed live call events: tRPC CRUD procedures (create, update, delete, list by session)
- [x] CMS-managed live call events: admin CMS form to manage per-session live calls
- [x] CMS-managed live call events: rewrite SessionCallCard to render from DB (webinar-style cards with thumbnail, description, Register + Join buttons)
- [x] CMS-managed live call events: update hero countdown to use DB events instead of hardcoded SCHEDULE
- [x] CMS-managed live call events: remove hardcoded SCHEDULE array from AcceleratorSession.tsx and Accelerator.tsx
- [x] Fix: Error when clicking into a Session detail page (React hooks ordering violation — moved listLiveCalls queries above conditional returns)
- [x] Fix: Countdown clock missing on Accelerator landing page (added dbSessions fallback when no CMS live call events exist)
- [x] Simplify session editor: remove Video URL, Registration URL, Join URL, Session Date/Time, Color picker fields
- [x] Add timezone selector to Live Call Events form (Eastern, Central, Mountain, Pacific — default Mountain)
- [x] Replace Cheat Sheet URL input with PDF file upload
- [x] Consolidate CMS: move Live Call Events into each session's edit view (not a standalone section)
- [x] Remove standalone AcceleratorLiveCallManager section from AcceleratorTab
- [x] Session visibility: replace Published/Draft/ComingSoon/Accessible toggles with 3-state selector (Visible / Hidden / Coming Soon)
- [x] Show 6 session tiles for both members and non-members (Session 1 free/clickable for non-members, 2-6 locked with upgrade indicator)
- [x] After July 26, Session 1 also becomes gated for non-members
- [x] Remove Full Program Schedule section from Accelerator landing page
- [x] Session detail page: only show live calls for THAT specific session (not all sessions combined)
- [x] CMS: fold Session Content (Recordings + Product Training) into each session's edit view
- [x] Remove "Full Program Schedule" section from session detail pages (AcceleratorSession.tsx)
- [x] Ensure session detail page only shows: Title, Hero CTA, Upcoming Live Calls, WAVV Product Training + Cheat Sheets, Session Recordings
- [x] Fix /accelerator landing page 404 (nav_visibility setting blocking access) so 6 clickable session tiles render
- [x] CMS session list: add Visible/Hidden/Coming Soon toggle on each session row (next to Edit button) for quick visibility management
- [x] CMS session list: Hidden toggle color = red when active (not grey)
- [x] CMS session list: move Visible/Hidden/Coming Soon toggles to right side of row (inline with title)
- [x] CMS session list: change "Week N" labels to "Session N"
- [x] Product Training: default thumbnail color = session color (not purple)
- [x] Upload PDF button: styled like Upload Video button (document emoji)
- [x] Live Call Events form: remove duration calculator field
- [x] Add Slack Community section per session (DB field + CMS editable + clickable on member page)
- [x] Non-member Accelerator landing page: add CTA callout for what's included in the program
- [x] Accelerator landing: Session 1 free banner orange = same shade as What You're Missing banner (#f97316)
- [x] Accelerator landing: Combine What You're Missing + Private Slack Community into one unified banner
- [x] Accelerator landing + session pages: Replace MessageSquare icon with Slack SVG logo (neon style)
- [x] Accelerator member home page: Add Slack Community section (visible when slackUrl is set on any session)
- [x] CMS session edit panel: Remove Visibility section (it's now on the row-level toggle)
- [x] CMS session content: Fix thumbnail to use session color (not purple) for product_training items
- [x] Accelerator member hero: add "Go to Session N →" button (same blue style as non-member) pointing to current active session
- [x] Member hero: remove duplicate "Go to Session" button (LiveCallCountdown already renders one)
- [x] Non-member page: add Slack Community banner (same style as member page)
- [x] Non-member Slack tile: "Members Only" button → triggers upgrade flow (same as Upgrade Your Plan)
- [x] Non-member page: remove "What You're Missing" section entirely
- [x] Both pages: restore missing 6th tile in "What's Included" section
- [x] What's Included tile: replace MessageSquare icon with neon Slack SVG for Private Slack Community tile
- [x] CMS product training thumbnail: replace solid color tint + base image with neon glow style (dark radial bg + glowing play icon, no base image) matching screenshot 4
- [x] CMS edit panel: fix thumbnail preview to use neon glow style (dark bg + session-colored glowing play icon), matching the row thumbnail
- [x] Live call form: replace date/time text input with calendar date picker + time selector; fix timezone defaulting to 6am
- [x] Live call cards: center Register/Join buttons on tile and make them larger
- [x] CMS session content: rename sections — "WAVV Product Training" above "Previous Session Recordings"
- [x] Non-member Slack banner: match exact color scheme of member page "Join the WAVV Accelerator Slack" section, but locked (no clickable buttons)
- [x] Both Accelerator pages: move "Join the WAVV Accelerator Slack" section to below "What's Included" (after the 6 tiles)
- [x] Both Accelerator pages: move "Money Math" section to below FAQs
- [x] Session page: Previous Session Recordings grid — 2 tiles per row (matching Product Training layout)
- [x] Live call cards: increase thumbnail area height so image takes up more of the card than text/buttons
- [x] Admin settings: add Slack banner visibility toggles (WAVV member page + Accelerator member page) — stored in DB, read by frontend
- [x] Session CMS: move Slack URL into its own standalone section with show/hide toggle per session
- [x] Live call cards: fix visual blending/overlap on Session 1 Upcoming Live Calls section
- [x] Live call cards: reduce dead space in the bottom body of the tile
- [x] Resource Hub: add "Open in new tab" button to Help Articles side panel (matching PDF section)
- [x] Resource Hub: add "Open in new tab" button to FAQs side panel (matching PDF section)
- [x] Content cards: increase thumbnail height for better image visibility
- [x] Resource Hub: debug help article side panel not populating body content
- [x] Accelerator page: suppress non-member orange banner flash on load before auth resolves
- [x] Settings Slack banners: rename labels to "Non-WAVV Accelerator Member Page" and "WAVV Accelerator Member Page"
- [x] Session page: move Slack Community section below Previous Session Recordings
- [x] Session CMS: clicking a session row opens the edit panel (not just the Edit button)
- [x] Accelerator page: redesign "Next Live Call" block to look cleaner
- [x] Session page: fix Call 1 of 2 / Call 2 of 2 badge — should not appear clickable
- [x] Default thumbnails: fix webinar section default thumbnails (neon glow style applied to product_training cards)
- [x] Default thumbnails: fix accelerator session default thumbnails (neon glow style for product_training, tinted bg for recordings)
- [x] Session page: add more visual spacing/separation between sections (space-y-14)
- [x] Live call countdown tiles: reduce dead space around countdown timer (py-1, gap-1.5, smaller digit boxes)

## Session 3 Fixes (Jul 17 2026)
- [x] Revert product_training ContentCard thumbnail to match live call/recording neon style (tinted bg + image overlay, not the plain radial gradient)
- [x] Live call tiles: increase thumbnail height so rocket image is not cut off; reduce dead space left/right of countdown timer
- [x] Admin CMS session rows: remove standalone Edit button — entire row should be clickable to open edit panel
- [x] Admin CMS edit panel: fix "Week 1" label to say "Session 1" (matches collapsed row label)
- [x] Admin CMS edit panel: move Slack Community section below Session Content (Live Calls + Recordings + Product Training); make all sections visually consistent

## Session 4 Fixes (Jul 17 2026 - round 2)
- [x] Session 1 page: clean up thumbnails and tiles (ContentCard + SessionCallCard) — consistent neon style, no clunky layouts
- [x] Non-WAVV member page: fix section spacing (sections too close together)
- [x] Partnership section: fix text alignment and logo positioning on both non-member and member pages
- [x] Both member pages: add "Join the Slack Community" section with Slack banner below existing content

## Session 5 Fixes (Jul 17 2026)
- [x] Live call tiles: remove dead space below countdown — tighten tile body so it doesn't have excess empty area
- [x] ContentCard thumbnails: match style/size to Webinars On-Demand thumbnails (taller, consistent aspect ratio)
- [x] Accelerator page: WAVV member and non-member section headers — change blue accent to orange
- [x] Accelerator page: normalize hero section height; move countdown timer to a separate section below the hero so it doesn't distort hero proportions
- [x] Accelerator page: fix partnership section empty space below text
- [x] Session pages: confirm "Join the Slack Community" section is at the very bottom; apply gradient section headers consistently across all subsections (matching Home page "What is WAVV" gradient style)

## Session 6 Fixes (Jul 17 2026)
- [x] Resource Hub: replace plain section dividers for Help Articles, PDFs, and FAQs with gradient section headers (matching "What is WAVV?" style — accent bar + bold label + muted subtitle)

## Session 7 Fixes (Jul 17 2026)
- [x] Playground: add gradient bar separator to GO HIGH LEVEL and HUBSPOT section headers (keep logos, add the "|" bar)
- [x] Site-wide: turn grey body/description text to white on Home, Academy, Webinars, Resource Hub, Playground
- [x] Left nav panel: ensure all text fits without overflow; fix hidden banners not covering content

## Session 8 Fixes (Jul 18 2026)
- [x] Resource Hub: align Help Article and FAQ rows to match PDF row style (same card bg, icon badge, white title, hover "Open" pill)
- [x] Resource Hub: fix Intercom article open crash (use intercomArticleId for classification, not URL domain matching)
- [x] Resource Hub: fix FAQ section to use collapsible subsection headers matching PDF/Help Articles pattern
- [x] Site-wide: grey-to-white text sweep on Partners, Accelerator, Playground, Webinars, Resource Hub, Dashboard
- [x] Title size/weight bumps on Accelerator, Partners, Dashboard section headers
- [x] Sidebar: jet-black background, WAVV gradient right border, larger logo, Quick Links moved below Programs
- [x] All hero sections: remove tile/card background — keep text only
- [x] Accelerator timer: update existing live call DB records to 12:00 PM MDT (18:00 UTC)
- [x] Accelerator timer: fix form default so new calls default to noon MT (not noon UTC)

## Session 9 Fixes (Jul 18 2026)
- [x] Academy tiles: regenerate gear (How-To) and target (Strategy) banners to match compass composition
- [x] Command Center Academy tab: replace Lucide icon watermarks with actual banner images matching public Academy
- [x] Home page: show "What is WAVV?" section at all times (not conditional on auth)
- [x] How-To gear banner: regenerate in correct How-To section color (#00A9E2 light blue) instead of blue/teal
- [x] Academy tiles brightness: match public Academy tile brightness to CMS tile brightness (reduce overlay darkness)

## Session 10 Fixes (Jul 18 2026)
- [x] Webinars: remove hover play button overlay from Exclusive On-Demand cards (was showing on all cards with video URLs)
- [x] Webinars: update "Request a Webinar" CTA tile accent color to #10b981 (WAVV Webinars section color)
- [x] Webinars: update default webinar accent fallback in ContentRequestCTA and ContentRequestForm to #10b981
- [x] Webinars: verify each section (evergreen, exclusive, recording) has its own unique default thumbnail background

## Resource Hub Redesign (Jul 18 2026)
- [x] Generate 3 neon icon banners matching Academy style: magnifying glass (Help Articles), clipboard (PDFs), chat bubble (FAQs)
- [x] Add Academy-style category tile banners to Resource Hub page (clickable, expand to show content)
- [x] Rename "Request a Written Guide" to "Request a Resource" across CTA component and forms
- [x] Update Resource Hub CTA accent color to match Resource Hub section color (#67C728)
- [x] Update CMS Command Center Resource Hub tab to match new tile styling (admin toggle label renamed to 'Resource Requests')

## Resource Hub Color + CMS Layout Update (Jul 18 2026)
- [x] Update Resource Hub colors from purple/red/gold to WAVV brand: Help Articles=#0074F4 (blue), PDFs=#00A9E2 (cyan), FAQs=#67C728 (green)
- [x] Redesign CMS Resource Hub layout to match public-facing tile organization (category tile headers, clean sections)
- [x] Add collapsible/minimizable wrapper to Synced Help Articles section in CMS

## Resource Hub Restructure - Academy Mirror (Jul 18 2026)
- [x] Rewrite Resource Hub landing page with 3 large rectangle tiles (navigational links, not expandable)
- [x] Create /resources/help-articles sub-page showing all help articles content
- [x] Create /resources/pdfs sub-page showing all PDF content
- [x] Create /resources/faqs sub-page showing all FAQ content
- [x] Register routes in App.tsx for sub-pages
- [x] Update colors: Help Articles=#0074F4, PDFs=#00A9E2, FAQs=#67C728
- [x] CMS: Update FAQ color references from #eab308 to #67C728
- [x] CMS: Add collapsible wrapper to Synced Help Articles section

## Webinars Restructure (Jul 18 2026)
- [x] Generate neon banner: play circle (blue #0074F4) for On-Demand Series
- [x] Generate neon banner: diamond (green #67C728) for Exclusive On-Demand
- [x] Keep existing star banner (cyan #00A9E2) for Live Exclusive
- [x] Rewrite Webinars landing page with 3 large navigational tiles
- [x] Create /webinars/on-demand sub-page
- [x] Create /webinars/live-exclusive sub-page
- [x] Create /webinars/exclusive-on-demand sub-page
- [x] Register routes in App.tsx
- [x] Rebuild Webinars CMS to Academy-style with per-tile visibility toggles

## Playground Restructure (Jul 18 2026)
- [x] Generate neon banner: Go High Level logo (blue #0074F4)
- [x] Generate neon banner: HubSpot logo (cyan #00A9E2)
- [x] Generate neon banner: Salesforce logo (green #67C728)
- [x] Build Playground landing page with 3 tiles + Coming Soon banner
- [x] Add Request Access / Get Notified CTA at bottom
- [x] Create /playground/gohighlevel sub-page
- [x] Create /playground/hubspot sub-page
- [x] Create /playground/salesforce sub-page
- [x] Register routes in App.tsx
- [x] Build Playground CMS with per-tile hide/show
- [x] Per-tile visibility controls for all sections

## UI Fixes Batch (Jul 18 2026)
- [x] Fix Webinar Live Exclusive banner: change from gold/yellow to cyan (#00A9E2)
- [x] Fix Resource Hub icon banners: update colors from purple/red/gold to blue/cyan/green
- [x] Fix Playground tile layout: change from 3-up grid to stacked rectangles (same as Academy/Webinars)
- [x] Sidebar icons: make all icons and text white (remove colored active states)
- [x] Request buttons: make white instead of colored
- [x] What is WAVV tiles on homepage: use blue, cyan, green
- [x] Academy sub-URLs: already correct (dynamic /academy/category/:key pattern)
- [x] Webinar sub-pages: replace card grid with clean list (neon banner hero + video rows with Watch Now, Description, Host, Play)
- [x] Resource Hub sub-pages: add neon icon banner hero at top
- [x] Playground sub-pages: add actual GHL/HubSpot/Salesforce neon banner hero at top

## Icon Removal + Banner Update (Jul 18 2026)
- [x] Remove all sidebar nav icons (keep text labels only)
- [x] Remove homepage "What is WAVV?" tile icons
- [x] Remove CTA icons (request buttons)
- [x] Regenerate Live Exclusive Webinar banner: spotlight/stage light instead of star
- [x] Update banner URL in Webinars landing page and Live Exclusive sub-page

## UI Fixes Batch 2 (Jul 18 2026)
- [x] Remove icons from all Request CTA sections (Request a Video, Request a Resource, etc.)
- [x] Make Request CTA button style consistent across all sections (white outline button)
- [x] Make "Learn More →" white instead of blue on homepage
- [x] Ensure "Coming Soon" CMS checkbox reflects on customer-facing tiles
- [x] Remove star icon from Live Exclusive Webinars empty state
- [x] Remove "Help Articles" heading from Help Articles sub-page (match PDFs/FAQs layout)
- [x] Remove "Coming Soon" banner from Playground landing page (already shown on tiles)
- [x] Add neon compass banner to Onboarding Academy sub-page + remove section icons
- [x] Add neon gear banner to How-To Academy sub-page + remove section icons
- [x] Add neon target banner to Strategy Academy sub-page + remove section icons
- [x] Ensure all section landing page tiles are visually cohesive across Academy, Webinars, Resource Hub, Playground

## UI Fixes Batch 3 (Jul 19 2026)
- [x] Fix Coming Soon filter: show webinars in list with Coming Soon badge instead of hiding them entirely
- [x] Standardize hero section heights across all pages (Home, Academy, Webinars, Resource Hub, Playground)
- [x] Remove gradient bar ("|") next to "What is WAVV?" heading on homepage

## UI Fixes Batch 4 (Jul 19 2026)
- [x] Change Coming Soon badge color to Gold across all pages
- [x] Remove construction icon from the 3 WAVV Playground section tiles
- [x] Fix all 5 hero sections to same fixed height (match tallest) so tiles align when switching pages
- [x] Collapse sub-sections by default in Help Articles, PDFs, and FAQs pages
- [x] Rename "Resources" sidebar category to "Explore" + center all category titles

## Admin Settings Tab UI Polish (Jul 19 2026)
- [x] Remove all small icons next to items in Settings tab sections
- [x] Announcement Banner: top 2 toggles gold, rest blue
- [x] Maintenance Mode: keep red banner
- [x] Profile Sections: visible = green, hidden = red
- [x] Request Buttons: visible = green, hidden = red
- [x] Slack Banners: visible = green, hidden = red
- [x] Quick Links: visible = green, hidden = red
- [x] Navigation Visibility: remove icons, visible = green, hidden = red

## Settings Tab Reorganization (Jul 19 2026)
- [x] Remove gear icon from "Site Settings" heading
- [x] Reorganize Settings into logical segments with sub-headings (Site Controls, Visibility Controls, Integrations)

## Settings Tab Layout + Sidebar Fix (Jul 19 2026)
- [x] Move Navigation Visibility into Visibility Controls segment, rename to "Section Visibility", place at top
- [x] Make Settings tab 2-column: Site Controls (left), Visibility Controls (right)
- [x] Fix sidebar hidden banners from gold to red

## Admin Tab Icons + Layout Polish (Jul 19 2026)
- [x] Remove icons from Operations and Content Management tab buttons
- [x] Add separators between tab sections (Operations / Content Management)
- [x] Center "SITE CONTROLS" and "VISIBILITY CONTROLS" column headings

## Access Tab Filter Tiles Polish (Jul 19 2026)
- [x] Remove icons from All Users, Owners, Publishers, Partner Managers, Viewers filter tiles
- [x] Replace greyed-out label text with colored role bubbles (orange for Owner, etc.)
- [x] Audit Access section for additional cleanup opportunities
- [x] Make filter tile label text white (not grey)

## Access Tab Headers + Portal Users Redesign (Jul 19 2026)
- [x] Make Operations and Content Management header text white
- [x] Pick consistent colors for Refresh and Export buttons (both tabs)
- [x] Redesign WAVV Users (Portal Users) view to mirror WAVV Team layout with subscription-based filter tiles
- [x] Center the WAVV logo in the left sidebar
- [x] Make external link icon white (not gray) in Quick Links sidebar section

## WAVV Users + Requests Cleanup (Jul 19 2026)
- [x] Remove "All Types / Customers / Guests" chip row from WAVV Users panel
- [x] Remove bell icon from Content Requests header
- [x] Rename request sections: Video Requests, Webinar Requests, Resource Requests, Search Requests
- [x] Update request subtexts: WAVV Academy, WAVV Webinars, WAVV Resource Hub, General Search Bar
- [x] Remove colored dots from request section headers
- [x] Standardize all Export buttons to same blue color throughout the app

## Partners Section Polish (Jul 19 2026)
- [x] Remove icon next to "WAVV Partners Content" header
- [x] Make WAVV Partners / WAVV Partners Portal toggle buttons standard blue
- [x] Replace construction placeholder with subtle "Coming Soon" message

## WAVV Playground Tab Cleanup (Jul 19 2026)
- [x] Remove icon next to "WAVV Playground" header
- [x] Remove icon from Total Requests tile
- [x] Restructure: move All Requests inline with Total Requests (shrink tile, put them side by side)
- [x] Make Export Requests button standard blue

## Playground Requests Area Cleanup (Jul 19 2026)
- [x] Remove Total Requests tile entirely
- [x] Make the total count in All Requests header white
- [x] Remove "No requests yet" icon (flask icon in empty state)
- [x] Add column headers (Name, Email, Playground, etc.) to All Requests table
- [x] Show "No requests" text row when empty (no icon)

## WAVV Users Search Bar Fix (Jul 19 2026)
- [x] Make WAVV Users search bar same size/structure as WAVV Team search bar (remove extra wrapper div)

## Gray/Black Tile Pattern (Jul 19 2026)
- [x] Settings tab: Site Controls tiles (Announcement Banner, Auto Refresh, Maintenance Mode, Intercom) get gray header / black body
- [x] Settings tab: Visibility Controls tiles (Section Visibility, Request Buttons, Slack Banners, Quick Links) get gray header / black body
- [x] Settings tab: SITE CONTROLS and VISIBILITY CONTROLS column heading text → white
- [x] Add gray tile background around "Site Settings" section header
- [x] Add gray tile background around "Access" section header
- [x] Add gray tile background around "Content Requests" section header
- [x] Add gray tile background around "WAVV Partners Content" section header

## Playground / Resource Hub / Access UI Fixes (Jul 19 2026)
- [x] Playground: column headers row (Name, Email, Playground, Notes, Date) should be gray, body below should be black
- [x] Resource Hub: remove icon next to "WAVV Resource Hub" header
- [x] Resource Hub: reorder sections to 1) Add Help Articles, 2) Add PDF, 3) Add FAQ
- [x] Resource Hub: use new color schemes (blue, cayenne/red, green) for the 3 section buttons
- [x] Resource Hub: remove "Visibility Controls" text entirely
- [x] Resource Hub: remove external link button next to the 3 visibility buttons
- [x] Resource Hub: remove subtext next to Help Articles, PDFs, and FAQs headers
- [x] Resource Hub: section headers (Help Articles, PDFs, FAQs) get gray border, body below them is black (flip invert)
- [x] Resource Hub: make caret and drag button white text, leave pencil gray
- [x] Access WAVV Users: table column headers row (User, Type, Subscription, etc.) should be gray background

## Resource Hub Section Visibility Tile (Jul 19 2026)
- [x] Add Section Visibility tile back to Resource Hub with toggles for Help Articles, PDFs, and FAQs (matching dark tile style)

## Resource Hub + Section Visibility Fixes (Jul 19 2026)
- [x] PDF buttons → cayenne/dark red color (not bright red)
- [x] Help Articles/PDFs/FAQs subsection rows → black background when expanded
- [x] Remove green eye icon from Section Visibility header
- [x] PDFs dot in Section Visibility → cayenne (not red)
- [x] Replicate Section Visibility tile to WAVV Academy tab (replace existing visibility controls)
- [x] Replicate Section Visibility tile to WAVV Webinars tab (replace existing visibility controls)
- [x] Replicate Section Visibility tile to WAVV Playground tab (replace existing visibility controls)

## Comprehensive CMS UI Fixes (Jul 19 2026)
- [x] PDF buttons (Add PDF Section, Add PDF) → cyan color (#00A9E2)
- [x] Help Articles/PDFs/FAQs subsection rows → black background, content inside rows → gray (alternating)
- [x] FAQ counter badge on section rows → green (not yellow)
- [x] WAVV Webinars header → remove icon
- [x] Upcoming Exclusive Live Webinars tile → add column headers (Title, Host, Views, Actions) always visible even when empty
- [x] WAVV Academy CMS → remove icon next to WAVV Academy header
- [x] WAVV Academy CMS → remove colored banner images from section cards
- [x] WAVV Academy CMS → Inactive Sections always expanded/visible (no click to open)
- [x] WAVV Academy CMS → remove "Section PDF Resources" section, merge PDF upload into Add Video flow
- [x] WAVV Academy CMS → move Add Section + Add Video buttons to top right (matching other CMS sections)

## Academy + Accelerator CMS Fixes (Jul 19 2026 - Session 2)
- [x] ContentTab: "Live Sections & Courses" header row → gray background bar (#1d2230) with border
- [x] ContentTab: "Inactive Sections & Courses" header row → gray background bar (#1d2230) with border
- [x] AcceleratorTab: add top header bar with 3 Add buttons (blue: Live Call Event, cyan: Product Training, green: Previous Recording)
- [x] AcceleratorTab: each session block expands to show 3 sub-tables (Live Call Events, Product Training, Previous Session Recordings)
- [x] AcceleratorSubTable: black sub-table headers, gray column headers, alternating gray content rows
- [x] AcceleratorAddDialog: global add dialog from top header buttons with session selector and type switcher

## Accelerator Customer-Facing Rebuild (Jul 19 - Session 3)
- [x] Accelerator landing: Replace session cards with Academy-style full-bleed banner tiles (circuit pattern, color-coded S1/S4 blue, S2/S5 cyan, S3/S6 green)
- [x] Accelerator landing: Section headers (Curriculum, Partnership, Community, FAQs) use gradient dash only — remove icons from What's Included cards
- [x] Accelerator landing: "Join the Slack Community" → just "Community" with gradient dash, no Slack icon in header
- [x] Accelerator landing: FAQs section — remove the gradient bar, keep just text heading with gradient dash
- [x] AcceleratorSession: Redesign as a 3-tile hub page (Live Call Events, Product Training, Previous Recordings) matching Academy category tile style
- [x] AcceleratorSession: Generate unique icons for Live Call Events, Product Training, and Previous Recordings tiles
- [x] AcceleratorSession: Preserve timer/countdown, access gating, and all existing CMS data queries
