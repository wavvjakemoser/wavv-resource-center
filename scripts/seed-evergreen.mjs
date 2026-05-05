import mysql from "mysql2/promise";

const webinars = [
  {
    title: "Getting to Know the WAVV Dialer",
    description: "A walkthrough of the WAVV dialer interface — how to start sessions, manage call lists, and use power dialer features effectively.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Getting to Know WAVV Call Boards",
    description: "Explore call board layouts, team queues, and real-time performance metrics. Learn how to configure boards for your team.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Getting to Know WAVV Settings",
    description: "A guided tour of WAVV account settings — integrations, user management, notifications, and configuration options.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Understanding Spam Protection in WAVV",
    description: "Learn how WAVV handles spam flagging, number health, and what you can do to protect your connection rates.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Understanding WAVV Wallet",
    description: "A breakdown of WAVV Wallet — how credits work, how to manage your balance, and how usage is tracked across your team.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Dialer Options: Understanding the 3 Dialers",
    description: "Compare the three dialer modes available in WAVV — single-line, multi-line, and power dialer — and when to use each one.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "Improving Your Connection Rates",
    description: "A quick walkthrough on the key factors that affect connection rates and the tactics WAVV provides to improve them.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
  {
    title: "WAVV Onboarding Quick Start",
    description: "Everything a new WAVV user needs to get up and running fast — account setup, first call, and key settings to configure.",
    host: "WAVV Team",
    type: "evergreen",
    published: 1,
  },
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Remove old evergreen entries
await conn.query("DELETE FROM webinars WHERE type = 'evergreen'");

for (const w of webinars) {
  await conn.query(
    "INSERT INTO webinars (title, description, host, type, published, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
    [w.title, w.description, w.host, w.type, w.published]
  );
}

const [rows] = await conn.query("SELECT id, title FROM webinars WHERE type = 'evergreen' ORDER BY id");
console.log("Seeded evergreen webinars:");
rows.forEach((r, i) => console.log(`  ${i + 1}. [${r.id}] ${r.title}`));

await conn.end();
