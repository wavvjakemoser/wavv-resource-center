import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

const SALT_ROUNDS = 12;
const SESSION_DURATION = "7d";
const JWT_ALG = "HS256";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: number;
  email: string;
  role: "user" | "admin" | "super_admin";
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as "user" | "admin" | "super_admin",
    };
  } catch {
    return null;
  }
}
