'use client';

import TabBar from './TabBar';

export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-50">
      <main className="flex flex-1 flex-col pb-24">{children}</main>
      <TabBar />
    </div>
  );
}
