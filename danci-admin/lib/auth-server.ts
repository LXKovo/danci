// 这行声明本模块只允许服务端引用。
// 防止不小心在客户端组件里 import 它，把 cookie/session 逻辑暴露到浏览器。
import "server-only";

import { createHash, randomBytes } from "node:crypto"; // Node 内置加密工具
import { cookies } from "next/headers"; // 读取/设置 HTTP cookie
import { and, eq, gt } from "drizzle-orm"; // drizzle 查询操作符：and=且, eq=等于, gt=大于

import { db } from "@/lib/db";
import { adminSessions, adminUsers, type AdminRole } from "@/lib/db/schema";

// 登录后写入浏览器 cookie 的名字
const SESSION_COOKIE = "danci_admin_session";
// 会话最长存活 7 天（过期时间 = 登录时刻 + 7 天）
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// 当前登录管理员的「安全视图」：只暴露必要字段，不含密码哈希
export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// 把登录时生成的随机 token 哈希成固定长度字符串。
// 数据库里只存哈希不存原文：就算数据库泄露，攻击者也伪造不了会话。
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// ===== 验证登录态（每个受保护请求都会调用）=====
// 流程：1. 从 cookie 拿 token → 2. 哈希后去 adminSessions 表查 →
//       3. 确认存在且未过期，JOIN 出管理员资料。
// 查不到就返回 null，调用方据此返回 401/403。
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null; // 没带 cookie 直接视为未登录

  const [row] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id)) // 会话表 JOIN 用户表，取用户资料
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)), // token 哈希匹配
        gt(adminSessions.expiresAt, new Date())        // 还没过期
      )
    )
    .limit(1);

  return row ?? null;
}

// ===== 创建会话（登录/注册成功后调用）=====
// 1. 生成一串 32 字节的随机 token（不可预测，攻击者无法伪造）
// 2. 往 adminSessions 表插一行：token 哈希 + 管理员 id + 7 天后过期
// 3. 把原始 token 写进浏览器 cookie（httpOnly：JS 读不到，防 XSS 偷取）
export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.insert(adminSessions).values({
    tokenHash: hashToken(token),
    adminId,
    expiresAt,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,                // 只允许 HTTP 传输，浏览器 JS 无法读取
    sameSite: "lax",               // 阻止跨站请求自动带上 cookie（CSRF 防护）
    secure: process.env.NODE_ENV === "production", // 生产环境只走 HTTPS
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires: expiresAt,
  });
}

// ===== 删除会话（登出时调用）=====
// 删掉表里那行 + 清掉浏览器 cookie → 立刻失效。
// 这就是服务端 session 对比 JWT 的优势：能立刻踢人下线。
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

// 判断是否为超管（system-admin）。用于「管理管理员」类接口的权限控制
export function isSystemAdmin(admin: CurrentAdmin | null) {
  return admin?.role === "system-admin";
}

// CSRF 防护：校验请求的 Origin 与自身地址同源。
// 跨站伪造的请求 Origin 不一致，直接拒绝。
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
