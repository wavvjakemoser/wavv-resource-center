/**
 * build.mjs — unified build script
 *
 * Generates a single BUILD_HASH at the start of the build, then passes it
 * to both Vite (client bundle) and esbuild (server bundle) so they share
 * the same frozen value.
 *
 * This means the hash only changes when `pnpm build` runs — i.e. when you
 * hit Publish. Cold-starts and container restarts reuse the same compiled
 * binary, so the hash stays stable and the update banner never fires
 * spuriously.
 */
import { execSync } from "child_process";
import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const hash = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const buildTime = new Date().toISOString();

console.log(`[build] BUILD_HASH = ${hash}`);
console.log(`[build] BUILD_TIME = ${buildTime}`);

// ── 1. Vite client build ──────────────────────────────────────────────────────
// Vite reads VITE_BUILD_HASH / VITE_BUILD_TIME from the environment and the
// define block in vite.config.ts replaces __BUILD_HASH__ / __BUILD_TIME__ in
// the client bundle.
execSync("vite build", {
  stdio: "inherit",
  cwd: root,
  env: {
    ...process.env,
    VITE_BUILD_HASH: hash,
    VITE_BUILD_TIME: buildTime,
  },
});

// ── 2. esbuild server bundle ──────────────────────────────────────────────────
// Using the JS API avoids all shell-escaping issues with --define string values.
await build({
  entryPoints: [path.join(root, "server/_core/index.ts")],
  platform: "node",
  packages: "external",
  bundle: true,
  format: "esm",
  outdir: path.join(root, "dist"),
  define: {
    // JSON.stringify wraps the value in double quotes, producing a valid JS string literal.
    __BUILD_HASH__: JSON.stringify(hash),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
});

console.log("[build] Done.");
