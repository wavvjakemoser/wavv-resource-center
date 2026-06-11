import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
const [, user, pass, host, port, db] = match;

const conn = await createConnection({ host, user, password: pass, database: db, port: port || 3306 });
const [rows] = await conn.execute(
  'SELECT id, email, role, mfa_enabled, (mfa_secret IS NOT NULL) as has_secret FROM users ORDER BY id LIMIT 20'
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
