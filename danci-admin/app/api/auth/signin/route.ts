import { compare } from "bcryptjs"; // bcrypt 比对：验证「用户输入的密码」和「库里哈希」是否匹配
import { eq } from "drizzle-orm";

import { signInSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { createAdminSession, isSameOrigin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

// 登录接口
export async function POST(request: Request) {
  // ① CSRF 防护：Origin 不一致直接拒绝
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);

  // ② zod 校验请求体
  const parsed = signInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  // ③ 按邮箱查用户（只取 id 和密码哈希两个字段，够用就行）
  const [admin] = await db
    .select({ id: adminUsers.id, passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email.toLowerCase()))
    .limit(1);

  // ④ 用户不存在 或 密码比对失败，返回同一个错误信息
  //    不区分「邮箱不存在」和「密码错误」，防止攻击者探测哪些邮箱注册过
  if (!admin || !(await compare(parsed.data.password, admin.passwordHash))) {
    return errorResponse("邮箱或密码不正确", 401);
  }

  // ⑤ 验证通过 → 创建会话（往 adminSessions 插一行 + 写 cookie）
  await createAdminSession(admin.id);
  return Response.json({ ok: true });
}
