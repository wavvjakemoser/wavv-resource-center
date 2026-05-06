/**
 * Sync DB lesson titles to match the exact titles shown on the Academy landing page.
 * Mapping: DB lesson id -> Academy page video title
 *
 * DB current state (from audit):
 *   id=1  "Welcome To The Onboarding Section"     courseId=30001  -> "Welcome to WAVV Onboarding"
 *   id=2  "WAVV Wallet"                            courseId=30002  -> "Introducing WAVV Wallet"
 *   id=3  "Individual Single Line Dialer Onboarding" courseId=30003 -> "Getting Started With Your Single Line Dialer"
 *   id=4  "Individual Multi Line Dialer Onboarding"  courseId=30004 -> "Getting Started With Your Multi Line Dialer"
 *   id=5  "Team Onboarding - Intro"               courseId=30005  -> "Team Onboarding - Intro"  (already matches)
 *   id=6  "Manager/Billing Owner Onboarding"      courseId=30005  -> "Manager/Billing Owner Onboarding" (already matches)
 *   id=7  "Admin Settings Lock"                   courseId=30005  -> "Settings Lock"
 *   id=8  "Understanding User Roles"              courseId=30005  -> "Understanding User Roles" (already matches)
 *   id=9  "Agent/User Onboarding"                 courseId=30005  -> "Agent Onboarding"
 *   id=10 "Common Onboarding Questions"           courseId=30006  -> "Common Onboarding Questions" (already matches, section is coming_soon)
 *   id=11 "Welcome To The How-To Section"         courseId=30007  -> "Welcome to How-To"
 *   id=12 "Making Calls With WAVV"                courseId=30008  -> "Different Ways to Make Calls With WAVV"
 *   id=13 "Outbound Voicemails"                   courseId=30009  -> "How to Use Outbound Voicemails Within Your WAVV Dialer"
 *   id=30001 "Inbound Voicemails"                 courseId=30009  -> "Understanding the Voicemail Tab and Incoming Voicemails"
 *   id=15 "Resuming A WAVV Call Campaign"         courseId=30010  -> "Resuming a WAVV Call Campaign"
 *   id=16 "Nuisance Protection"                   courseId=30011  -> "Understanding the Nuisance Protection Feature"
 *   id=17 "Call Transfers"                        courseId=30012  -> "How to Transfer Calls Within WAVV"
 *   id=18 "Audio Source"                          courseId=30013  -> "Understanding Your Audio Source"
 *   id=19 "Spam Protection"                       courseId=30014  -> "How to Add Spam Protection"
 *   id=20 "Welcome To The Strategy & Best Practices Section" courseId=30015 -> "Welcome to Strategy & Best Practices"
 *   id=21 "WAVV Phone Numbers Tab"                courseId=30016  -> "Understanding the WAVV Phone Numbers Tab"
 *   id=22 "Overview Of Connection Rates"          courseId=30017  -> "Overview of Connection Rates"
 *   id=23 "Connection Rates vs Conversation Rates" courseId=30017 -> "Connection Rates vs Conversion Rates"
 *   id=24 "Using The Reports Tab To Track Connection Rates" courseId=30017 -> "Using the Reports Tab to Track Connection Rates"
 *   id=25 "Beginner Foundational Setup"           courseId=30017  -> "Beginner Foundational Setup" (already matches)
 *   id=26 "Intermediate Foundational Setup"       courseId=30017  -> "Intermediate Foundational Setup" (already matches)
 *   id=27 "Advanced Foundational Setup"           courseId=30017  -> "Advanced Foundational Setup" (already matches)
 */

import mysql from 'mysql2/promise';

const TITLE_MAP = [
  { id: 1,     title: "Welcome to WAVV Onboarding" },
  { id: 2,     title: "Introducing WAVV Wallet" },
  { id: 3,     title: "Getting Started With Your Single Line Dialer" },
  { id: 4,     title: "Getting Started With Your Multi Line Dialer" },
  // id=5 already correct: "Team Onboarding - Intro"
  // id=6 already correct: "Manager/Billing Owner Onboarding"
  { id: 7,     title: "Settings Lock" },
  // id=8 already correct: "Understanding User Roles"
  { id: 9,     title: "Agent Onboarding" },
  // id=10 already correct: "Common Onboarding Questions"
  { id: 11,    title: "Welcome to How-To" },
  { id: 12,    title: "Different Ways to Make Calls With WAVV" },
  { id: 13,    title: "How to Use Outbound Voicemails Within Your WAVV Dialer" },
  { id: 30001, title: "Understanding the Voicemail Tab and Incoming Voicemails" },
  { id: 15,    title: "Resuming a WAVV Call Campaign" },
  { id: 16,    title: "Understanding the Nuisance Protection Feature" },
  { id: 17,    title: "How to Transfer Calls Within WAVV" },
  { id: 18,    title: "Understanding Your Audio Source" },
  { id: 19,    title: "How to Add Spam Protection" },
  { id: 20,    title: "Welcome to Strategy & Best Practices" },
  { id: 21,    title: "Understanding the WAVV Phone Numbers Tab" },
  { id: 22,    title: "Overview of Connection Rates" },
  { id: 23,    title: "Connection Rates vs Conversion Rates" },
  { id: 24,    title: "Using the Reports Tab to Track Connection Rates" },
  // id=25,26,27 already correct
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log(`Updating ${TITLE_MAP.length} lesson titles...`);
  for (const { id, title } of TITLE_MAP) {
    const [result] = await conn.execute(
      'UPDATE lessons SET title = ? WHERE id = ?',
      [title, id]
    );
    const affected = result.affectedRows;
    console.log(`  id=${id}: ${affected > 0 ? '✓' : '⚠ NOT FOUND'} → "${title}"`);
  }
  // Verify final state
  const [rows] = await conn.execute('SELECT id, title FROM lessons ORDER BY id');
  console.log('\nFinal lesson titles:');
  rows.forEach(r => console.log(`  id=${r.id}: ${r.title}`));
  await conn.end();
  console.log('\nDone.');
}

main().catch(console.error);
