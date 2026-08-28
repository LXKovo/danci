import { NextResponse } from 'next/server';
import { createUser, getUser } from 'app/db';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: '密码至少需要 6 位' }, { status: 400 });
  }

  // 查重
  const existing = await getUser(email);
  if (existing.length > 0) {
    return NextResponse.json({ error: '该邮箱已注册，请直接登录' }, { status: 409 });
  }

  // 创建用户（bcrypt 哈希），登录由前端 signIn 完成
  await createUser(email, password);
  return NextResponse.json({ ok: true });
}
