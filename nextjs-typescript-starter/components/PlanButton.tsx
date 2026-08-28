'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from './auth-context';
import { useState, useCallback } from 'react';

type Props = {
  bookId: string;
  inPlan: boolean;
  onToggle?: () => void;
};

export default function PlanButton({ bookId, inPlan, onToggle }: Props) {
  const { status } = useSession();
  const { openAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isInPlan, setIsInPlan] = useState(inPlan);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        openAuth('/');
        return;
      }

      setLoading(true);
      try {
        if (isInPlan) {
          const res = await fetch(`/api/plan?bookId=${encodeURIComponent(bookId)}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            setIsInPlan(false);
            window.dispatchEvent(new Event('planchange'));
          }
        } else {
          const res = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId }),
          });
          if (res.ok) {
            setIsInPlan(true);
            window.dispatchEvent(new Event('planchange'));
          }
        }
        onToggle?.();
      } finally {
        setLoading(false);
      }
    },
    [status, openAuth, bookId, isInPlan, onToggle],
  );

  if (isInPlan) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-bold text-brand transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
      >
        {loading ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            已加入
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/50 transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/30 border-t-transparent" />
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          加入学习
        </>
      )}
    </button>
  );
}