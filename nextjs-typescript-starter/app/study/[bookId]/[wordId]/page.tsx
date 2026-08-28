import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookById, getWordById } from 'app/db';
import WordDetail from '@/components/WordDetail';

export const dynamic = 'force-dynamic';

export default async function WordDetailPage({
  params,
  searchParams,
}: {
  params: { bookId: string; wordId: string };
  searchParams: { start?: string };
}) {
  const wordId = Number(params.wordId);
  const [book, word] = await Promise.all([
    getBookById(params.bookId),
    Number.isInteger(wordId) ? getWordById(wordId) : Promise.resolve(null),
  ]);

  if (!book || !word || word.bookId !== params.bookId) notFound();

  const start = Number(searchParams?.start);
  const backUrl = Number.isInteger(start) && start >= 0
    ? `/study/${params.bookId}?start=${start}`
    : `/study/${params.bookId}`;

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href={backUrl} aria-label="返回学习" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/70 shadow-card transition-transform active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div>
          <p className="text-xs font-semibold text-ink/45">{book.title}</p>
          <h1 className="text-lg font-extrabold text-ink">单词详情</h1>
        </div>
      </div>
      <WordDetail word={word} />
      <Link href={backUrl} className="btn-primary mb-4 flex w-full items-center justify-center">返回学习</Link>
    </div>
  );
}
