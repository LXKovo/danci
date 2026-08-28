'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from './auth-context';

type Mode = 'login' | 'register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthForm({
  mode,
  onSwitchMode,
}: {
  mode: Mode;
  onSwitchMode: (mode: Mode) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { closeAuth, redirectTo } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || '注册失败，请稍后重试');
          return;
        }
      }

      // 登录（注册成功后自动登录）
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(
          mode === 'register' ? '注册成功，请使用账号密码登录' : '邮箱或密码错误',
        );
        return;
      }

      closeAuth();
      router.push(redirectTo || '/');
      router.refresh(); // 刷新服务端组件，更新登录态
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink/60">
          邮箱
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="请输入邮箱"
          autoComplete="email"
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink/60">
          密码
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="至少 6 位"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          className="input"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-brand-soft px-3 py-2 text-xs font-medium text-brand-dark"
        >
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary mt-1">
        {loading ? '请稍候…' : mode === 'login' ? '登录' : '注册，开始学单词'}
      </button>
      <ToggleLink mode={mode} onSwitchMode={onSwitchMode} />
    </form>
  );
}

function ToggleLink({
  mode,
  onSwitchMode,
}: {
  mode: Mode;
  onSwitchMode: (mode: Mode) => void;
}) {
  return mode === 'login' ? (
    <p className="mt-2 text-center text-xs text-ink/50">
      还没有账号？
      <button
        type="button"
        onClick={() => onSwitchMode('register')}
        className="ml-1 font-semibold text-brand hover:underline"
      >
        去注册
      </button>
    </p>
  ) : (
    <p className="mt-2 text-center text-xs text-ink/50">
      已有账号？
      <button
        type="button"
        onClick={() => onSwitchMode('login')}
        className="ml-1 font-semibold text-brand hover:underline"
      >
        去登录
      </button>
    </p>
  );
}

export default function AuthPopup() {
  const { closeAuth } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? '登录' : '注册'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={closeAuth}
    >
      <div
        className="card w-full max-w-sm overflow-hidden p-0 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部品牌区 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-light px-6 pb-8 pt-7 text-white">
          <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20" />
          <span className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-2xl shadow-card animate-bounce-soft">
              📖
            </span>
            <h2 className="mt-3 text-lg font-extrabold">
              {mode === 'login' ? '欢迎回来' : '开始学单词啦'}
            </h2>
            <p className="mt-1 text-xs text-white/85">
              {mode === 'login'
                ? '登录后即可继续学习进度'
                : '注册账号，同步你的学习进度'}
            </p>
          </div>
        </div>

        <div className="p-6 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex rounded-full bg-ink/5 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  mode === 'login' ? 'bg-white shadow-card text-brand' : 'text-ink/50'
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  mode === 'register' ? 'bg-white shadow-card text-brand' : 'text-ink/50'
                }`}
              >
                注册
              </button>
            </div>
            <button
              type="button"
              onClick={closeAuth}
              aria-label="关闭"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <AuthForm mode={mode} onSwitchMode={setMode} />
        </div>
      </div>
    </div>
  );
}