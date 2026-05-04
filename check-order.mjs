import mysql from "mysql2/promise";
const db = await mysql.createConnection(process.env.DATABASE_URL);
const [courses] = await db.query("SELECT id, title, category FROM courses ORDER BY id ASC");
for (const c of courses) {
  const [lessons] = await db.query("SELECT id, title FROM lessons WHERE courseId = ? ORDER BY id ASC", [c.id]);
  console.log(`\n[${c.category}] ${c.title}`);
  for (const l of lessons) console.log(`  - ${l.title}`);
}
await db.end();
