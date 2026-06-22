import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DATABASE_URL'); process.exit(1); }

const conn = await createConnection(url);

// List all users
const [rows] = await conn.query(
  'SELECT id, name, email, account_type, approval_status, loginMethod, createdAt FROM users ORDER BY createdAt DESC LIMIT 20'
);
console.log('\n=== All Users ===');
console.table(rows);

await conn.end();
