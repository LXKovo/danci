import { hash } from "bcryptjs";
import { asc, eq } from "drizzle-orm";

import { createAdminSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function GET() {
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

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

  return Response.json({ admins, currentId: current.id });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  const current = await getCurrentAdmin();
  if (!current) return errorResponse("请先登录", 401);
  if (!isSystemAdmin(current)) return errorResponse("无权管理系统管理员", 403);

  const parsed = createAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const email = parsed.data.email.toLowerCase();
  const duplicate = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  if (duplicate.length > 0) return errorResponse("该邮箱已存在", 409);

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
