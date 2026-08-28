'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/',
    label: '首页',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-5V14h-5v7.5H4.5A1.5 1.5 0 0 1 3 20V9.5Z" />
      </svg>
    ),
  },
  {
    href: '/mine',
    label: '我的',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="底部导航"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-4">
        <div className="flex h-16 items-stretch justify-around rounded-full border border-white/60 bg-white/90 px-3 shadow-card backdrop-blur-md">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200 ${
                  active ? 'text-white' : 'text-ink/45 hover:text-ink/70'
                }`}
              >
                {active && (
                  <span className="absolute inset-1 rounded-2xl bg-brand shadow-floaty transition-all duration-200" />
                )}
                <span className="relative h-6 w-6">{tab.icon}</span>
                <span className="relative text-xs font-semibold">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}