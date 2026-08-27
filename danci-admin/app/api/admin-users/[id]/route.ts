import { hash } from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm"; // ne = not equal（不等于）

import { updateAdminSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";

// 动态路由上下文：Next.js 把 URL 里的 [id] 段传进来（异步 Promise）
interface RouteContext {
  params: Promise<{ id: string }>;
}

// ===== 更新指定管理员 =====
export async function PATCH(request: Request, { params }: RouteContext) {
  // 三层防护：同源 → 登录 → 超管权限
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  // zod 校验请求体
  const parsed = updateAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { id } = await params; // 取出要更新的管理员 id
  const email = parsed.data.email.toLowerCase();

  // 邮箱查重：排除自己（ne(id)），别的管理员占了该邮箱才报冲突
  const duplicate = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, id)))
    .limit(1);
  if (duplicate.length > 0) return errorResponse("该邮箱已存在", 409);

  // 确认目标管理员存在
  const [target] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) return errorResponse("管理员不存在", 404);

  // 防呆：如果把「唯一的一个超管」降级为普通管理员，系统将失去管理者
  // → 先数一下超管人数，<=1 时禁止降级
  if (target.role === "system-admin" && parsed.data.role === "admin") {
    const [result] = await db
      .select({ value: count() })
      .from(adminUsers)
      .where(eq(adminUsers.role, "system-admin"));
    if (result.value <= 1) return errorResponse("必须保留至少一个系统管理员", 409);
  }

  // 拼出要更新的字段。密码留空则不改密码
  const values: Partial<typeof adminUsers.$inferInsert> = {
    name: parsed.data.name,
    email,
    role: parsed.data.role,
    updatedAt: new Date(), // 手动刷新更新时间
  };
  if (parsed.data.password) values.passwordHash = await hash(parsed.data.password, 12);

  // 执行更新并返回更新后的完整记录
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

// ===== 删除指定管理员 =====
export async function DELETE(request: Request, { params }: RouteContext) {
  // 三层防护
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  const { id } = await params;
  // 不允许删除自己（否则把自己删了就没法管理了）
  if (id === current.id) return errorResponse("不能删除当前登录账号", 409);

  // 确认目标存在
  const [target] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  if (!target) return errorResponse("管理员不存在", 404);

  // 与 PATCH 同理：不允许删掉唯一一个超管
  if (target.role === "system-admin") {
    const [result] = await db
      .select({ value: count() })
      .from(adminUsers)
      .where(eq(adminUsers.role, "system-admin"));
    if (result.value <= 1) return errorResponse("必须保留至少一个系统管理员", 409);
  }

  // 事务：先删这个人的所有会话（外键 cascade 其实也会兜底），再删本人
  // 放一个事务里保证两步要么都成功、要么都不执行
  await db.transaction(async (tx) => {
    await tx.delete(adminSessions).where(eq(adminSessions.adminId, id));
    await tx.delete(adminUsers).where(eq(adminUsers.id, id));
  });

  return Response.json({ ok: true });
}
