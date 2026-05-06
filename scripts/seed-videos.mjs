import { createConnection } from "mysql2/promise";
import { config } from "dotenv";
config();

// Convert loom share URL to embed URL
function loomEmbed(shareUrl) {
  // Extract the ID from https://www.loom.com/share/XXXX
  const id = shareUrl.split("/share/")[1]?.split("?")[0];
  return `https://www.loom.com/embed/${id}`;
}

// Mapping: lesson id -> loom share URL (from Jake's list)
const updates = [
  // ── Onboarding (courseId=1) ──────────────────────────────────────────────
  { id: 1,  title: "Welcome To The Onboarding Section",        url: "https://www.loom.com/share/120f6c99ba1245e288ec5c486c146524" },
  { id: 2,  title: "WAVV Wallet",                              url: "https://www.loom.com/share/f8163ba9c8ae4bc2a90d789a77523248" },
  { id: 3,  title: "Individual Single Line Dialer Onboarding", url: "https://www.loom.com/share/5ff763a76caa4ec68d764d06cfe798f1" },
  { id: 4,  title: "Individual Multi Line Dialer Onboarding",  url: "https://www.loom.com/share/bb53e452362346e48510619256bfda1b" },
  { id: 5,  title: "Team Onboarding - Intro",                  url: "https://www.loom.com/share/306c20a4bd97470aaa2911eb18e5a2ea" },
  { id: 6,  title: "Manager/Billing Owner Onboarding",         url: "https://www.loom.com/share/54c64029a8504929abceac46acee752c" },
  { id: 7,  title: "Admin Settings Lock",                      url: "https://www.loom.com/share/ec6a9741c531470aa8835347c9e1fc58" },
  { id: 8,  title: "Understanding User Roles",                 url: "https://www.loom.com/share/4482c88a456c457c8e98ff73171dd873" },
  { id: 9,  title: "Agent/User Onboarding",                   url: "https://www.loom.com/share/c22c59b083fb408b9cc8bef1ecab4250" },

  // ── How-To (courseId=2) ──────────────────────────────────────────────────
  { id: 11, title: "Welcome To The How-To Section",            url: "https://www.loom.com/share/31c2aacc6f9c4a0593bb4d173e8142c0" },
  { id: 12, title: "Making Calls With WAVV",                   url: "https://www.loom.com/share/f4bbb4ff9b0743f1a8e41e613b26adb3" },
  // Lesson 13 was "Voicemails" — split into two; update title + set outbound URL, add inbound as new lesson
  { id: 13, title: "Outbound Voicemails",                      url: "https://www.loom.com/share/74809218f7514cfda22a8136dc0c8aeb" },
  { id: 15, title: "Resuming A WAVV Call Campaign",            url: "https://www.loom.com/share/386827621d2045a098a3b5958694a437" },
  { id: 16, title: "Nuisance Protection",                      url: "https://www.loom.com/share/3138552497fc4b8fb73b0b0618ac58e0" },
  { id: 17, title: "Call Transfers",                           url: "https://www.loom.com/share/1fb002c3ce8646cfb5227c0ba911fbdf" },
  { id: 18, title: "Audio Source",                             url: "https://www.loom.com/share/40096adc8e19414383bd8be6e27c2028" },
  { id: 19, title: "Spam Protection",                          url: "https://www.loom.com/share/34bc6fb91674441897d7e4e1af3ddac0" },

  // ── Strategy & Best Practices (courseId=3) ───────────────────────────────
  { id: 20, title: "Welcome To The Strategy & Best Practices Section", url: "https://www.loom.com/share/dfe22925928c4e3585739d0c4cde3607" },
  { id: 21, title: "WAVV Phone Numbers Tab",                   url: "https://www.loom.com/share/405084a41eef425c9ec1d827b476d3e6" },
  { id: 22, title: "Overview Of Connection Rates",             url: "https://www.loom.com/share/fb5a30d1e0aa4a18b9f6524d55d76d7c" },
  { id: 23, title: "Connection Rates vs Conversation Rates",   url: "https://www.loom.com/share/8273b292095c473db9b7a2da03bcb832" },
  { id: 24, title: "Using The Reports Tab To Track Connection Rates", url: "https://www.loom.com/share/a975028bb8944a07b008ee8d325c46df" },
  { id: 25, title: "Beginner Foundational Setup",              url: "https://www.loom.com/share/ff828e167c8544dfab40511485f5e562" },
  { id: 26, title: "Intermediate Foundational Setup",          url: "https://www.loom.com/share/144e92518ee242469a3fa9d4e0510aae" },
  { id: 27, title: "Advanced Foundational Setup",              url: "https://www.loom.com/share/e6d749ab3fa9496a99092ee5c754166a" },
];

// Inbound Voicemails needs to be inserted as a new lesson between id 13 and 15
const newLesson = {
  courseId: 2,
  title: "Inbound Voicemails",
  videoUrl: loomEmbed("https://www.loom.com/share/519433f254b4412b99185010c3f8639b"),
  sortOrder: 35, // between 3 and 4 — we'll use 3.5 → 35 with a reorder after
  published: true,
};

async function run() {
  const conn = await createConnection(process.env.DATABASE_URL);

  let updated = 0;
  for (const item of updates) {
    const embedUrl = loomEmbed(item.url);
    await conn.execute(
      "UPDATE lessons SET videoUrl = ?, title = ? WHERE id = ?",
      [embedUrl, item.title, item.id]
    );
    updated++;
    console.log(`✓ [${item.id}] ${item.title}`);
  }

  // Insert Inbound Voicemails if it doesn't already exist
  const [existing] = await conn.execute(
    "SELECT id FROM lessons WHERE courseId = 2 AND title = 'Inbound Voicemails'"
  );
  if (existing.length === 0) {
    await conn.execute(
      "INSERT INTO lessons (courseId, title, videoUrl, sortOrder, published) VALUES (?, ?, ?, ?, ?)",
      [newLesson.courseId, newLesson.title, newLesson.videoUrl, newLesson.sortOrder, newLesson.published]
    );
    console.log("✓ [NEW] Inbound Voicemails");
  } else {
    await conn.execute(
      "UPDATE lessons SET videoUrl = ? WHERE courseId = 2 AND title = 'Inbound Voicemails'",
      [newLesson.videoUrl]
    );
    console.log("✓ [UPDATE] Inbound Voicemails");
  }

  // Fix sortOrder for How-To lessons so Inbound Voicemails appears right after Outbound
  // Outbound = id 13 (sortOrder 3), Inbound should be 3.5 → reorder: 1,2,3,4,5,6,7,8,9
  await conn.execute(`
    UPDATE lessons SET sortOrder = CASE id
      WHEN 11 THEN 1
      WHEN 12 THEN 2
      WHEN 13 THEN 3
      ELSE sortOrder
    END
    WHERE courseId = 2
  `);
  // Set Inbound Voicemails to sortOrder 4, and shift the rest
  await conn.execute(
    "UPDATE lessons SET sortOrder = 4 WHERE courseId = 2 AND title = 'Inbound Voicemails'"
  );
  await conn.execute("UPDATE lessons SET sortOrder = 5 WHERE id = 15");
  await conn.execute("UPDATE lessons SET sortOrder = 6 WHERE id = 16");
  await conn.execute("UPDATE lessons SET sortOrder = 7 WHERE id = 17");
  await conn.execute("UPDATE lessons SET sortOrder = 8 WHERE id = 18");
  await conn.execute("UPDATE lessons SET sortOrder = 9 WHERE id = 19");

  console.log(`\nDone. ${updated} lessons updated + Inbound Voicemails added/updated.`);
  await conn.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
