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
  fetchUserInfo,
  generateCodeVerifier,
  generateState,
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

      let user = await db.getUserByOpenId(externalId);

      if (!user && email) {
        const existingByEmail = await db.getUserByEmail(email);
        if (existingByEmail) {
          await db.upsertUser({
            openId: externalId,
            email,
            name: userInfo.name || existingByEmail.name || null,
            loginMethod: "wavv_oidc",
            lastSignedIn: new Date(),
            role: existingByEmail.role,
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
          role: internalRole,
        });
        user = await db.getUserByOpenId(externalId);
      } else {
        await db.upsertUser({
          openId: externalId,
          lastSignedIn: new Date(),
          name: userInfo.name || user.name || null,
        });
      }

      if (!user) {
        res.status(500).json({ error: "Failed to resolve user after upsert" });
        return;
      }

      const sessionToken = await createSessionToken({
        userId: user.id,
        email: user.email || email,
        role: user.role as any,
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
