import { describe, it, expect } from "vitest";
import {
  generateCodeVerifier,
  deriveCodeChallenge,
  generateState,
  buildAuthorizationUrl,
  WAVV_ISSUER,
} from "./_core/wavvOidc";

describe("WAVV OIDC helpers", () => {
  it("generates a code verifier of valid length", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it("derives a base64url S256 code challenge", () => {
    const verifier = generateCodeVerifier();
    const challenge = deriveCodeChallenge(verifier);
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+=*$/);
    expect(challenge.length).toBeGreaterThan(0);
  });

  it("generates a random state string", () => {
    const s1 = generateState();
    const s2 = generateState();
    expect(s1).not.toBe(s2);
    expect(s1.length).toBeGreaterThan(0);
  });

  it("builds a valid authorization URL with all required params", () => {
    const url = buildAuthorizationUrl({
      clientId: "manus-success-center",
      redirectUri: "https://success.wavv.com/api/oauth/callback",
      state: "test-state",
      codeChallenge: "test-challenge",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("manus-success-center");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("code_challenge")).toBe("test-challenge");
    expect(parsed.searchParams.get("state")).toBe("test-state");
    expect(parsed.searchParams.get("scope")).toContain("openid");
  });

  it("issuer is set to admin.wavv.com", () => {
    expect(WAVV_ISSUER).toBe("https://admin.wavv.com");
  });

  it("WAVV OIDC env vars are set", () => {
    expect(process.env.WAVV_OIDC_CLIENT_ID).toBe("manus-success-center");
    expect(process.env.WAVV_OIDC_CLIENT_SECRET).toBeTruthy();
    expect(process.env.WAVV_OIDC_REDIRECT_URI).toContain("/api/oauth/callback");
  });
});
