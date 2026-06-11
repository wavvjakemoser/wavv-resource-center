/**
 * Intercom Help Center Sync
 *
 * Fetches collections and published articles from the Intercom Articles API
 * and upserts them into the local help_article_collections / help_articles tables.
 *
 * Only reads data — no write permissions to Intercom are used.
 */

import { getDb } from "./db";
import { helpArticleCollections, helpArticles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const INTERCOM_API_BASE = "https://api.intercom.io";
const TOKEN = process.env.INTERCOM_API_TOKEN ?? "";

// ─── API helpers ──────────────────────────────────────────────────────────────

async function intercomGet(path: string): Promise<unknown> {
  const res = await fetch(`${INTERCOM_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Intercom API error ${res.status} for ${path}: ${text}`);
  }
  return res.json();
}

// ─── Strip HTML to plain text summary ─────────────────────────────────────────

function htmlToSummary(html: string | null | undefined, maxLen = 220): string {
  if (!html) return "";
  const plain = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

// ─── Sync collections ─────────────────────────────────────────────────────────

interface IntercomCollection {
  id: string;
  name: string;
  description?: string | null;
  order?: number;
}

async function syncCollections(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data = (await intercomGet("/help_center/collections")) as {
    data: IntercomCollection[];
  };
  const collections = data.data ?? [];

  for (const col of collections) {
    const existing = await db
      .select({ id: helpArticleCollections.id })
      .from(helpArticleCollections)
      .where(eq(helpArticleCollections.intercomId, col.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(helpArticleCollections)
        .set({
          name: col.name,
          description: col.description ?? null,
          sortOrder: col.order ?? 0,
          syncedAt: new Date(),
        })
        .where(eq(helpArticleCollections.intercomId, col.id));
    } else {
      await db.insert(helpArticleCollections).values({
        intercomId: col.id,
        name: col.name,
        description: col.description ?? null,
        sortOrder: col.order ?? 0,
        visible: true,
        syncedAt: new Date(),
      });
    }
  }

  return collections.length;
}

// ─── Sync articles ─────────────────────────────────────────────────────────────

interface IntercomArticle {
  id: string;
  title: string;
  body?: string | null;
  url?: string | null;
  state?: string;
  parent_id?: string | null;
  author?: { name?: string | null } | null;
  updated_at?: number | null;
}

async function syncArticles(): Promise<{ synced: number; skipped: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let page = 1;
  let totalSynced = 0;
  let totalSkipped = 0;

  while (true) {
    const data = (await intercomGet(
      `/articles?page=${page}&per_page=50`
    )) as {
      data: IntercomArticle[];
      pages?: { total_pages?: number };
    };

    const articles = data.data ?? [];
    if (articles.length === 0) break;

    for (const article of articles) {
      // Only sync published articles
      if (article.state !== "published") {
        totalSkipped++;
        continue;
      }

      const summary = htmlToSummary(article.body);
      const collectionId = article.parent_id ?? null;

      const existing = await db
        .select({ id: helpArticles.id })
        .from(helpArticles)
        .where(eq(helpArticles.intercomId, article.id))
        .limit(1);

      if (existing.length > 0) {
        // Update content but preserve admin visibility setting
        await db
          .update(helpArticles)
          .set({
            title: article.title,
            body: article.body ?? null,
            summary,
            url: article.url ?? null,
            state: article.state,
            collectionId,
            authorName: article.author?.name ?? null,
            intercomUpdatedAt: article.updated_at ?? null,
            syncedAt: new Date(),
          })
          .where(eq(helpArticles.intercomId, article.id));
      } else {
        await db.insert(helpArticles).values({
          intercomId: article.id,
          collectionId,
          title: article.title,
          body: article.body ?? null,
          summary,
          url: article.url ?? null,
          visible: true,
          state: article.state,
          authorName: article.author?.name ?? null,
          intercomUpdatedAt: article.updated_at ?? null,
          syncedAt: new Date(),
        });
      }
      totalSynced++;
    }

    const totalPages = data.pages?.total_pages ?? 1;
    if (page >= totalPages) break;
    page++;
  }

  return { synced: totalSynced, skipped: totalSkipped };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runIntercomSync(): Promise<{
  collections: number;
  synced: number;
  skipped: number;
}> {
  if (!TOKEN) throw new Error("INTERCOM_API_TOKEN is not set");

  const collections = await syncCollections();
  const { synced, skipped } = await syncArticles();

  return { collections, synced, skipped };
}
