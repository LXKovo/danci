import { hash } from "bcryptjs"; // 密码哈希（自动加盐，cost 越高越难破解）
import { sql } from "drizzle-orm"; // 允许在 drizzle 里写原生 SQL 片段

import { signUpSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { createAdminSession, isSameOrigin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

// 注册系统管理员（整个系统只有一个超管，所以必须防并发重复创建）
export async function POST(request: Request) {
  // ① 跨站请求防护：Origin 不一致直接拒绝
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);

  // ② zod 校验请求体。用 safeParse（不抛异常），用 success 判断是否通过
  const parsed = signUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const email = parsed.data.email.toLowerCase(); // 邮箱统一转小写，避免大小写不同导致重复注册
  // ③ bcrypt 加密密码（cost=12 表示加密强度）。数据库只存密文，绝不存明文
  const passwordHash = await hash(parsed.data.password, 12);

  // ④ 事务 + 咨询锁：保证「只有一个超管」在并发情况下也不会被突破
  const admin = await db.transaction(async (tx) => {
    // 取一把咨询锁：同一时刻只允许一个请求执行到这里，其余排队
    await tx.execute(sql`select pg_advisory_xact_lock(734921)`);
    // 锁住后查一下超管是否已存在
    const existing = await tx.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) return null; // 已存在则放弃创建

    // 不存在才插入，.returning() 返回创建后的完整记录
    const [created] = await tx
      .insert(adminUsers)
      .values({
        name: parsed.data.name,
        email,
        passwordHash,
        role: "system-admin", // 第一个注册的必然是超管
      })
      .returning({ id: adminUsers.id });
    return created;
  });

  // 超管已存在 → 返回 409 冲突
  if (!admin) return errorResponse("系统管理员已存在，请直接登录", 409);

  // ⑤ 注册成功直接登录：创建会话并写入 cookie
  await createAdminSession(admin.id);
  return Response.json({ ok: true }, { status: 201 }); // 201 = 资源创建成功
}
