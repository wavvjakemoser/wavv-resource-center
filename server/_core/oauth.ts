/**
 * WAVV IdP OAuth routes
 *
 * Handles:
 *   GET /api/oauth/login    — initiates PKCE flow, stores verifier in session cookie
 *   GET /api/oauth/callback — exchanges code, verifies ID token, upserts user, issues session
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { createSessionToken } from "../nativeAuth";
import { ENV } from "./env";
import {
  buildAuthorizationUrl,
  deriveCodeChallenge,
  exchangeCodeForTokens,
  fetchCustomerDetails,
  fetchEmployeeDetails,
  fetchUserInfo,
  generateCodeVerifier,
  generateState,
  isActiveSubscription,
  mapWavvEmployeeRoleToInternal,
  mapWavvRoleToInternal,
  verifyIdToken,
} from "./wavvOidc";

const PKCE_COOKIE = "wavv_pkce";
const STATE_COOKIE = "wavv_state";
const PKCE_COOKIE_MAX_AGE = 10 * 60 * 1000; // 10 minutes

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  /**
   * GET /api/oauth/login
   * Initiates the PKCE authorization code flow.
   */
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const returnPath = getQueryParam(req, "return_path") || "/";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = deriveCodeChallenge(codeVerifier);
    const state = generateState();

    const clientId = ENV.wavvOidcClientId;
    const redirectUri = ENV.wavvOidcRedirectUri;

    if (!clientId || !redirectUri) {
      res.status(500).json({ error: "WAVV OIDC not configured" });
      return;
    }

    const authUrl = buildAuthorizationUrl({
      clientId,
      redirectUri,
      state,
      codeChallenge,
      returnPath,
    });

    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: PKCE_COOKIE_MAX_AGE,
      path: "/",
    };
    res.cookie(PKCE_COOKIE, codeVerifier, cookieOpts);
    res.cookie(STATE_COOKIE, state, cookieOpts);

    res.redirect(302, authUrl);
  });

  /**
   * GET /api/oauth/callback
   * Receives authorization code, exchanges for tokens, verifies ID token,
   * upserts user (email-match for existing accounts), issues session cookie.
   */
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const cookieHeader = req.headers.cookie || "";
    const parsedCookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    const storedState = parsedCookies[STATE_COOKIE];
    const codeVerifier = parsedCookies[PKCE_COOKIE];

    if (!storedState || storedState !== state) {
      res.status(400).json({ error: "State mismatch — possible CSRF" });
      return;
    }
    if (!codeVerifier) {
      res.status(400).json({ error: "Missing PKCE verifier" });
      return;
    }

    res.clearCookie(PKCE_COOKIE, { path: "/" });
    res.clearCookie(STATE_COOKIE, { path: "/" });

    const clientId = ENV.wavvOidcClientId;
    const clientSecret = ENV.wavvOidcClientSecret;
    const redirectUri = ENV.wavvOidcRedirectUri;

    if (!clientId || !clientSecret || !redirectUri) {
      res.status(500).json({ error: "WAVV OIDC not configured" });
      return;
    }

    try {
      const tokens = await exchangeCodeForTokens(
        code,
        codeVerifier,
        clientId,
        clientSecret,
        redirectUri
      );

      const idClaims = await verifyIdToken(tokens.id_token, clientId);
      const userInfo = await fetchUserInfo(tokens.access_token);

      const externalId = userInfo.sub || idClaims.sub;
      const email = userInfo.email || idClaims.email;

      if (!externalId || !email) {
        res.status(400).json({ error: "Missing sub or email from WAVV IdP" });
        return;
      }

      const internalRole = mapWavvRoleToInternal(userInfo);

      const isWavvEmail = email.toLowerCase().endsWith("@wavv.com");
      const tokenAccountType = userInfo.account_type ?? idClaims.account_type ?? null;

      // OIDC identity facets (Jul 2026: wavv_account_id renamed to wavv_user_id, employee_id added)
      // Both can be non-null for dual employee+customer accounts (e.g. @wavv.com test accounts).
      const wavvUserId = (userInfo as any).wavv_user_id ?? (idClaims as any).wavv_user_id
        ?? userInfo.wavv_account_id ?? idClaims.wavv_account_id ?? null;
      const employeeId = (userInfo as any).employee_id ?? (idClaims as any).employee_id ?? null;

      // ── Subscription check ────────────────────────────────────────────────────
      // Fetch live subscription at login time when a wavvUserId is present.
      // This is the authoritative signal for WAVV Team vs WAVV Users:
      //   - Active subscription (ACTIVE / TRIALING / SCHEDULED_CANCEL) → customer → WAVV Users
      //   - No subscription or inactive → fall through to email-domain check
      let customerDetails = null;
      let subscriptionStatus: string | null = null;
      let wavvPlan: string | null = null;
      let hasActiveSubscription = false;

      console.log(`[WAVV OAuth] login email=${email} wavvUserId=${wavvUserId} tokenAccountType=${tokenAccountType}`);

      if (wavvUserId) {
        customerDetails = await fetchCustomerDetails(
          wavvUserId,
          ENV.wavvOidcClientId,
          ENV.wavvOidcClientSecret
        );
        console.log(`[WAVV OAuth] customerDetails for ${email}:`, JSON.stringify(customerDetails));
        if (customerDetails) {
          subscriptionStatus = customerDetails.subscription?.status
            ?? customerDetails.subscription_status
            ?? null;
          // Plan name lives under subscription.plan (nested), fallback to top-level
          wavvPlan = customerDetails.subscription?.plan ?? customerDetails.plan ?? null;
          hasActiveSubscription = isActiveSubscription(customerDetails);
        }
      }

      console.log(`[WAVV OAuth] resolved email=${email} hasActiveSubscription=${hasActiveSubscription} resolvedType=pending...`);

      // ── Account type resolution ───────────────────────────────────────────────
      //
      // Priority order (highest to lowest):
      //   1. Has employeeId OR @wavv.com email → employee (WAVV Team)
      //      Employee identity always wins, even if they also have a subscription.
      //   2. Has active subscription or wavvUserId → customer (WAVV Users)
      //   3. Token says customer (non-@wavv.com) → customer
      //   4. Everything else → guest
      //
      const resolvedAccountType: "employee" | "customer" | "guest" =
        (!!employeeId || isWavvEmail)
          ? "employee"
          : (hasActiveSubscription || !!wavvUserId)
          ? "customer"
          : tokenAccountType === "customer"
          ? "customer"
          : "guest";

      // ── Facet-based identity (Jul 2026) ──────────────────────────────────────
      // A user can be BOTH an employee AND a customer simultaneously.
      // isEmployee/isCustomer are independent facets derived from token fields,
      // NOT mutually exclusive. accountType is kept for backward compat but
      // downstream code should prefer the boolean facets.
      const isEmployee = !!employeeId || isWavvEmail;
      const isCustomer = !!wavvUserId || hasActiveSubscription;
      // accountType is the "primary" routing for UI sections (Command Center vs WAVV Users tab)
      // but does NOT gate isEmployee/isCustomer booleans.
      const accountType = resolvedAccountType;
      // Employees start as "pending" (require owner approval). Customers auto-approved.
      // If someone is both, they get employee approval flow for Command Center access.
      const initialApprovalStatus = isEmployee ? "pending" : "approved";

      // Fetch live employee role from WAVV IdP for anyone with an employeeId
      let internalRoleLive = internalRole;
      if (isEmployee) {
        const empDetails = await fetchEmployeeDetails(
          employeeId || externalId,
          ENV.wavvOidcClientId,
          ENV.wavvOidcClientSecret
        );
        if (empDetails) {
          internalRoleLive = mapWavvEmployeeRoleToInternal(empDetails.role);
        }
      }

      let user = await db.getUserByOpenId(externalId);

      if (!user && email) {
        const existingByEmail = await db.getUserByEmail(email);
        if (existingByEmail) {
          // Employee always wins. Then customer. Never downgrade.
          const mergedAccountType: "employee" | "customer" | "guest" =
            (!!employeeId || isWavvEmail)
              ? "employee"
              : (hasActiveSubscription || !!wavvUserId)
              ? "customer"
              : existingByEmail.accountType === "customer" && accountType === "guest"
              ? "customer"  // never downgrade customer to guest
              : accountType;
          // Facet-based: employee if they have an employeeId or @wavv.com email
          // customer if they have a wavvUserId or active subscription
          const mergedIsEmployee = !!employeeId || isWavvEmail;
          const mergedIsCustomer = !!wavvUserId || hasActiveSubscription;
          const mergedApprovalStatus =
            existingByEmail.approvalStatus === "approved" ? "approved" :
            existingByEmail.approvalStatus === "denied" ? "denied" :
            mergedIsEmployee ? "pending" : "approved";
          await db.upsertUser({
            openId: externalId,
            email,
            name: userInfo.name || existingByEmail.name || null,
            loginMethod: "wavv_oidc",
            lastSignedIn: new Date(),
            role: existingByEmail.role,
            avatarUrl: userInfo.picture || idClaims.picture || existingByEmail.avatarUrl || null,
            wavvSub: externalId,
            accountType: mergedAccountType,
            approvalStatus: mergedApprovalStatus,
            isEmployee: mergedIsEmployee,
            isCustomer: mergedIsCustomer,
            wavvUserId,
            employeeId,
            subscriptionStatus,
            wavvPlan,
          });
          user = await db.getUserByOpenId(externalId);
        }
      }

      if (!user) {
        await db.upsertUser({
          openId: externalId,
          email,
          name: userInfo.name || null,
          loginMethod: "wavv_oidc",
          lastSignedIn: new Date(),
          role: internalRoleLive,
          avatarUrl: userInfo.picture || idClaims.picture || null,
          wavvSub: externalId,
          accountType,
          approvalStatus: initialApprovalStatus,
          isEmployee,
          isCustomer,
          wavvUserId,
          employeeId,
          subscriptionStatus,
          wavvPlan,
        });
        user = await db.getUserByOpenId(externalId);
      } else {
        // Re-evaluate accountType on every login. Employee always wins.
        const existingAccountType = user.accountType;
        const safeAccountType: "employee" | "customer" | "guest" =
          (!!employeeId || isWavvEmail)
            ? "employee"
            : (hasActiveSubscription || !!wavvUserId)
            ? "customer"
            : existingAccountType === "customer" && accountType === "guest"
            ? "customer"  // never downgrade customer to guest
            : accountType;
        // Re-evaluate approvalStatus: if account type changed from employee to customer
        // (subscription acquired), auto-approve them. Never downgrade an approved employee.
        const existingApproval = user.approvalStatus;
        const safeApproval =
          safeAccountType === "customer" && existingAccountType === "employee"
            ? "approved"   // gained a subscription — move out of pending queue
            : existingApproval === "denied"
            ? "denied"     // denied stays denied
            : safeAccountType === "employee" && existingApproval === "pending"
            ? "pending"    // still employee, still pending
            : existingApproval ?? (safeAccountType === "employee" ? "pending" : "approved");
        await db.upsertUser({
          openId: externalId,
          lastSignedIn: new Date(),
          name: userInfo.name || user.name || null,
          avatarUrl: userInfo.picture || idClaims.picture || user.avatarUrl || null,
          wavvSub: externalId,
          accountType: safeAccountType,
          // Facet-based: independent of accountType routing
          isEmployee: !!employeeId || isWavvEmail,
          isCustomer: !!wavvUserId || hasActiveSubscription,
          wavvUserId,
          employeeId,
          subscriptionStatus,
          wavvPlan,
          approvalStatus: safeApproval,
        });
      }

      // Re-fetch the final user record
      const finalUser = await db.getUserByOpenId(externalId);

      if (!finalUser) {
        res.status(500).json({ error: "Failed to resolve user after upsert" });
        return;
      }

      // Notify owner whenever an employee signs in and is still pending approval.
      // This covers: (a) first-ever login, (b) users who existed via another login method
      // and are now signing in via WAVV OIDC for the first time as an employee.
      // We avoid re-notifying on every login by checking whether they were already
      // an employee+pending before this login (i.e. user existed and was already pending).
      const wasAlreadyPending = user && user.isEmployee && user.approvalStatus === "pending";
      const isNewPendingEmployee = !wasAlreadyPending && finalUser.isEmployee && finalUser.approvalStatus === "pending";
      if (isNewPendingEmployee) {
        try {
          const { notifyOwner } = await import("./notification");
          await notifyOwner({
            title: "New Employee Pending Approval",
            content: `${finalUser.name || finalUser.email} (${finalUser.email}) signed in for the first time and is waiting for Command Center approval. Visit the WAVV Command Center → Users → WAVV Team to approve or deny access.`,
          });
        } catch (notifyErr) {
          console.error("[WAVV OIDC] Failed to send approval notification", notifyErr);
        }
      }

      const sessionToken = await createSessionToken({
        userId: finalUser.id,
        email: finalUser.email || email,
        role: finalUser.role as any,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const returnPath = getQueryParam(req, "return_path") || "/";
      res.redirect(302, returnPath.startsWith("/") ? returnPath : "/");
    } catch (error) {
      console.error("[WAVV OIDC] Callback failed", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
}
