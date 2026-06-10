// Run with: node --loader ts-node/esm scripts/query-mfa-status.mjs
// Or via: pnpm tsx scripts/query-mfa-status.mjs
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env from .env
const envPath = resolve(process.cwd(), '.env');
let dbUrl;
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)/);
  if (match) dbUrl = match[1].trim();
} catch {}

if (!dbUrl) {
  dbUrl = process.env.DATABASE_URL;
}

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const conn = await createConnection(dbUrl);
const [rows] = await conn.execute(
  `SELECT id, name, email, role, mfa_enabled, created_at 
   FROM users 
   ORDER BY mfa_enabled ASC, name ASC`
);
await conn.end();

console.log(JSON.stringify(rows, null, 2));
