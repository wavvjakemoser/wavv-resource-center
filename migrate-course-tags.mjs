import { createConnection } from "mysql2/promise";

const conn = await createConnection(process.env.DATABASE_URL);
await conn.execute("ALTER TABLE `courses` ADD COLUMN IF NOT EXISTS `tags` text");
console.log("Migration complete: courses.tags column added");
await conn.end();
