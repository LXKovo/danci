import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function validationError(error: ZodError) {
  return errorResponse(error.issues[0]?.message ?? "请求参数不正确", 400);
}
