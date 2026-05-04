import { createConnection } from "mysql2/promise";

const conn = await createConnection(process.env.DATABASE_URL);
await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`bookmarks\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`contentType\` varchar(50) NOT NULL,
    \`contentId\` int NOT NULL,
    \`contentTitle\` varchar(255),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`bookmarks_id\` PRIMARY KEY(\`id\`)
  )
`);
console.log("Migration complete: bookmarks table created");
await conn.end();
