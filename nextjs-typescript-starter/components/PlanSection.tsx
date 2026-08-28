'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PlanCard from './PlanCard';

type PlanBook = {
  bookId: string;
  title: string;
  wordCount: number;
  currentWordIndex: number;
  updatedAt: string | null;
};

export default function PlanSection() {
  const { status } = useSession();
  const [plan, setPlan] = useState<PlanBook[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/plan')
        .then((r) => r.json())
        .then((data) => setPlan(data))
        .catch(() => {});
    }
  }, [status, refreshKey]);

  // 监听计划变更事件，自动刷新
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener('planchange', handler);
    return () => window.removeEventListener('planchange', handler);
  }, []);

  if (status !== 'authenticated') return null;

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-leaf" />
        <h2 className="section-title">我的学习计划</h2>
        {plan.length > 0 && (
          <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-xs font-bold text-leaf-dark">
            {plan.length} 本
          </span>
        )}
      </div>

      {plan.length === 0 ? (
        <div className="card mt-3 flex flex-col items-center py-10 text-center">
          <span className="text-3xl">📋</span>
          <p className="mt-3 text-sm font-medium text-ink/50">还没有加入任何单词书</p>
          <p className="mt-1 text-xs text-ink/35">从下方选择单词书加入学习计划</p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {plan.map((book) => (
            <li key={book.bookId} className="animate-pop-in">
              <PlanCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}