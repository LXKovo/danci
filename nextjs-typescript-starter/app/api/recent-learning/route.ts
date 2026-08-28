import { NextResponse } from 'next/server';
import { auth } from 'app/auth';
import { getAllProgress } from 'app/db';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  const userId = session?.user && (session.user as any).id != null
    ? Number((session.user as any).id)
    : null;

  if (userId == null) {
    return NextResponse.json({ recent: null });
  }

  const recent = (await getAllProgress(userId))
    .filter((item) => item.currentWordIndex > 0)
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0] ?? null;

  return NextResponse.json({ recent });
}
