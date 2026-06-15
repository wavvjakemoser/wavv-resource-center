/**
 * WAVV IdP OIDC + PKCE (S256) integration
 *
 * Replaces Manus OAuth SDK. Implements Authorization Code + PKCE flow
 * against https://admin.wavv.com.
 *
 * Environment variables required:
 *   WAVV_OIDC_CLIENT_ID      — client ID registered with WAVV IdP
 *   WAVV_OIDC_CLIENT_SECRET  — client secret
 *   WAVV_OIDC_REDIRECT_URI   — must match registered redirect URI exactly
 */

import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

// ─── Constants ────────────────────────────────────────────────────────────────

export const WAVV_ISSUER = "https://admin.wavv.com";
const WAVV_AUTH_URL = "https://admin.wavv.com/oauth/authorize";
const WAVV_TOKEN_URL = "https://admin.wavv.com/oauth/token";
const WAVV_USERINFO_URL = "https://admin.wavv.com/oauth/userinfo";
const WAVV_JWKS_URL = "https://admin.wavv.com/oauth/jwks.json";

// Lazy-loaded JWKS set (caches keys, auto-rotates)
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!_jwks) _jwks = createRemoteJWKSet(new URL(WAVV_JWKS_URL));
  return _jwks;
}

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

/** Generate a cryptographically random code verifier (43–128 chars, URL-safe) */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(48).toString("base64url");
}

/** Derive S256 code challenge from verifier */
export function deriveCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

/** Generate a random state value */
export function generateState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// ─── Authorization URL ────────────────────────────────────────────────────────

export interface AuthUrlParams {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  returnPath?: string;
}

export function buildAuthorizationUrl(params: AuthUrlParams): string {
  const url = new URL(WAVV_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (params.returnPath) {
    url.searchParams.set("return_path", params.returnPath);
  }
  return url.toString();
}

// ─── Token exchange ───────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  });

  const res = await fetch(WAVV_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[WAVV OIDC] Token exchange failed ${res.status}: ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

// ─── ID token verification ────────────────────────────────────────────────────

export interface WavvIdTokenClaims {
  sub: string;                   // stable external ID, e.g. "employee:<uuid>"
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  account_type?: string;         // "employee" today; "customer" later
  role?: string;                 // "user" | "admin" | "super_admin"
  permissions?: string[];
  sections?: string[];
  is_super_admin?: boolean;
  has_admin_access?: boolean;
}

export async function verifyIdToken(idToken: string, clientId: string): Promise<WavvIdTokenClaims> {
  const { payload } = await jwtVerify(idToken, getJwks(), {
    issuer: WAVV_ISSUER,
    audience: clientId,
  });
  return payload as unknown as WavvIdTokenClaims;
}

// ─── Userinfo (live re-read) ──────────────────────────────────────────────────

export async function fetchUserInfo(accessToken: string): Promise<WavvIdTokenClaims> {
  const res = await fetch(WAVV_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`[WAVV OIDC] Userinfo fetch failed ${res.status}`);
  }
  return res.json() as Promise<WavvIdTokenClaims>;
}

// ─── Role mapping ─────────────────────────────────────────────────────────────
//
// WAVV IdP roles → Success Center internal roles
//
//   super_admin  → owner
//   admin        → publisher   (has_admin_access = true)
//   user         → viewer      (default authenticated employee)
//
// Partner Manager role is assigned manually in the Command Center after first login.
// Customers (account_type = "customer") map to "user" role — gated content TBD.

export type SuccessCenterRole = "owner" | "publisher" | "partner_manager" | "viewer" | "user";

export function mapWavvRoleToInternal(claims: WavvIdTokenClaims): SuccessCenterRole {
  if (claims.is_super_admin || claims.role === "super_admin") return "owner";
  if (claims.has_admin_access || claims.role === "admin") return "publisher";
  return "viewer";
}
