import { createConnection } from 'mysql2/promise';
const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  'SELECT l.id, l.title, l.tags, c.category, c.title as course_name FROM lessons l JOIN courses c ON l.courseId = c.id ORDER BY c.category, l.sortOrder'
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
