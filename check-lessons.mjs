import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DB URL'); process.exit(1); }

const conn = await createConnection(url);
const [rows] = await conn.execute(
  'SELECT l.id, l.title, l.tags, c.title as course_name FROM lessons l JOIN courses c ON l.courseId = c.id WHERE c.category = ? LIMIT 20',
  ['Onboarding']
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
