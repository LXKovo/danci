import { NextResponse } from 'next/server';
import { auth } from 'app/auth';
import { getBookById, getProgress, upsertProgress, getWordById } from 'app/db';

export const runtime = 'nodejs';

async function getUserId() {
  const session = await auth();
  return session?.user && (session.user as any).id != null
    ? Number((session.user as any).id)
    : null;
}

// 单本书进度（需登录）
export async function GET(request: Request) {
  const userId = await getUserId();
  if (userId == null) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  if (!bookId) {
    return NextResponse.json({ error: '缺少 bookId' }, { status: 400 });
  }

  const progress = await getProgress(userId, bookId);
  return NextResponse.json({ currentWordIndex: progress?.currentWordIndex ?? 0 });
}

async function upsert(request: Request) {
  const userId = await getUserId();
  if (userId == null) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  let body: { bookId?: string; currentWordIndex?: number; wordId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { bookId, currentWordIndex, wordId } = body;
  if (
    !bookId ||
    typeof currentWordIndex !== 'number' ||
    !Number.isInteger(currentWordIndex) ||
    currentWordIndex < 0
  ) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  const book = await getBookById(bookId);
  if (!book || currentWordIndex >= book.wordCount) {
    return NextResponse.json({ error: '进度超出单词范围' }, { status: 400 });
  }

  if (wordId != null) {
    if (!Number.isInteger(wordId)) {
      return NextResponse.json({ error: 'wordId 参数错误' }, { status: 400 });
    }
    const word = await getWordById(wordId);
    if (!word || word.bookId !== bookId) {
      return NextResponse.json({ error: '单词不属于该单词书' }, { status: 400 });
    }
  }

  await upsertProgress(userId, bookId, currentWordIndex, wordId);
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  return upsert(request);
}

// 兼容 sendBeacon（仅支持 POST）以外的 PUT 调用
export async function PUT(request: Request) {
  return upsert(request);
}
