import { hash } from "bcryptjs";
import { asc, eq } from "drizzle-orm"; // asc = 升序排列

import { createAdminSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

// 管理员列表（只有超管能看）
export async function GET() {
  // ① 先确认登录了（没登录 → 401）
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  // ② 再确认是超管（普通管理员 → 403）
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  // ③ 查出所有管理员，按创建时间升序
  const admins = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  // 返回列表 + 当前登录者 id（前端用来禁用「对自己操作」的按钮，如删除自己）
  return Response.json({ admins, currentId: current.id });
}

// 超管创建新管理员
export async function POST(request: Request) {
  // 三层防护依次把关：同源 → 登录 → 超管权限
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  // zod 校验请求体
  const parsed = createAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const email = parsed.data.email.toLowerCase();
  // 邮箱查重：已存在则 409，防止创建重复账号
  const duplicate = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  if (duplicate.length > 0) return errorResponse("该邮箱已存在", 409);

  // 插入新管理员（密码 bcrypt 加密后入库，返回创建后的完整记录）
  const [admin] = await db
    .insert(adminUsers)
    .values({
      name: parsed.data.name,
      email,
      passwordHash: await hash(parsed.data.password, 12),
      role: parsed.data.role,
    })
    .returning({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    });

  return Response.json({ admin }, { status: 201 });
}
