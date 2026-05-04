import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// 1. Apply "Most Popular" tag to Connection Rates lessons
// These are lessons whose titles contain "Connection Rate"
const [connRateLessons] = await conn.execute(
  "SELECT id, title, tags FROM lessons WHERE title LIKE '%Connection Rate%'"
);
console.log("Connection Rate lessons:", connRateLessons.map(l => l.title));

for (const lesson of connRateLessons) {
  const existingTags = lesson.tags ? lesson.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  if (!existingTags.includes("Most Popular")) {
    existingTags.push("Most Popular");
    await conn.execute("UPDATE lessons SET tags = ? WHERE id = ?", [existingTags.join(","), lesson.id]);
    console.log(`✓ Applied "Most Popular" to: ${lesson.title}`);
  } else {
    console.log(`  Already has "Most Popular": ${lesson.title}`);
  }
}

// 2. Update DB lesson titles to match the new static titles for How-To and Strategy sections
// Map: [old title pattern] → [new title]
const titleUpdates = [
  // How-To section
  { pattern: "Welcome%How-To%",         newTitle: "Welcome To The How-To Section" },
  { pattern: "%Making Calls%",           newTitle: "Making Calls With WAVV" },
  { pattern: "%Voicemail%",              newTitle: "Voicemails" },
  { pattern: "%Call Campaign%",          newTitle: "WAVV Call Campaigns" },
  { pattern: "%Nuisance%",               newTitle: "Nuisance Protection" },
  { pattern: "%Call Transfer%",          newTitle: "Call Transfers" },
  { pattern: "%Audio Source%",           newTitle: "Audio Source" },
  { pattern: "%Spam Protection%",        newTitle: "Spam Protection" },
  // Strategy section
  { pattern: "Welcome%Strategy%",        newTitle: "Welcome To The Strategy & Best Practices Section" },
  { pattern: "%Phone Numbers Tab%",      newTitle: "WAVV Phone Numbers Tab" },
  { pattern: "%Resting Phone%",          newTitle: "Resting Phone Numbers" },
  { pattern: "%When to Replace%",        newTitle: "When to Replace Phone Numbers" },
  { pattern: "%Voicemail Drop%",         newTitle: "Voicemail Drop Strategy" },
  { pattern: "%Call Script%",            newTitle: "Call Scripts & Talk Tracks" },
];

for (const { pattern, newTitle } of titleUpdates) {
  const [rows] = await conn.execute("SELECT id, title FROM lessons WHERE title LIKE ?", [pattern]);
  if (rows.length > 0) {
    for (const row of rows) {
      if (row.title !== newTitle) {
        await conn.execute("UPDATE lessons SET title = ? WHERE id = ?", [newTitle, row.id]);
        console.log(`✓ Renamed: "${row.title}" → "${newTitle}"`);
      }
    }
  }
}

await conn.end();
console.log("\nDone.");
