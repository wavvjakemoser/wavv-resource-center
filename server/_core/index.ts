import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { rateLimit } from "express-rate-limit";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runIntercomSync } from "../intercomSync";
import { registerOAuthRoutes } from "./oauth";

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// The site is publicly accessible on the internet, so we apply two tiers:
//
// Tier 1 (anonymous): 60 req/min per IP — blocks bots/scrapers hitting public
//   endpoints (search, trackAnon) while allowing normal browsing.
//   Skipped for requests that carry a session cookie (logged-in users).
//
// Tier 2 (all /api traffic): 300 req/min per IP — generous ceiling for
//   authenticated users and internal tooling, prevents runaway clients.

const sessionCookieNames = ["wavv_session", "manus_session", "session"];

const anonymousRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60,             // 60 requests per minute for anonymous IPs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again in a minute." },
  skip: (req) => {
    // Skip for authenticated requests — session cookie present
    const cookies = req.headers.cookie ?? "";
    return sessionCookieNames.some((name) => cookies.includes(name + "="));
  },
});

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 300,            // 300 requests per minute for all IPs (authenticated ceiling)
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please try again shortly." },
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Build hash: baked into the compiled bundle at build time by Vite's `define`.
// This value is frozen when `pnpm build` runs (i.e. when you hit Publish).
// Cold-starts and container restarts reuse the same compiled binary — same hash.
// Only a new publish produces a new hash, which is exactly when the banner should fire.
//
// In dev mode (vite serve), __BUILD_HASH__ is also defined by vite.config.ts
// but regenerated each time the dev server starts — acceptable for local testing.
declare const __BUILD_HASH__: string;
declare const __BUILD_TIME__: string;
const BUILD_HASH: string = typeof __BUILD_HASH__ !== "undefined" ? __BUILD_HASH__ : `dev-${Date.now()}`;
const BUILD_TIME: string = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : new Date().toISOString();

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the first proxy hop (Manus/Cloud Run load balancer)
  // Required for express-rate-limit to correctly read the real client IP
  // from X-Forwarded-For instead of the proxy's IP
  app.set("trust proxy", 1);

  // Disable Express's automatic ETag generation globally.
  // ETags on /api/version would allow browsers to serve 304 Not Modified
  // from their own cache, defeating the no-store intent and causing clients
  // to miss deploy notifications.
  app.set("etag", false);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);

  // ── WAVV IdP OIDC routes (/api/oauth/login, /api/oauth/callback) ──────────
  registerOAuthRoutes(app);

  // ── Scheduled: Intercom Help Center sync ──────────────────────────────────
  app.post("/api/scheduled/intercom-sync", async (req, res) => {
    // Validate cron caller via platform header
    const taskUid = req.headers["x-manus-cron-task-uid"] as string | undefined;
    if (!taskUid) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }
    try {
      const result = await runIntercomSync();
      console.log(`[IntercomSync] Scheduled sync complete:`, result);
      return res.json({ ok: true, ...result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("[IntercomSync] Scheduled sync failed:", message);
      return res.status(500).json({ error: message, stack, timestamp: new Date().toISOString() });
    }
  });

  // ── Scheduled: Auto-publish Coming Soon sessions ────────────────────────────
  app.post("/api/scheduled/accelerator-auto-publish", async (req, res) => {
    const taskUid = req.headers["x-manus-cron-task-uid"] as string | undefined;
    if (!taskUid) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return res.json({ ok: true, published: 0 });
      const { acceleratorSessions } = await import("../../drizzle/schema");
      const { and, eq, lte, isNotNull } = await import("drizzle-orm");
      const now = new Date();
      // Find sessions that are comingSoon=true, have a publishAt <= now
      const due = await db.select().from(acceleratorSessions).where(
        and(
          eq(acceleratorSessions.comingSoon, true),
          isNotNull(acceleratorSessions.publishAt),
          lte(acceleratorSessions.publishAt, now)
        )
      );
      let published = 0;
      for (const s of due) {
        await db.update(acceleratorSessions)
          .set({ comingSoon: false, isPublished: true, publishAt: null })
          .where(eq(acceleratorSessions.id, s.id));
        published++;
      }
      console.log(`[AutoPublish] Published ${published} sessions`);
      return res.json({ ok: true, published, ids: due.map(s => s.id) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[AutoPublish] Failed:", message);
      return res.status(500).json({ error: message });
    }
  });

  // ── Version endpoint (client polls for auto-refresh on deploy) ─────────────
  // No auth required — returns the current build hash, deploy time, and the
  // auto_refresh_enabled flag from site_settings (default: true).
  // Cache-Control: no-store ensures clients always get a fresh response.
  app.get("/api/version", async (_req, res) => {
    // Disable all caching — clients must always get a fresh hash.
    // ETag is disabled at the app level via app.set("etag", false) below;
    // these headers are belt-and-suspenders for CDN/proxy layers.
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    let autoRefreshEnabled = true;
    try {
      const { getSiteSetting } = await import("../db");
      const val = await getSiteSetting("auto_refresh_enabled");
      // getSiteSetting JSON.parses the stored value, so `false` arrives as boolean false.
      // Guard: null = key not yet set (default enabled); false = explicitly disabled.
      if (val === false) {
        autoRefreshEnabled = false;
      }
    } catch {
      // DB unavailable — default to enabled
    }
    res.json({ version: BUILD_HASH, deployedAt: BUILD_TIME, autoRefreshEnabled });
  });

  // ── Dynamic sitemap.xml ─────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = "https://success.wavv.com";
      const now = new Date().toISOString().split("T")[0];

      // Static public URLs
      const staticUrls = [
        { loc: baseUrl, priority: "1.0", changefreq: "weekly" },
        { loc: `${baseUrl}/academy`, priority: "0.9", changefreq: "weekly" },
        { loc: `${baseUrl}/academy/category/onboarding`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/academy/category/how-to`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/academy/category/strategy`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/webinars`, priority: "0.8", changefreq: "weekly" },
        { loc: `${baseUrl}/resourcehub`, priority: "0.8", changefreq: "weekly" },
      ];

      // Dynamic: published courses
      let dynamicUrls: { loc: string; priority: string; changefreq: string }[] = [];
      try {
        const { getCourses } = await import("../db");
        const courses = await getCourses(true);
        dynamicUrls = courses.map((c: { id: number }) => ({
          loc: `${baseUrl}/academy/${c.id}`,
          priority: "0.7",
          changefreq: "monthly",
        }));
      } catch {
        // DB unavailable — serve static-only sitemap
      }

      const allUrls = [...staticUrls, ...dynamicUrls];
      const xml = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        ...allUrls.map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
        ),
        `</urlset>`,
      ].join("\n");

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // ── tRPC API (rate limited) ───────────────────────────────────────────────
  // Apply anonymous limit first (skips authenticated), then the global ceiling
  app.use("/api/trpc", anonymousRateLimit, apiRateLimit,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
