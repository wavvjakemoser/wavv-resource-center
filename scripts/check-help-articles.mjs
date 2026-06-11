import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// Load env
const envPath = "/home/ubuntu/wavv-resource-center/.env";
try {
  const envContent = readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
} catch {}

const url = process.env.DATABASE_URL;
if (!url) { console.log("No DATABASE_URL"); process.exit(1); }

const conn = await createConnection(url);
const [rows] = await conn.execute("SELECT id, title, file_type FROM guides WHERE file_type = 'help_article'");
console.log("help_article guides in DB:", rows.length);
if (rows.length > 0) console.log(rows.map(r => r.title));
await conn.end();
