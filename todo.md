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
