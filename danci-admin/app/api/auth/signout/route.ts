import { errorResponse } from "@/lib/api-response";
import { deleteAdminSession, isSameOrigin } from "@/lib/auth-server";

// 登出接口：核心逻辑就一句 —— 删掉数据库里的会话行 + 清掉 cookie。
// 服务端 session 的好处体现于此：登出是「立刻失效」，不用等 token 过期。
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
  await deleteAdminSession();
  return Response.json({ ok: true });
}
