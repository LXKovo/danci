'use client';

import { useAuth } from '@/components/auth-context';

export default function LoginPrompt() {
  const { openAuth } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl animate-float">🍪</span>
      <p className="mt-4 text-base font-bold text-ink">还没有登录</p>
      <p className="mt-1 text-sm text-ink/50">登录后就能同步学习进度啦</p>
      <button
        type="button"
        onClick={() => openAuth('/mine')}
        className="btn-primary mt-6 w-full max-w-[200px]"
      >
        登录 / 注册
      </button>
    </div>
  );
}