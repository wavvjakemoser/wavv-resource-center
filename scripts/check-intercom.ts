import { getDb } from "../server/_core/db";
import { siteSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = getDb();
const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, "intercom_enabled"));
console.log("intercom_enabled row:", JSON.stringify(rows, null, 2));

// Also check all settings
const all = await db.select().from(siteSettings);
console.log("\nAll site settings:");
all.forEach(r => console.log(`  ${r.key} = ${r.value}`));
process.exit(0);
