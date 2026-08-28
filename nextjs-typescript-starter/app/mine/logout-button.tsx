'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand/25 bg-white text-base font-semibold text-brand-dark transition-all duration-200 active:scale-[.97]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      退出登录
    </button>
  );
}