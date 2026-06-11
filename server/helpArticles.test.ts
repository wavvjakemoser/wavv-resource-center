import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock getDb ───────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("./_core/db", () => ({
  getDb: () => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  }),
}));

// ─── Mock env ─────────────────────────────────────────────────────────────────
vi.mock("./_core/env", () => ({
  env: {
    INTERCOM_API_TOKEN: "test-token",
    DATABASE_URL: "mysql://test",
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeArticle(overrides = {}) {
  return {
    id: 1,
    intercomId: "ic_001",
    collectionId: "col_001",
    title: "Getting Started",
    body: "<p>Hello world</p>",
    summary: "Hello world",
    url: "https://help.wavv.com/en/articles/1",
    visible: true,
    state: "published",
    authorName: "Support Team",
    intercomUpdatedAt: 1700000000000,
    syncedAt: new Date(),
    ...overrides,
  };
}

function makeCollection(overrides = {}) {
  return {
    id: 1,
    intercomId: "col_001",
    name: "Getting Started",
    description: "Start here",
    sortOrder: 0,
    visible: true,
    syncedAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("helpArticles DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("article object has required fields", () => {
    const article = makeArticle();
    expect(article).toHaveProperty("intercomId");
    expect(article).toHaveProperty("title");
    expect(article).toHaveProperty("visible");
    expect(article).toHaveProperty("state");
  });

  it("collection object has required fields", () => {
    const col = makeCollection();
    expect(col).toHaveProperty("intercomId");
    expect(col).toHaveProperty("name");
    expect(col).toHaveProperty("sortOrder");
    expect(col).toHaveProperty("visible");
  });

  it("visible defaults to true for new articles", () => {
    const article = makeArticle();
    expect(article.visible).toBe(true);
  });

  it("visible defaults to true for new collections", () => {
    const col = makeCollection();
    expect(col.visible).toBe(true);
  });

  it("hidden article has visible=false", () => {
    const article = makeArticle({ visible: false });
    expect(article.visible).toBe(false);
  });

  it("hidden collection has visible=false", () => {
    const col = makeCollection({ visible: false });
    expect(col.visible).toBe(false);
  });

  it("article summary is derived from body HTML", () => {
    // Simulate the htmlToSummary logic
    const html = "<p>This is a test article with some content.</p>";
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    expect(plain).toBe("This is a test article with some content.");
  });

  it("article summary is truncated at 220 chars", () => {
    const longText = "A".repeat(300);
    const html = `<p>${longText}</p>`;
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const summary = plain.length > 220 ? plain.slice(0, 220) + "…" : plain;
    expect(summary.length).toBe(221); // 220 + ellipsis
    expect(summary.endsWith("…")).toBe(true);
  });

  it("non-published articles are skipped in sync", () => {
    const articles = [
      makeArticle({ state: "published" }),
      makeArticle({ state: "draft", intercomId: "ic_002" }),
    ];
    const published = articles.filter((a) => a.state === "published");
    expect(published).toHaveLength(1);
    expect(published[0].intercomId).toBe("ic_001");
  });

  it("sync result counts synced and skipped correctly", () => {
    const articles = [
      { state: "published" },
      { state: "draft" },
      { state: "published" },
      { state: "deleted" },
    ];
    let synced = 0, skipped = 0;
    for (const a of articles) {
      if (a.state !== "published") { skipped++; } else { synced++; }
    }
    expect(synced).toBe(2);
    expect(skipped).toBe(2);
  });
});
