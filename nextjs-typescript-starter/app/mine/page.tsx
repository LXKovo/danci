import { auth } from 'app/auth';
import { getAllProgress } from 'app/db';
import ProgressBar from '@/components/ProgressBar';
import LoginPrompt from '@/components/LoginPrompt';
import LogoutButton from './logout-button';

export const dynamic = 'force-dynamic';

export default async function MinePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return <LoginPrompt />;
  }

  const userId = Number((user as any).id);
  const progress = await getAllProgress(userId);
  const email = user.email ?? '';

  // 头像字母：取邮箱首字母大写
  const initial = email.trim().charAt(0).toUpperCase() || '友';
  const studied = progress.reduce((acc, p) => acc + (p.currentWordIndex > 0 ? 1 : 0), 0);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">我的</h1>

      {/* 用户信息卡 */}
      <section className="card mt-4 flex items-center gap-4 p-5 animate-pop-in">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-2xl font-extrabold text-white shadow-floaty">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-ink">{email}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50">
            <span className="inline-block h-2 w-2 rounded-full bg-leaf" />
            {studied > 0 ? `已开始学习 ${studied} 本单词书` : '还没有学习记录'}
          </p>
        </div>
      </section>

      {/* 学习进度 */}
      <section className="mt-7">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-brand" />
          <h2 className="section-title">学习进度</h2>
        </div>

        {progress.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center py-12 text-center">
            <span className="text-4xl animate-float">📖</span>
            <p className="mt-3 text-sm font-medium text-ink/50">
              还没有学习进度
            </p>
            <p className="mt-1 text-xs text-ink/35">去首页选一本单词书开始吧～</p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {progress.map((p) => (
              <li key={p.bookId} className="card flex items-center gap-4 p-4 animate-pop-in">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xl">
                  📘
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {p.bookTitle ?? '我的单词书'}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    已学 {p.currentWordIndex}/{p.wordCount ?? 0} 词
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={p.currentWordIndex} max={p.wordCount ?? 0} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 退出登录 */}
      <div className="mt-8 pb-2">
        <LogoutButton />
      </div>
    </div>
  );
}