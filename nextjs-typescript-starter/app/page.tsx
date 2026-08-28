import Link from 'next/link';
import { getBooks, getAllProgress } from 'app/db';
import { auth } from 'app/auth';
import BookCard from '@/components/BookCard';

// 每次请求实时查询，避免构建时静态化访问数据库
export const dynamic = 'force-dynamic';

type RecentBook = {
  bookId: string;
  currentWordIndex: number;
  wordCount: number;
  bookTitle: string;
  updatedAt: Date | null;
};

function RecentCard({ item }: { item: RecentBook }) {
  const { currentWordIndex: idx, wordCount, bookTitle, bookId } = item;
  const pct = wordCount ? Math.min(100, Math.round((Math.min(idx + 1, wordCount) / wordCount) * 100)) : 0;

  return (
    <Link
      href={`/study/${bookId}?start=${idx}`}
      className="card group relative block overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-sun/30 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-ink/50">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-lg">
            🔥
          </span>
          最近学习
        </div>
        <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-bold text-leaf-dark">
          继续学习 →
        </span>
      </div>

      <h3 className="relative mt-3 truncate text-[17px] font-extrabold text-ink">
        {bookTitle}
      </h3>
      <p className="relative mt-1 text-xs text-ink/50">
        已学 {idx}/{wordCount} 词
      </p>

      <div className="relative mt-4 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-sun transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-ink/60">{pct}%</span>
      </div>
    </Link>
  );
}

export default async function Page() {
  const [books, session] = await Promise.all([getBooks(), auth()]);

  // 登录用户：取最近学习（按最近更新排序取第一条）
  let recent: RecentBook | null = null;
  const token = session?.user && (session.user as any).id;
  if (token != null) {
    const all = await getAllProgress(Number(token));
    const list = all
      .filter((p) => p.currentWordIndex > 0)
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
      );
    if (list.length > 0) {
      const top = list[0];
      recent = {
        bookId: top.bookId,
        currentWordIndex: top.currentWordIndex,
        wordCount: top.wordCount ?? 0,
        bookTitle: top.bookTitle ?? '我的单词书',
        updatedAt: top.updatedAt,
      };
    }
  }

  return (
    <div className="px-4 pt-6">
      {/* 顶部品牌区 */}
      <header className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-2xl shadow-floaty animate-bounce-soft">
          📚
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            阳光单词屋
          </h1>
          <p className="text-xs text-ink/50">每天进步一点点，认识更多单词</p>
        </div>
      </header>

      {/* 最近学习（登录且有进度才显示） */}
      {recent && (
        <section className="mt-6 animate-pop-in">
          <RecentCard item={recent} />
        </section>
      )}

      {/* 单词书列表 */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-brand" />
          <h2 className="section-title">单词书</h2>
        </div>

        {books.length === 0 ? (
          // 空状态占位
          <div className="card mt-4 flex flex-col items-center py-14 text-center">
            <span className="text-4xl animate-float">🗂️</span>
            <p className="mt-3 text-sm font-medium text-ink/50">
              还没有单词书
            </p>
            <p className="mt-1 text-xs text-ink/35">
              管理员正在努力准备中，请稍后再来～
            </p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {books.map((book) => (
              <li key={book.bookId} className="animate-pop-in">
                <BookCard
                  book={{
                    bookId: book.bookId,
                    title: book.title,
                    wordCount: book.wordCount,
                    coverUrl: book.coverUrl,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}