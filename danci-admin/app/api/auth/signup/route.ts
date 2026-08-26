import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";

import { signUpSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { createAdminSession, isSameOrigin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);

  const parsed = signUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hash(parsed.data.password, 12);

  const admin = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(734921)`);
    const existing = await tx.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) return null;

    const [created] = await tx
      .insert(adminUsers)
      .values({
        name: parsed.data.name,
        email,
        passwordHash,
        role: "system-admin",
      })
      .returning({ id: adminUsers.id });
    return created;
  });

  if (!admin) return errorResponse("系统管理员已存在，请直接登录", 409);

  await createAdminSession(admin.id);
  return Response.json({ ok: true }, { status: 201 });
}
