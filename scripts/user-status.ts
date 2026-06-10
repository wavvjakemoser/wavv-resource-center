import { getDb } from "../server/db";
import { users, magicLinkTokens, inviteTokens } from "../drizzle/schema";
import { asc, eq, and, desc } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.error("No DB connection"); process.exit(1); }

  // Get all users
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    mfaEnabled: users.mfaEnabled,
    passwordHash: users.passwordHash,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt,
  }).from(users).orderBy(asc(users.name));

  // Get latest magic link invite token per user email
  const magicLinks = await db.select({
    email: magicLinkTokens.email,
    expiresAt: magicLinkTokens.expiresAt,
    usedAt: magicLinkTokens.usedAt,
    createdAt: magicLinkTokens.createdAt,
  }).from(magicLinkTokens)
    .where(eq(magicLinkTokens.type, "invite"))
    .orderBy(desc(magicLinkTokens.createdAt));

  // Get latest invite tokens per email
  const invites = await db.select({
    email: inviteTokens.email,
    expiresAt: inviteTokens.expiresAt,
    used: inviteTokens.used,
    createdAt: inviteTokens.createdAt,
  }).from(inviteTokens).orderBy(desc(inviteTokens.createdAt));

  const now = new Date();

  const result = allUsers.map(u => {
    const hasPassword = !!u.passwordHash;
    // lastSignedIn defaults to createdAt, so only treat as "logged in" if it's after account creation
    const createdMs = new Date(u.createdAt as any).getTime();
    const lastSignedMs = u.lastSignedIn ? new Date(u.lastSignedIn as any).getTime() : 0;
    const hasLoggedIn = hasPassword || (lastSignedMs > createdMs + 60_000); // >1 min after creation

    // Find latest invite for this user's email
    const magicLink = magicLinks.find(m => m.email?.toLowerCase() === u.email?.toLowerCase());
    const invite = invites.find(i => i.email?.toLowerCase() === u.email?.toLowerCase());

    // Use whichever is more recent
    let inviteSentAt: Date | null = null;
    let inviteExpiresAt: Date | null = null;
    let inviteClaimed = false;

    if (magicLink) {
      inviteSentAt = new Date(magicLink.createdAt as any);
      inviteExpiresAt = new Date(magicLink.expiresAt as any);
      inviteClaimed = !!magicLink.usedAt;
    }
    if (invite) {
      const inviteDate = new Date(invite.createdAt as any);
      if (!inviteSentAt || inviteDate > inviteSentAt) {
        inviteSentAt = inviteDate;
        inviteExpiresAt = new Date(invite.expiresAt as any);
        inviteClaimed = !!invite.used;
      }
    }

    const inviteExpired = inviteSentAt && inviteExpiresAt && !inviteClaimed && inviteExpiresAt < now;

    let status: string;
    if (hasLoggedIn) status = "Active";
    else if (inviteExpired) status = "Expired";
    else if (inviteSentAt) status = "Pending";
    else status = "No Invite Sent";

    const fmt = (d: Date | null) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

    return {
      name: u.name,
      email: u.email,
      role: u.role,
      status,
      mfaEnabled: u.mfaEnabled,
      inviteSent: fmt(inviteSentAt),
      inviteExpires: fmt(inviteExpiresAt),
      inviteClaimed,
    };
  });

  // Print as a table
  console.log("\n=== USER STATUS REPORT ===\n");
  const pad = (s: string | null | undefined, n: number) => (s ?? "").padEnd(n);
  console.log(
    pad("Name", 22) +
    pad("Email", 32) +
    pad("Role", 16) +
    pad("Status", 12) +
    pad("MFA", 6) +
    pad("Invite Sent", 14) +
    "Invite Expires"
  );
  console.log("-".repeat(115));
  for (const r of result) {
    console.log(
      pad(r.name, 22) +
      pad(r.email, 32) +
      pad(r.role, 16) +
      pad(r.status, 12) +
      pad(r.mfaEnabled ? "Yes" : "No", 6) +
      pad(r.inviteSent, 14) +
      (r.inviteExpires ?? "")
    );
  }
  console.log();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
