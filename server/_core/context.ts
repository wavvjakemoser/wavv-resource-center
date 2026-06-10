import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { verifySessionToken } from "../nativeAuth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  mfaPending: boolean;
};

async function getSessionFromRequest(req: CreateExpressContextOptions["req"]): Promise<{ user: User | null; mfaPending: boolean }> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return { user: null, mfaPending: false };

    const cookies = parseCookieHeader(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    if (!sessionCookie) return { user: null, mfaPending: false };

    const session = await verifySessionToken(sessionCookie);
    if (!session) return { user: null, mfaPending: false };

    const db = await getDb();
    if (!db) return { user: null, mfaPending: false };

    const result = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const user = result[0];
    if (!user || !user.isActive) return { user: null, mfaPending: false };

    return { user, mfaPending: session.mfaPending === true };
  } catch {
    return { user: null, mfaPending: false };
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const { user, mfaPending } = await getSessionFromRequest(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    mfaPending,
  };
}
