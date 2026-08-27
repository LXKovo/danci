import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// 统一错误响应格式：{ error: 消息 } + HTTP 状态码。
// 全项目错误都走这里，保证格式一致，前端好统一处理。
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// zod 校验失败的统一出口：取第一条错误信息，返回 400。
// 调用方只需把 zod 的 error 传进来，不用关心细节。
export function validationError(error: ZodError) {
  return errorResponse(error.issues[0]?.message ?? "请求参数不正确", 400);
}
