import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { asc } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.error("No DB connection"); process.exit(1); }
  const rows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    mfaEnabled: users.mfaEnabled,
    createdAt: users.createdAt,
  }).from(users).orderBy(asc(users.mfaEnabled), asc(users.name));

  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
