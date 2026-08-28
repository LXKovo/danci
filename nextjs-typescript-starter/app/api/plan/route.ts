import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'app/auth';
import { addBookToPlan, removeBookFromPlan, getUserPlanBooks } from 'app/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (userId == null) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const plan = await getUserPlanBooks(Number(userId));
  return NextResponse.json(plan);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (userId == null) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { bookId } = await req.json();
  if (!bookId || typeof bookId !== 'string') {
    return NextResponse.json({ error: '缺少 bookId' }, { status: 400 });
  }

  await addBookToPlan(Number(userId), bookId);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (userId == null) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const bookId = req.nextUrl.searchParams.get('bookId');
  if (!bookId) {
    return NextResponse.json({ error: '缺少 bookId' }, { status: 400 });
  }

  await removeBookFromPlan(Number(userId), bookId);
  return NextResponse.json({ success: true });
}