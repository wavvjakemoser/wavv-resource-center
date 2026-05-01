/**
 * Seed the first admin user for the WAVV Resource Center.
 * Run: node seed-admin.mjs
 */
import { createConnection } from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { readFileSync } from "fs";

// Load env from .env file if present
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const adminUsers = [
  {
    email: "jake@wavv.com",
    name: "Jake Moser",
    password: "WavvAdmin2026!",
    role: "admin",
  },
  {
    email: "cassie@wavv.com",
    name: "Cassie",
    password: "WavvAdmin2026!",
    role: "admin",
  },
];

async function run() {
  const conn = await createConnection(DATABASE_URL);

  for (const admin of adminUsers) {
    const hash = await bcrypt.hash(admin.password, 12);
    const openId = `native_${admin.email}_${Date.now()}`;

    // Check if user already exists
    const [existing] = await conn.execute("SELECT id FROM users WHERE email = ?", [admin.email]);
    if (existing.length > 0) {
      // Update password hash and ensure admin role
      await conn.execute(
        "UPDATE users SET passwordHash = ?, role = 'admin', isActive = 1 WHERE email = ?",
        [hash, admin.email]
      );
      console.log(`✓ Updated existing user: ${admin.email}`);
    } else {
      await conn.execute(
        `INSERT INTO users (openId, email, name, passwordHash, loginMethod, role, isActive, lastSignedIn, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'native', ?, 1, NOW(), NOW(), NOW())`,
        [openId, admin.email, admin.name, hash, admin.role]
      );
      console.log(`✓ Created admin user: ${admin.email}`);
    }
  }

  await conn.end();
  console.log("\n✅ Admin users ready.");
  console.log("   Email:    jake@wavv.com");
  console.log("   Password: WavvAdmin2026!");
  console.log("\n   Email:    cassie@wavv.com");
  console.log("   Password: WavvAdmin2026!");
  console.log("\nChange these passwords via the Admin Panel after first login.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
