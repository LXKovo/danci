import { hash } from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";

import { updateAdminSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  const parsed = updateAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { id } = await params;
  const email = parsed.data.email.toLowerCase();

  const duplicate = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, id)))
    .limit(1);
  if (duplicate.length > 0) return errorResponse("该邮箱已存在", 409);

  const [target] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) return errorResponse("管理员不存在", 404);

  if (target.role === "system-admin" && parsed.data.role === "admin") {
    const [result] = await db
      .select({ value: count() })
      .from(adminUsers)
      .where(eq(adminUsers.role, "system-admin"));
    if (result.value <= 1) return errorResponse("必须保留至少一个系统管理员", 409);
  }

  const values: Partial<typeof adminUsers.$inferInsert> = {
    name: parsed.data.name,
    email,
    role: parsed.data.role,
    updatedAt: new Date(),
  };
  if (parsed.data.password) values.passwordHash = await hash(parsed.data.password, 12);

  const [admin] = await db
    .update(adminUsers)
    .set(values)
    .where(eq(adminUsers.id, id))
    .returning({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    });

  return Response.json({ admin });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  const { id } = await params;
  if (id === current.id) return errorResponse("不能删除当前登录账号", 409);

  const [target] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) return errorResponse("管理员不存在", 404);

  if (target.role === "system-admin") {
    const [result] = await db
      .select({ value: count() })
      .from(adminUsers)
      .where(eq(adminUsers.role, "system-admin"));
    if (result.value <= 1) return errorResponse("必须保留至少一个系统管理员", 409);
  }

  await db.transaction(async (tx) => {
    await tx.delete(adminSessions).where(eq(adminSessions.adminId, id));
    await tx.delete(adminUsers).where(eq(adminUsers.id, id));
  });

  return Response.json({ ok: true });
}
