import { errorResponse } from "@/lib/api-response";
import { deleteAdminSession, isSameOrigin } from "@/lib/auth-server";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  await deleteAdminSession();
  return Response.json({ ok: true });
}
