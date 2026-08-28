import { auth } from 'app/auth';
import Link from 'next/link';
import { getBookById, getWordsByBook, getProgress } from 'app/db';
import WordCard from '@/components/WordCard';

export const dynamic = 'force-dynamic';

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: { bookId: string };
  searchParams: { start?: string };
}) {
  const { bookId } = params;
  const [book, session] = await Promise.all([getBookById(bookId), auth()]);

  if (!book) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-ink/50">单词书不存在</p>
      </div>
    );
  }

  // 整本书一次性加载到客户端，翻页本地切换
  const words = await getWordsByBook(bookId, 0, 100000);

  // 初始索引：优先 ?start=，其次取上次学习进度
  let initialIndex = 0;
  const start = Number(searchParams?.start);
  if (!Number.isNaN(start) && start >= 0) {
    initialIndex = start;
  } else if (session?.user && (session.user as any).id != null) {
    const progress = await getProgress(Number((session.user as any).id), bookId);
    if (progress) initialIndex = progress.currentWordIndex;
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="返回首页"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/70 shadow-card transition-transform active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold tracking-tight text-ink">
            {book.title}
          </h1>
          <p className="text-xs text-ink/45">跟我一起读单词吧～</p>
        </div>
      </div>
      <WordCard bookId={bookId} words={words} initialIndex={initialIndex} />
    </div>
  );
}
