# WAVV OIDC Reference (Jul 2026)

## Overview

WAVV Admin (`https://admin.wavv.com`) is the OpenID Provider. The model is: **the login flow proves who the user is; a separate server-to-server API tells you what they're entitled to / allowed to do, always live.** Nothing that can change (subscription, role) is ever baked into a token.

---

## 1. Login Flow (Authorization Code + PKCE)

1. Redirect browser to `GET /oauth/authorize` with `client_id`, `redirect_uri`, `scope`, `state`, PKCE `code_challenge` (S256)
2. `POST /oauth/token` (auth: `client_id` + `client_secret` + PKCE `code_verifier`) → exchange code for `id_token` + `access_token`
3. Auto-configures from `GET /.well-known/openid-configuration`; token signatures verify against `GET /oauth/jwks.json`

---

## 2. Token Contents (Identity Only)

```json
{
  "sub": "customer:abc123",
  "account_type": "customer",
  "email": "bob@customerco.com",
  "name": "Bob Jones",
  "picture": null
}
```

- `sub` is the permanent identifier — namespaced (`customer:<id>` / `employee:<id>`). Key records off `sub`.
- `account_type` tells you which resource endpoint to call.
- **No subscription or role data in the token** — it would go stale. Fetch live ↓.

---

## 3. Live Data Endpoints (Server-to-Server, Basic Auth)

Auth: `Authorization: Basic base64("<client_id>:<client_secret>")`  
**Backend-only — never expose `client_secret` in the browser.**

### Customer Details

```
GET https://admin.wavv.com/oauth/customer/{wavv_account_id}
```

```json
{
  "wavv_account_id": "abc123",
  "email": "bob@customerco.com",
  "name": "Bob Jones",
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

**Active?** `status ∈ ACTIVE | TRIALING | SCHEDULED_CANCEL`  
**Quarterly/Annual?** `billing_period ∈ ["quarterly", "yearly"]`

### Manage Subscription Link (Stripe Portal)

```
GET https://admin.wavv.com/oauth/customer/{wavv_account_id}/manage-subscription-url
```

```json
{ "url": "https://billing.stripe.com/session/…" }
```

⚠️ Short-lived & single-use — fetch on click, redirect immediately. Never cache. `404` if not Stripe-billed.

### Employee Details

```
GET https://admin.wavv.com/oauth/employee/{employee_id}
```

```json
{
  "employee_id": "0f2c…",
  "email": "jane@wavv.com",
  "name": "Jane Smith",
  "role": "admin",
  "permissions": ["billing", "support"],
  "sections": ["billing-payments", "twilio-numbers"]
}
```

**Role mapping:**
- `super_admin` → `owner`
- `admin` → `publisher`
- `user` → `viewer`

---

## 4. Removed Token Fields → New Source

| Removed field | Get it now from |
|---|---|
| `plan`, `subscription_status`, `subscription` | `GET /oauth/customer/{id}` (Basic auth) |
| `role`, `permissions`, `sections`, `is_super_admin`, `has_admin_access` | `GET /oauth/employee/{id}` (Basic auth) |
| `wavv_account_id` | Still in `sub` as `customer:<id>`; also returned by customer endpoint |
| `is_employee`, `is_customer` | Derive from `account_type` |
| `given_name`, `family_name` | Use `name` |
| `email_verified` | Always true — drop the check |

---

## 5. Implementation in This Project

| Feature | Implementation |
|---|---|
| Customer entitlement check | `trpc.accelerator.getEntitlement` — calls `/oauth/customer/{id}` server-side |
| Stripe portal redirect | `trpc.accelerator.getManageSubscriptionUrl` — calls `/oauth/customer/{id}/manage-subscription-url` on click |
| Employee role at login | `fetchEmployeeDetails()` in `server/_core/wavvOidc.ts` — called in `oauth.ts` callback for `@wavv.com` accounts |
| Token type | `WavvIdTokenClaims` in `server/_core/wavvOidc.ts` — trimmed to identity-only fields |
