/**
 * Seed script: WAVV Academy courses and lessons
 * Based on the existing Go High Level WAVV Academy content
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// ─── Course + Lesson Data ────────────────────────────────────────────────────

const COURSES = [
  // ── Onboarding ──────────────────────────────────────────────────────────
  {
    title: "Onboarding",
    category: "Onboarding",
    description: "Everything you need to get your team up and running with WAVV quickly and effectively.",
    sortOrder: 1,
    lessons: [
      { title: "Welcome to the Onboarding Section", sortOrder: 1, description: "Introduction and overview of the onboarding journey." },
      { title: "Introducing WAVV Wallet", sortOrder: 2, description: "Learn about WAVV Wallet and how it manages your calling credits." },
      { title: "Getting Started With Your Single Line Dialer", sortOrder: 3, description: "Step-by-step setup for the individual single line dialer." },
      { title: "Getting Started With Your Multi Line Dialer", sortOrder: 4, description: "Step-by-step setup for the individual multi line dialer." },
      { title: "Team Onboarding - Intro", sortOrder: 5, description: "Overview of team onboarding process for managers." },
      { title: "Manager/Billing Owner Onboarding", sortOrder: 6, description: "Specific onboarding steps for billing owners and managers." },
      { title: "Settings Lock", sortOrder: 7, description: "Understanding and using the Settings Lock feature for team control." },
      { title: "Understanding User Roles", sortOrder: 8, description: "Learn about admin, manager, and agent roles within WAVV." },
      { title: "Agent Onboarding", sortOrder: 9, description: "Onboarding guide specifically for agents joining the team." },
      { title: "Common Onboarding Questions", sortOrder: 10, description: "Answers to the most frequently asked questions during onboarding." },
    ],
  },
  // ── How-To ──────────────────────────────────────────────────────────────
  {
    title: "How-To",
    category: "How-To",
    description: "Step-by-step guides for every core WAVV feature.",
    sortOrder: 2,
    lessons: [
      { title: "Welcome to the How-To Section", sortOrder: 1, description: "Introduction to the How-To learning path." },
      { title: "Different Ways to Make Calls With WAVV", sortOrder: 2, description: "Overview of all calling modes available in WAVV." },
      { title: "Understanding the Voicemail Tab and Incoming Voicemails", sortOrder: 3, description: "How to manage voicemails inside the WAVV dialer." },
      { title: "How to Use Outbound Voicemails Within Your WAVV Dialer", sortOrder: 4, description: "Setting up and sending outbound voicemail drops." },
      { title: "Resuming a WAVV Call Campaign", sortOrder: 5, description: "How to pause and resume an active call campaign." },
      { title: "Understanding the Nuisance Protection Feature", sortOrder: 6, description: "What nuisance protection does and how to configure it." },
      { title: "How to Transfer Calls Within WAVV", sortOrder: 7, description: "Warm and cold transfer workflows inside the dialer." },
      { title: "Understanding Your Audio Source", sortOrder: 8, description: "Configuring microphone and audio input settings." },
      { title: "How to Add Spam Protection", sortOrder: 9, description: "Steps to protect your numbers from spam flagging." },
    ],
  },
  // ── Strategy and Best Practices ─────────────────────────────────────────
  {
    title: "Strategy & Best Practices",
    category: "Strategy and Best Practices",
    description: "Proven strategies to maximize connection rates and drive better outcomes with WAVV.",
    sortOrder: 3,
    lessons: [
      { title: "Welcome to Strategy & Best Practices", sortOrder: 1, description: "Overview of the strategy learning path." },
      { title: "Understanding the WAVV Phone Numbers Tab", sortOrder: 2, description: "How to manage and optimize your phone number inventory." },
      { title: "Overview of Connection Rates", sortOrder: 3, description: "What connection rates mean and how to benchmark them." },
      { title: "Connection Rates vs Conversion Rates", sortOrder: 4, description: "Understanding the difference and why both matter." },
      { title: "Using the Reports Tab to Track Connection Rates", sortOrder: 5, description: "How to pull and interpret connection rate reports." },
      { title: "Beginner Foundational Setup", sortOrder: 6, description: "Core configuration for teams just getting started." },
      { title: "Intermediate Foundational Setup", sortOrder: 7, description: "Advanced configuration for growing teams." },
      { title: "Advanced Foundational Setup", sortOrder: 8, description: "Expert-level setup for high-volume calling teams." },
    ],
  },
  // ── Dialer Setup ────────────────────────────────────────────────────────
  {
    title: "Dialer Setup",
    category: "Dialer Setup",
    description: "Configure your WAVV dialer for optimal performance and reliability.",
    sortOrder: 4,
    lessons: [
      { title: "Dialer Configuration Overview", sortOrder: 1, description: "High-level walkthrough of all dialer settings." },
      { title: "Setting Up Call Campaigns", sortOrder: 2, description: "How to create and configure a call campaign in WAVV." },
      { title: "Call Dispositions and Stage Management", sortOrder: 3, description: "Setting up dispositions and managing pipeline stages." },
      { title: "Automation Page Setup", sortOrder: 4, description: "Configuring automation triggers and workflows." },
      { title: "Pipeline Sync Configuration", sortOrder: 5, description: "Syncing your CRM pipeline with WAVV call data." },
    ],
  },
  // ── CRM Integrations ────────────────────────────────────────────────────
  {
    title: "CRM Integrations",
    category: "CRM Integrations",
    description: "Connect WAVV with your CRM for seamless data flow and workflow automation.",
    sortOrder: 5,
    lessons: [
      { title: "CRM Integration Overview", sortOrder: 1, description: "Supported CRMs and integration architecture." },
      { title: "GoHighLevel Integration Setup", sortOrder: 2, description: "Step-by-step guide to connecting WAVV with GoHighLevel." },
      { title: "API and Webhooks for Call Data", sortOrder: 3, description: "Using WAVV's API and webhooks to push call data to your CRM." },
      { title: "Chrome Extension for HL Users", sortOrder: 4, description: "Installing and using the WAVV Chrome Extension for GoHighLevel." },
    ],
  },
  // ── Spam Protection ─────────────────────────────────────────────────────
  {
    title: "Spam Protection",
    category: "Spam Protection",
    description: "Protect your phone numbers from spam flagging and maintain high deliverability.",
    sortOrder: 6,
    lessons: [
      { title: "Understanding Spam Flagging", sortOrder: 1, description: "How numbers get flagged and what it means for your call rates." },
      { title: "SPAM Visibility Flagging", sortOrder: 2, description: "How to identify and monitor spam flags on your numbers." },
      { title: "Number Rotation Strategy", sortOrder: 3, description: "Best practices for rotating numbers to avoid spam flags." },
      { title: "How to Add Spam Protection in WAVV", sortOrder: 4, description: "Step-by-step guide to enabling spam protection features." },
    ],
  },
];

// ─── Seed ────────────────────────────────────────────────────────────────────

console.log("Seeding WAVV Academy courses and lessons...");

for (const course of COURSES) {
  const { lessons, ...courseData } = course;

  // Insert course
  const [result] = await connection.execute(
    `INSERT INTO courses (title, category, description, sortOrder, published, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE title=title`,
    [courseData.title, courseData.category, courseData.description, courseData.sortOrder]
  );

  // Get the inserted or existing course ID
  let courseId = result.insertId;
  if (!courseId) {
    const [rows] = await connection.execute(
      `SELECT id FROM courses WHERE title = ? AND category = ?`,
      [courseData.title, courseData.category]
    );
    courseId = rows[0]?.id;
  }

  if (!courseId) {
    console.warn(`Could not get ID for course: ${courseData.title}`);
    continue;
  }

  console.log(`  Course: ${courseData.title} (id=${courseId})`);

  // Insert lessons
  for (const lesson of lessons) {
    await connection.execute(
      `INSERT INTO lessons (courseId, title, description, sortOrder, published, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=title`,
      [courseId, lesson.title, lesson.description, lesson.sortOrder]
    );
    console.log(`    Lesson: ${lesson.title}`);
  }
}

// ─── Seed sample webinars ────────────────────────────────────────────────────
console.log("\nSeeding sample webinars...");

const WEBINARS = [
  {
    title: "WAVV Onboarding Webinar",
    description: "Live walkthrough of WAVV setup for new customers. Covers dialer configuration, team setup, and first call campaign.",
    host: "Jake Moser",
    type: "recording",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: null,
  },
  {
    title: "Maximizing Connection Rates with WAVV",
    description: "Deep dive into connection rate optimization strategies, number rotation, and spam protection best practices.",
    host: "Cassie",
    type: "recording",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: null,
  },
  {
    title: "WAVV + GoHighLevel Power User Session",
    description: "Advanced integration techniques for GoHighLevel users — pipeline sync, automation, and call data webhooks.",
    host: "Jake Moser",
    type: "recording",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: null,
  },
  {
    title: "Monthly WAVV Product Update — June 2025",
    description: "Join us for a live product update covering new features, roadmap items, and Q&A with the WAVV team.",
    host: "WAVV Team",
    type: "upcoming",
    registrationUrl: "https://wavv.com",
    thumbnailUrl: null,
    scheduledAt: new Date("2025-06-15T14:00:00Z"),
  },
];

for (const w of WEBINARS) {
  await connection.execute(
    `INSERT INTO webinars (title, description, host, type, videoUrl, registrationUrl, thumbnailUrl, scheduledAt, published, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE title=title`,
    [w.title, w.description, w.host, w.type, w.videoUrl ?? null, w.registrationUrl ?? null, w.thumbnailUrl ?? null, w.scheduledAt ?? null]
  );
  console.log(`  Webinar: ${w.title}`);
}

// ─── Seed sample guides ──────────────────────────────────────────────────────
console.log("\nSeeding sample guides...");

const GUIDES = [
  {
    title: "WAVV Quick Start Checklist",
    description: "A step-by-step checklist to get your team fully set up and making calls within 24 hours.",
    category: "Onboarding",
    fileType: "checklist",
    fileUrl: "https://wavv.com",
  },
  {
    title: "Connection Rate Optimization Playbook",
    description: "Proven strategies to improve your connection rates, reduce spam flags, and maximize ROI.",
    category: "Strategy and Best Practices",
    fileType: "playbook",
    fileUrl: "https://wavv.com",
  },
  {
    title: "WAVV + GoHighLevel Integration Guide",
    description: "Complete setup guide for integrating WAVV with GoHighLevel, including webhook configuration.",
    category: "CRM Integrations",
    fileType: "pdf",
    fileUrl: "https://wavv.com",
  },
  {
    title: "Spam Protection Best Practices",
    description: "Everything you need to know about protecting your numbers and maintaining high deliverability.",
    category: "Spam Protection",
    fileType: "pdf",
    fileUrl: "https://wavv.com",
  },
];

for (const g of GUIDES) {
  await connection.execute(
    `INSERT INTO guides (title, description, category, fileType, fileUrl, published, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE title=title`,
    [g.title, g.description, g.category, g.fileType, g.fileUrl]
  );
  console.log(`  Guide: ${g.title}`);
}

await connection.end();
console.log("\n✓ Seed complete.");
