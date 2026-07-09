# WAVV OIDC — Subscription Data Change

## What changed
- `plan`, `subscription_status`, `subscription` fields **removed from id_token**
- id_token now carries identity only: `sub`, `account_type`, `email`, `name`, `wavv_account_id`
- Join key: `wavv_account_id` (or `sub` = `customer:<wavv_account_id>`)

## Live entitlement endpoint
```
GET https://admin.wavv.com/oauth/customer/{wavv_account_id}
Authorization: Basic base64("<client_id>:<client_secret>")
```
Response:
```json
{
  "account_type": "customer",
  "wavv_account_id": "...",
  "email": "...",
  "name": "...",
  "plan": "Multi Line",
  "subscription_status": "ACTIVE",
  "subscription": {
    "status": "ACTIVE",
    "plan": "Multi Line",
    "seats": 3,
    "billing_period": "yearly",
    "current_period_start": "2026-07-01T00:00:00.000Z",
    "current_period_end": "2027-07-01T00:00:00.000Z",
    "cancel_at_period_end": false,
    "amount_cents": 89000
  }
}
```
- Entitled statuses: `ACTIVE | TRIALING | SCHEDULED_CANCEL`
- Quarterly/annual check: `billing_period ∈ ["quarterly", "yearly"]`
- Safe to call on every page load (re-reads DB each time)

## Manage subscription URL (Stripe portal)
```
GET https://admin.wavv.com/oauth/customer/{wavv_account_id}/manage-subscription-url
Authorization: Basic base64("<client_id>:<client_secret>")
```
Response: `{ "url": "https://billing.stripe.com/session/..." }`
- **Short-lived, single-use** — fetch on click, redirect immediately, never cache

## Auth for server-to-server calls
- HTTP Basic: `client_id:client_secret` (base64 encoded)
- Same credentials as token endpoint
- Backend only — never expose client_secret in browser

## Affected files in this project
| File | Issue | Fix needed |
|------|-------|-----------|
| `client/src/pages/Accelerator.tsx` lines 230-231 | Reads `user.wavvPlan` + `user.subscriptionStatus` from token | Replace with server-side entitlement fetch |
| `client/src/pages/AcceleratorSession.tsx` lines 62-63 | Same token reads | Same fix |
| `server/_core/oauth.ts` lines 168-169, 203-204, 225-226, 248-249 | Reads `subscription_status` + `plan` from token/userinfo at login | These fields will be null/missing — update to fetch live or store from live endpoint at login |
| `server/_core/wavvOidc.ts` line 135 | Type still declares `subscription_status` on token | Update type to remove stale fields |
| `server/db.ts` line 55 | `subscriptionStatus` + `wavvPlan` stored in users table | Fields can stay for caching but need to be populated from live endpoint, not token |
| `client/src/pages/Admin.tsx` | Displays `wavvPlan` + `subscriptionStatus` from DB user record | Will show stale/null data until live fetch populates it |

## Not affected
- `accountType` (employee/customer/guest) — still in token, no change needed
- `approvalStatus` — employee-only field, not subscription-related
- All admin role checks (`accountType === "employee"`) — unaffected
