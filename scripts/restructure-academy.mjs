/**
 * Restructure Academy DB to mirror AcademyCategory.tsx exactly:
 *
 * Onboarding (6 sections):
 *   1. Welcome To The Onboarding Section  → 1 video (id=1)
 *   2. NEW: WAVV Wallet                   → 1 video (id=2)
 *   3. Individual Single Line Dialer Onboarding → 1 video (id=3)
 *   4. Individual Multi Line Dialer Onboarding  → 1 video (id=4)
 *   5. Team Onboarding                    → 5 videos (id=5,6,7,8,9)
 *   6. Common Onboarding Questions        → 3 videos (id=10, currently unpublished) → keep unpublished
 *
 * How-To (8 sections):
 *   1. Welcome To The How-To Section      → 1 video (id=11)
 *   2. Making Calls With WAVV             → 1 video (id=12)
 *   3. Voicemails                         → 2 videos (id=13, id=30001)
 *   4. WAVV Call Campaigns                → 1 video (id=15)
 *   5. Nuisance Protection                → 1 video (id=16)
 *   6. Call Transfers                     → 1 video (id=17)
 *   7. Audio Source                       → 1 video (id=18)
 *   8. Spam Protection                    → 1 video (id=19)
 *
 * Strategy & Best Practices (3 sections):
 *   1. Welcome To The Strategy & Best Practices Section → 1 video (id=20)
 *   2. WAVV Phone Numbers Tab             → 1 video (id=21)
 *   3. Connection Rates                   → 6 videos (id=22,23,24,25,26,27)
 *
 * Extra courses to delete: id=4,5,6 (and their lessons 28-40)
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // ── Step 1: Delete extra course lessons (ids 28–40) ──────────────────────
  console.log('Deleting extra course lessons (ids 28–40)...');
  await conn.execute('DELETE FROM lessons WHERE courseId IN (4, 5, 6)');

  // ── Step 2: Delete extra courses (ids 4, 5, 6) ───────────────────────────
  console.log('Deleting extra courses (ids 4, 5, 6)...');
  await conn.execute('DELETE FROM courses WHERE id IN (4, 5, 6)');

  // ── Step 3: Create new section courses for Onboarding ────────────────────
  console.log('Creating Onboarding section courses...');
  const onbSections = [
    { title: '1. Welcome To The Onboarding Section', sortOrder: 1 },
    { title: '2. NEW: WAVV Wallet', sortOrder: 2 },
    { title: '3. Individual Single Line Dialer Onboarding', sortOrder: 3 },
    { title: '4. Individual Multi Line Dialer Onboarding', sortOrder: 4 },
    { title: '5. Team Onboarding', sortOrder: 5 },
    { title: '6. Common Onboarding Questions', sortOrder: 6 },
  ];
  const onbIds = [];
  for (const s of onbSections) {
    const [r] = await conn.execute(
      'INSERT INTO courses (title, category, sortOrder, published) VALUES (?, ?, ?, 1)',
      [s.title, 'Onboarding', s.sortOrder]
    );
    onbIds.push(r.insertId);
    console.log(`  Created Onboarding section: "${s.title}" → id=${r.insertId}`);
  }

  // ── Step 4: Create new section courses for How-To ─────────────────────────
  console.log('Creating How-To section courses...');
  const howSections = [
    { title: '1. Welcome To The How-To Section', sortOrder: 1 },
    { title: '2. Making Calls With WAVV', sortOrder: 2 },
    { title: '3. Voicemails', sortOrder: 3 },
    { title: '4. WAVV Call Campaigns', sortOrder: 4 },
    { title: '5. Nuisance Protection', sortOrder: 5 },
    { title: '6. Call Transfers', sortOrder: 6 },
    { title: '7. Audio Source', sortOrder: 7 },
    { title: '8. Spam Protection', sortOrder: 8 },
  ];
  const howIds = [];
  for (const s of howSections) {
    const [r] = await conn.execute(
      'INSERT INTO courses (title, category, sortOrder, published) VALUES (?, ?, ?, 1)',
      [s.title, 'How-To', s.sortOrder]
    );
    howIds.push(r.insertId);
    console.log(`  Created How-To section: "${s.title}" → id=${r.insertId}`);
  }

  // ── Step 5: Create new section courses for Strategy ───────────────────────
  console.log('Creating Strategy & Best Practices section courses...');
  const strSections = [
    { title: '1. Welcome To The Strategy & Best Practices Section', sortOrder: 1 },
    { title: '2. WAVV Phone Numbers Tab', sortOrder: 2 },
    { title: '3. Connection Rates', sortOrder: 3 },
  ];
  const strIds = [];
  for (const s of strSections) {
    const [r] = await conn.execute(
      'INSERT INTO courses (title, category, sortOrder, published) VALUES (?, ?, ?, 1)',
      [s.title, 'Strategy and Best Practices', s.sortOrder]
    );
    strIds.push(r.insertId);
    console.log(`  Created Strategy section: "${s.title}" → id=${r.insertId}`);
  }

  // ── Step 6: Reassign Onboarding lessons to new section courses ────────────
  console.log('Reassigning Onboarding lessons...');
  // onb-1: id=1 → section 1
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=1', [onbIds[0]]);
  // onb-2: id=2 → section 2
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=2', [onbIds[1]]);
  // onb-3: id=3 → section 3
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=3', [onbIds[2]]);
  // onb-4: id=4 → section 4
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=4', [onbIds[3]]);
  // onb-5: ids=5,6,7,8,9 → section 5
  await conn.execute('UPDATE lessons SET courseId=? WHERE id IN (5,6,7,8,9)', [onbIds[4]]);
  // onb-6: id=10 → section 6 (coming_soon / unpublished)
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=10', [onbIds[5]]);

  // ── Step 7: Reassign How-To lessons to new section courses ────────────────
  console.log('Reassigning How-To lessons...');
  // how-1: id=11 → section 1
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=11', [howIds[0]]);
  // how-2: id=12 → section 2
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=12', [howIds[1]]);
  // how-3: ids=13, 30001 → section 3 (Voicemails)
  await conn.execute('UPDATE lessons SET courseId=? WHERE id IN (13, 30001)', [howIds[2]]);
  // how-4: id=15 → section 4
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=15', [howIds[3]]);
  // how-5: id=16 → section 5
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=16', [howIds[4]]);
  // how-6: id=17 → section 6
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=17', [howIds[5]]);
  // how-7: id=18 → section 7
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=18', [howIds[6]]);
  // how-8: id=19 → section 8
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=19', [howIds[7]]);

  // ── Step 8: Reassign Strategy lessons to new section courses ──────────────
  console.log('Reassigning Strategy lessons...');
  // str-1: id=20 → section 1
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=20', [strIds[0]]);
  // str-2: id=21 → section 2
  await conn.execute('UPDATE lessons SET courseId=? WHERE id=21', [strIds[1]]);
  // str-3: ids=22,23,24,25,26,27 → section 3 (Connection Rates)
  await conn.execute('UPDATE lessons SET courseId=? WHERE id IN (22,23,24,25,26,27)', [strIds[2]]);

  // ── Step 9: Delete the old single-bucket courses (ids 1, 2, 3) ───────────
  console.log('Deleting old single-bucket courses (ids 1, 2, 3)...');
  await conn.execute('DELETE FROM courses WHERE id IN (1, 2, 3)');

  // ── Step 10: Verify ───────────────────────────────────────────────────────
  console.log('\n=== VERIFICATION ===');
  const [courses] = await conn.execute('SELECT id, title, category, sortOrder FROM courses ORDER BY category, sortOrder');
  console.log('Courses:');
  courses.forEach(c => console.log(`  [${c.id}] ${c.category} | ${c.title}`));

  const [onbCount] = await conn.execute("SELECT COUNT(*) as cnt FROM lessons l JOIN courses c ON l.courseId=c.id WHERE c.category='Onboarding'");
  const [howCount] = await conn.execute("SELECT COUNT(*) as cnt FROM lessons l JOIN courses c ON l.courseId=c.id WHERE c.category='How-To'");
  const [strCount] = await conn.execute("SELECT COUNT(*) as cnt FROM lessons l JOIN courses c ON l.courseId=c.id WHERE c.category='Strategy and Best Practices'");
  console.log(`\nLesson counts: Onboarding=${onbCount[0].cnt}, How-To=${howCount[0].cnt}, Strategy=${strCount[0].cnt}`);

  const [onbSect] = await conn.execute("SELECT COUNT(*) as cnt FROM courses WHERE category='Onboarding'");
  const [howSect] = await conn.execute("SELECT COUNT(*) as cnt FROM courses WHERE category='How-To'");
  const [strSect] = await conn.execute("SELECT COUNT(*) as cnt FROM courses WHERE category='Strategy and Best Practices'");
  console.log(`Section counts: Onboarding=${onbSect[0].cnt}, How-To=${howSect[0].cnt}, Strategy=${strSect[0].cnt}`);

  console.log('\n✅ DB restructure complete.');
} catch (err) {
  console.error('❌ Error:', err);
  process.exit(1);
} finally {
  await conn.end();
}
