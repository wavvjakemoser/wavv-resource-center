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
