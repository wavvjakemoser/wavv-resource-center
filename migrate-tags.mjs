import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
await conn.execute("ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tags TEXT NULL");
await conn.end();
console.log('Migration done: tags column added to lessons table');
