import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminSessions, adminUsers, type AdminRole } from "@/lib/db/schema";

const SESSION_COOKIE = "danci_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        gt(adminSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return row ?? null;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.insert(adminSessions).values({
    tokenHash: hashToken(token),
    adminId,
    expiresAt,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires: expiresAt,
  });
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function isSystemAdmin(admin: CurrentAdmin | null) {
  return admin?.role === "system-admin";
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
