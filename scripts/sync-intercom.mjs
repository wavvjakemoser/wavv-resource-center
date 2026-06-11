/**
 * One-shot script to run the Intercom Help Center sync.
 * Run with: node scripts/sync-intercom.mjs
 * Requires DATABASE_URL and INTERCOM_API_TOKEN in env.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";

const INTERCOM_API_BASE = "https://api.intercom.io";
const TOKEN = process.env.INTERCOM_API_TOKEN ?? "";
const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!TOKEN) { console.error("INTERCOM_API_TOKEN not set"); process.exit(1); }
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const db = drizzle(DATABASE_URL);

// ─── Minimal schema mirrors ───────────────────────────────────────────────────
import { mysqlTable, int, varchar, text, boolean, datetime, bigint } from "drizzle-orm/mysql-core";

const helpArticleCollections = mysqlTable("help_article_collections", {
  id: int("id").primaryKey().autoincrement(),
  intercomId: varchar("intercom_id", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  syncedAt: datetime("synced_at"),
});

const helpArticles = mysqlTable("help_articles", {
  id: int("id").primaryKey().autoincrement(),
  intercomId: varchar("intercom_id", { length: 64 }).notNull().unique(),
  collectionId: varchar("collection_id", { length: 64 }),
  title: varchar("title", { length: 512 }).notNull(),
  body: text("body"),
  summary: varchar("summary", { length: 512 }),
  url: varchar("url", { length: 1024 }),
  visible: boolean("visible").notNull().default(true),
  state: varchar("state", { length: 32 }),
  authorName: varchar("author_name", { length: 255 }),
  intercomUpdatedAt: bigint("intercom_updated_at", { mode: "number" }),
  syncedAt: datetime("synced_at"),
});

async function intercomGet(path) {
  const res = await fetch(`${INTERCOM_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Intercom ${res.status} for ${path}: ${await res.text()}`);
  return res.json();
}

function htmlToSummary(html, maxLen = 220) {
  if (!html) return "";
  const plain = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

async function syncCollections() {
  const data = await intercomGet("/help_center/collections");
  const collections = data.data ?? [];
  for (const col of collections) {
    const existing = await db.select({ id: helpArticleCollections.id }).from(helpArticleCollections).where(eq(helpArticleCollections.intercomId, col.id)).limit(1);
    if (existing.length > 0) {
      await db.update(helpArticleCollections).set({ name: col.name, description: col.description ?? null, sortOrder: col.order ?? 0, syncedAt: new Date() }).where(eq(helpArticleCollections.intercomId, col.id));
    } else {
      await db.insert(helpArticleCollections).values({ intercomId: col.id, name: col.name, description: col.description ?? null, sortOrder: col.order ?? 0, visible: true, syncedAt: new Date() });
    }
  }
  return collections.length;
}

async function syncArticles() {
  let page = 1, synced = 0, skipped = 0;
  while (true) {
    const data = await intercomGet(`/articles?page=${page}&per_page=50`);
    const articles = data.data ?? [];
    if (articles.length === 0) break;
    for (const article of articles) {
      if (article.state !== "published") { skipped++; continue; }
      const summary = htmlToSummary(article.body);
      const collectionId = article.parent_id ?? null;
      const existing = await db.select({ id: helpArticles.id }).from(helpArticles).where(eq(helpArticles.intercomId, article.id)).limit(1);
      if (existing.length > 0) {
        await db.update(helpArticles).set({ title: article.title, body: article.body ?? null, summary, url: article.url ?? null, state: article.state, collectionId, authorName: article.author?.name ?? null, intercomUpdatedAt: article.updated_at ?? null, syncedAt: new Date() }).where(eq(helpArticles.intercomId, article.id));
      } else {
        await db.insert(helpArticles).values({ intercomId: article.id, collectionId, title: article.title, body: article.body ?? null, summary, url: article.url ?? null, visible: true, state: article.state, authorName: article.author?.name ?? null, intercomUpdatedAt: article.updated_at ?? null, syncedAt: new Date() });
      }
      synced++;
    }
    const totalPages = data.pages?.total_pages ?? 1;
    if (page >= totalPages) break;
    page++;
  }
  return { synced, skipped };
}

console.log("Starting Intercom sync…");
const collections = await syncCollections();
console.log(`Collections synced: ${collections}`);
const { synced, skipped } = await syncArticles();
console.log(`Articles synced: ${synced}, skipped (non-published): ${skipped}`);
console.log("Done.");
process.exit(0);
