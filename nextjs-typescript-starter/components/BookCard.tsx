'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from './auth-context';

type Book = {
  bookId: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
};

// 依据书名生成稳定的封面渐变，让每本单词书有自己的色彩
const PALETTES = [
  'from-brand to-brand-light',
  'from-leaf to-emerald-300',
  'from-sun to-orange-300',
  'from-indigo-400 to-sky-300',
  'from-pink-400 to-brand-light',
];

function hashTitle(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h;
}

function BookCoverFallback({ title, badge }: { title: string; badge: string }) {
  const gradient = PALETTES[hashTitle(title) % PALETTES.length];
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl font-extrabold text-white ${gradient}`}
    >
      <span className="drop-shadow-sm">{badge}</span>
    </div>
  );
}

export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const { status } = useSession();
  const { openAuth } = useAuth();

  const handleClick = () => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      router.push(`/study/${book.bookId}`);
    } else {
      // 未登录：记住目标 → 切到「我的」Tab → 弹出登录/注册弹窗
      openAuth(`/study/${book.bookId}`);
      router.push('/mine');
    }
  };

  const firstChar = book.title.slice(0, 1);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="card group flex w-full items-center gap-4 p-3 text-left transition-transform duration-200 hover:-translate-y-0.5 active:scale-[.98]"
    >
      {/* 封面 */}
      <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl shadow-card">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <BookCoverFallback title={book.title} badge={firstChar} />
        )}
      </div>

      {/* 书名 + 词数 */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-ink">
          {book.title}
        </h3>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-bold text-leaf-dark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z" />
            <path d="M4 19.5A2 2 0 0 1 6 17.5" />
          </svg>
          {book.wordCount} 词
        </span>
      </div>

      {/* 进入箭头 */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/40 transition-colors group-active:bg-brand group-active:text-white">
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