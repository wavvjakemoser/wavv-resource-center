import { createConnection } from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DATABASE_URL'); process.exit(1); }

const conn = await createConnection(url);

// Fix Kameron: set account_type to employee (was guest due to token gap) and approve
const [kamResult] = await conn.query(
  `UPDATE users SET account_type = 'employee', approval_status = 'approved', is_employee = 1 WHERE email = 'kameron.abilla@wavv.com'`
);
console.log('Kameron update:', kamResult.affectedRows, 'row(s)');

// Approve Kaden (already employee, just needs approval)
const [kadenResult] = await conn.query(
  `UPDATE users SET approval_status = 'approved' WHERE email = 'kaden.crowther@wavv.com'`
);
console.log('Kaden update:', kadenResult.affectedRows, 'row(s)');

// Verify
const [rows] = await conn.query(
  `SELECT name, email, account_type, approval_status FROM users WHERE email IN ('kaden.crowther@wavv.com', 'kameron.abilla@wavv.com')`
);
console.log('\nVerification:');
console.table(rows);

await conn.end();
