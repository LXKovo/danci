'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from './auth-context';

type PlanBook = {
  bookId: string;
  title: string;
  wordCount: number;
  currentWordIndex: number;
  updatedAt: string | null;
};

export default function PlanCard({ book }: { book: PlanBook }) {
  const router = useRouter();
  const { status } = useSession();
  const { openAuth } = useAuth();

  const pct = book.wordCount
    ? Math.min(100, Math.round((Math.min(book.currentWordIndex + 1, book.wordCount) / book.wordCount) * 100))
    : 0;

  const handleStart = () => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      router.push(`/study/${book.bookId}?start=${book.currentWordIndex}`);
    } else {
      openAuth(`/study/${book.bookId}`);
      router.push('/mine');
    }
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      className="card group relative flex w-full items-center gap-4 p-4 text-left transition-transform duration-200 hover:-translate-y-0.5 active:scale-[.98]"
    >
      {/* 进度指示环 */}
      <div className="relative h-12 w-12 shrink-0">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-ink/10"
          />
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - pct / 100)}
            strokeLinecap="round"
            className="text-brand transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand">
          {pct}%
        </span>
      </div>

      {/* 书名 + 词数 */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-ink">{book.title}</h3>
        <p className="mt-0.5 text-xs text-ink/50">
          已学 {book.currentWordIndex}/{book.wordCount} 词
        </p>

        {/* 进度条 */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-sun transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 继续学习箭头 */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}