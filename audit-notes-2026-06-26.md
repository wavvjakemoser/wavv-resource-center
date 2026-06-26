# WAVV Success Center Audit Notes — 2026-06-26

## Desktop audit findings

### Pages checked
- `/` Home
- `/academy`
- `/academy/category/Onboarding`
- `/webinars`
- `/guides`
- `/profile`
- `/404`

### Confirmed working
- Public landing page renders cleanly on desktop with left nav, hero, feature cards, and footer.
- Academy page renders correctly with three category cards.
- Academy category page accordion expands correctly and exposes lesson row with Watch CTA.
- Webinars page renders correctly with tab row and webinar cards.
- Guides page renders correctly with search input and resource sections.
- Profile page renders with top-right Sign Out button only; duplicate sidebar sign-out is gone.
- Profile page shows distinct icon colors: Bookmarks uses gold, Badges uses teal.

### Issues found
1. **404 page is visually disconnected from the rest of the site.**
   - URL: `/404`
   - Finding: page has no site navigation/header/sidebar and drops the user into a standalone full-screen error state.
   - Impact: inconsistent experience and weak recovery path, especially for users who expect normal site navigation.

2. **Profile page still shows Sign In in the global header while also showing Sign Out in the profile card.**
   - URL: `/profile`
   - Finding: header shows `Sign In`, but page body shows `Sign Out` button.
   - Impact: contradictory auth state cues; likely auth-loading or auth-state handling bug.

## Mobile audit findings

### Screenshots captured
- `/home` → `/home/ubuntu/screenshots/mobile_home.png`
- `/academy` → `/home/ubuntu/screenshots/mobile_academy.png`
- `/webinars` → `/home/ubuntu/screenshots/mobile_webinars.png`
- `/guides` → `/home/ubuntu/screenshots/mobile_guides.png`
- `/profile` → `/home/ubuntu/screenshots/mobile_profile.png`
- `/404` → `/home/ubuntu/screenshots/mobile_404.png`

### Confirmed working on mobile
- Header compresses into hamburger + search + sign-in button pattern.
- Home page hero and content cards stack cleanly without obvious horizontal overflow.
- Academy page hero and category cards stack correctly.
- Webinars page hero and cards stack correctly; tabs remain readable.
- Guides page hero, search, and resource groups stack correctly.
- Profile page stacks correctly; Bookmarks and Badges sections remain distinct and readable.

### Mobile issues found
1. **Same auth-state mismatch on Profile page.**
   - Header still shows `Sign In` while profile card shows `Sign Out`.
   - Visible in `/home/ubuntu/screenshots/mobile_profile.png`.

2. **Need explicit verification of mobile 404 screenshot and mobile drawer behavior.**
   - Screenshot not yet visually reviewed in context.
   - Hamburger menu behavior not yet clicked/tested.

## Highest-confidence next fixes
1. Fix auth-state/header mismatch so signed-in users do not see `Sign In` in the global header.
2. Bring 404 page into the shared site shell/navigation or otherwise give it a consistent branded recovery path.
3. Verify hamburger menu behavior on mobile and inspect mobile 404 screenshot.
