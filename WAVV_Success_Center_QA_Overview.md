# WAVV Success Center — QA Overview

**Live Domain:** [wavvsuccesscenter.manus.space](https://wavvsuccesscenter.manus.space)

---

## What Is This?

The WAVV Success Center is a private, role-gated knowledge hub for WAVV customers, internal team members, and partners. The North Star is **customer education at scale** — every piece of content is designed to solve a specific customer problem. Users land here to learn WAVV, watch webinars, download guides, and get support. Admins manage content and users from a separate admin panel. Partners have their own dedicated portal.

---

## URL Map

### Public / Unauthenticated

| URL | What It Is | Who Sees It |
|---|---|---|
| `/` or `/dashboard` | Main homepage — hero, feature cards, quick links to Academy, Webinars, Guides | Anyone (no login required) |
| `/academy` | WAVV Academy course catalog | Anyone |
| `/academy/:courseId` | Individual course detail page | Anyone |
| `/academy/:courseId/lesson/:lessonId` | Lesson viewer (video + content) | Anyone |
| `/webinars` | Upcoming and on-demand webinars | Anyone |
| `/guides` | Guides & Docs library | Anyone |
| `/support` | Support ticket submission form | Anyone |
| `/partners` | Public WAVV Partner Program landing page | Anyone |
| `/login` | Email + password login page | Anyone |
| `/accept-invite` | First-login password setup (via invite link) | Invited users only |

---

### Authenticated — Internal Admin Portal

| URL | What It Is | Who Can Access |
|---|---|---|
| `/wavvadmin` | Full admin panel (see tabs below) | Owner, Customer Admin, Partner Admin, Admin |

**Admin Panel Tabs:**

| Tab | What It Does | Who Can Take Action |
|---|---|---|
| **Team Access** | View all users, roles, invite new members, reset passwords, remove users | View: all 4 admin roles · Actions: Owner only |
| **Academy** | Manage courses, lessons, categories, section resources | Owner / Customer Admin |
| **Webinars** | Create/edit upcoming and on-demand webinars | Owner / Customer Admin |
| **Guides & Docs** | Upload and manage downloadable guides | Owner / Customer Admin |
| **Support** | View and respond to support tickets | Owner / Customer Admin |
| **Partner Analytics** | View approved partners, invite new partners, see engagement | Owner / Partner Admin |
| **WAVV Knowledge** | Internal AI chat (Ask WAVV) | All admin roles |
| **Settings** | Toggle Ask WAVV, announcement banner, maintenance mode | Owner only |

---

### Authenticated — Partner Portal

| URL | What It Is | Who Can Access |
|---|---|---|
| `/wavvpartner` | WAVV Partner Program portal — partner-specific resources, links, content | Partner, Partner Admin, Owner |

---

## Role Reference

| Role | Portal Access | Admin Panel Access | Can Invite / Manage Users |
|---|---|---|---|
| **Owner** | Yes (both) | Full access, all tabs | Yes — full control |
| **Customer Admin** | Yes (main portal) | Yes — content management tabs | No |
| **Partner Admin** | Yes (both) | Yes — partner analytics tab | Can invite partners |
| **Admin** | Yes (main portal) | Read-only Team Access only | No |
| **Partner** | Partner portal only | None | No |

---

## QA Checklist by Area

### Auth Flow
- [ ] `/login` — enter a valid email + password → lands on correct portal for role
- [ ] `/login` — wrong password → red error message, no access
- [ ] `/login` — email not in system → red error message
- [ ] `/accept-invite?token=...` — valid token → set password form → correct portal after submit
- [ ] `/accept-invite?token=...` — expired or used token → error message shown
- [ ] Sign Out button visible in sidebar for all logged-in users → logs out and returns to `/`

### Role Routing
- [ ] Owner logs in → lands on `/wavvadmin`
- [ ] Customer Admin logs in → lands on `/wavvadmin`
- [ ] Admin logs in → lands on `/wavvadmin`
- [ ] Partner logs in → lands on `/wavvpartner`
- [ ] Partner Admin logs in → lands on `/wavvpartner`
- [ ] Partner tries to navigate to `/wavvadmin` → redirected to `/wavvpartner`
- [ ] Admin/Customer Admin tries to navigate to `/wavvpartner` → redirected to `/wavvadmin`

### Team Access (Admin Panel)
- [ ] All 4 admin roles can see the Team Access tab and search users
- [ ] Non-owners see the read-only banner and no action buttons
- [ ] Owner can invite a new team member (role dropdown works, link generates)
- [ ] Owner can reset a user's password (generates fresh invite link)
- [ ] Owner can change a user's role
- [ ] Owner can remove a user

### Partner Invite Flow
- [ ] Owner goes to Partner Analytics tab → Invite Partner → enters name + email → link generates
- [ ] Partner clicks link → sets password → lands on `/wavvpartner`
- [ ] Partner appears in Approved Partners list in admin panel
- [ ] Partner has no Admin link in sidebar
- [ ] Partner cannot access `/wavvadmin`

### Content Pages
- [ ] Academy course catalog loads with categories
- [ ] Individual course page loads with lessons listed
- [ ] Lesson viewer plays video content
- [ ] Webinars page shows upcoming and on-demand sections
- [ ] Guides & Docs page loads with downloadable files
- [ ] Support form submits successfully (ticket appears in admin panel)

### Admin Content Management
- [ ] Create a new Academy course → appears on `/academy`
- [ ] Create a new webinar → appears on `/webinars`
- [ ] Upload a new guide → appears on `/guides`
- [ ] View and respond to a support ticket

### Ask WAVV (AI Chat)
- [ ] Floating chat button visible on content pages
- [ ] Chat responds to questions
- [ ] Internal admin WAVV Knowledge tab responds

---

## Known Placeholders / Not Yet Built

These are scoped but intentionally deferred until content is approved and ready:

- Partner portal content is placeholder — real content to be added before go-live
- Academy content is seeded/demo data — real course content to be loaded
- Webinar content is placeholder — real webinar links and recordings to be added
- Guides library needs real WAVV documentation uploaded
- "Forgot password" self-service flow — currently owner must trigger a reset link manually

---

*Last updated: June 1, 2026*
