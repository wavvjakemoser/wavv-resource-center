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
- [ ] Landing page: rename feature cards to "WAVV Guides & Docs", "WAVV Playground", "WAVV Support"
- [ ] Admin Webinars tab: add CSV export of webinar registrants (name, email, webinar title, date registered)
- [ ] Admin Guides tab: add CSV export of guide downloaders (name, email, guide title, date downloaded)
- [ ] Admin Playground & Support tab: add CSV export of support ticket submitters (name, email, subject, category, date)
- [ ] Add tRPC admin procedures: getWebinarRegistrants, getGuideDownloaders, getSupportSubmitters
- [ ] Webinars page: restructure into 3 sections — Upcoming Exclusive, Evergreen, On-Demand Recordings
- [ ] DB: add webinar_section enum/column (exclusive | evergreen | recording) to webinars table
- [ ] Admin Webinars tab: add section selector (Exclusive / Evergreen / Recording) when creating/editing webinars
- [ ] Webinars page: Upcoming Exclusive shows 1 featured webinar with prominent CTA
- [ ] Webinars page: Evergreen shows 5-10 registerable webinars in a grid
- [ ] Webinars page: On-Demand Recordings shows past recording cards
