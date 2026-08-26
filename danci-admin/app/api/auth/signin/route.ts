import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { signInSchema } from "@/lib/admin-validation";
import { errorResponse, validationError } from "@/lib/api-response";
import { createAdminSession, isSameOrigin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);

  const parsed = signInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const [admin] = await db
    .select({ id: adminUsers.id, passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (!admin || !(await compare(parsed.data.password, admin.passwordHash))) {
    return errorResponse("邮箱或密码不正确", 401);
  }

  await createAdminSession(admin.id);
  return Response.json({ ok: true });
}
