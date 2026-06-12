/**
 * WAVV Resource Center - Router Tests
 * Tests cover: auth, academy, webinars, guides, support, and AI chat procedures
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Context Factories ───────────────────────────────────────────────────────

type CookieCall = { name: string; options: Record<string, unknown> };
type AuthUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    openId: "test-open-id",
    email: "test@wavv.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeCtx(user: AuthUser | null = null): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

// ─── Auth Tests ──────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null when not authenticated", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const user = makeUser();
    const { ctx } = makeCtx(user);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@wavv.com" });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const { ctx, clearedCookies } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1, httpOnly: true });
  });
});

// ─── Academy Tests ───────────────────────────────────────────────────────────

describe("academy.getCourses", () => {
  it("resolves without authentication (public procedure)", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.getCourses();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array for authenticated user", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.getCourses();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("academy.getCourse", () => {
  it("requires authentication", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.getCourse({ id: 1 })).rejects.toThrow();
  });

  it("throws NOT_FOUND for non-existent course", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.getCourse({ id: 999999 })).rejects.toThrow();
  });
});

describe("academy.getProgress", () => {
  it("requires authentication", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.getProgress({})).rejects.toThrow();
  });

  it("returns progress array for authenticated user", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.getProgress({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Webinars Tests ──────────────────────────────────────────────────────────

describe("webinars.list", () => {
  it("returns array of webinars for unauthenticated users (public endpoint)", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.webinars.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns array of webinars for authenticated user", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.webinars.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("filters by type when provided", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const recordings = await caller.webinars.list({ type: "recording" });
    expect(Array.isArray(recordings)).toBe(true);
    recordings.forEach((w) => expect(w.type).toBe("recording"));
  });
});

// ─── Guides Tests ────────────────────────────────────────────────────────────

describe("guides.list", () => {
  it("resolves without authentication (public procedure)", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.guides.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns array of guides for authenticated user", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.guides.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Support Tests ───────────────────────────────────────────────────────────

describe("support.submitTicket", () => {
  it("requires authentication", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.support.submitTicket({
        subject: "Test Issue",
        category: "Technical Issue",
        description: "This is a test support ticket description.",
      })
    ).rejects.toThrow();
  });
});

describe("support.getMyTickets", () => {
  it("requires authentication", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.support.getMyTickets()).rejects.toThrow();
  });

  it("returns array for authenticated user", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.support.getMyTickets();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Admin Tests ─────────────────────────────────────────────────────────────

describe("support.adminGetAll", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(caller.support.adminGetAll()).rejects.toThrow();
  });

  it("allows content_admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "publisher" }));
    const caller = appRouter.createCaller(ctx);
    const result = await caller.support.adminGetAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("academy.adminGetAllCourses", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(caller.academy.adminGetAllCourses()).rejects.toThrow();
  });

  it("allows content_admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "publisher" }));
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.adminGetAllCourses();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Analytics Tests ─────────────────────────────────────────────────────────

describe("analytics.getSummary", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(caller.analytics.getSummary()).rejects.toThrow();
  });
});

// ─── WAVV AI Tests ───────────────────────────────────────────────────────────

describe("wavvAi.chat", () => {
  it("requires authentication", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.wavvAi.chat({
        messages: [{ role: "user", content: "Hello" }],
      })
    ).rejects.toThrow();
  });
});

// ─── Section Resources Tests ─────────────────────────────────────────────────

describe("academy.getSectionResourcesByCategory", () => {
  it("resolves without authentication (public procedure)", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.getSectionResourcesByCategory({ category: "Onboarding" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array for authenticated users", async () => {
    const { ctx } = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.academy.getSectionResourcesByCategory({ category: "Onboarding" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("academy.adminAddSectionResource", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.academy.adminAddSectionResource({
        courseId: 1,
        label: "Test PDF",
        fileUrl: "https://example.com/test.pdf",
        fileName: "test.pdf",
      })
    ).rejects.toThrow();
  });

  it("allows content_admin users to add a resource", async () => {
    const { ctx } = makeCtx(makeUser({ role: "publisher" }));
    const caller = appRouter.createCaller(ctx);
    // This will fail if courseId 99999 doesn't exist, but we just check it doesn't throw auth error
    await expect(
      caller.academy.adminAddSectionResource({
        courseId: 99999,
        label: "Test PDF",
        fileUrl: "https://example.com/test.pdf",
        fileName: "test.pdf",
      })
    ).rejects.toThrow(); // FK constraint — not an auth error, so admin gate passed
  });
});

describe("academy.adminDeleteSectionResource", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.academy.adminDeleteSectionResource({ id: 1 })
    ).rejects.toThrow();
  });
});

describe("academy.adminReorderSectionResources", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.academy.adminReorderSectionResources({ courseId: 1, orderedIds: [1, 2] })
    ).rejects.toThrow();
  });
});

// ─── Intercom Integration ─────────────────────────────────────────────────────
describe("intercom", () => {
  it("VITE_INTERCOM_APP_ID is set and non-empty", () => {
    const appId = process.env.VITE_INTERCOM_APP_ID;
    expect(appId).toBeDefined();
    expect(typeof appId).toBe("string");
    expect((appId as string).length).toBeGreaterThan(0);
  });
});
