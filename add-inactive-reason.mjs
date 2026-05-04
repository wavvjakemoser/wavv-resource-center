import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

const envContent = readFileSync('/home/ubuntu/wavv-resource-center/.env', 'utf8');
const dbLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbLine ? dbLine.replace('DATABASE_URL=', '').trim().replace(/^["']|["']$/g, '') : null;

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const conn = await createConnection(dbUrl);
try {
  const [rows] = await conn.execute("SHOW COLUMNS FROM lessons LIKE 'inactiveReason'");
  if (rows.length > 0) {
    console.log('Column inactiveReason already exists — skipping');
  } else {
    await conn.execute('ALTER TABLE lessons ADD COLUMN inactiveReason varchar(255) NULL DEFAULT NULL');
    console.log('SUCCESS: inactiveReason column added to lessons table');
  }
} catch (e) {
  console.error('Migration error:', e.message);
} finally {
  await conn.end();
}
