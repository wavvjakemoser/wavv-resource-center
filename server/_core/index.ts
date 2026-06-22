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

async function startServer() {
  const app = express();
  const server = createServer(app);

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
