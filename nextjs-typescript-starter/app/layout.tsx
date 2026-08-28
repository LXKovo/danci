import './globals.css';

import { GeistSans } from 'geist/font/sans';
import TabLayout from '@/components/TabLayout';
import { AuthProvider } from '@/components/auth-context';
import { auth } from 'app/auth';

let title = '英语单词学习';
let description = '小学生英语单词学习 H5 应用';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body className={`${GeistSans.variable} app-shell`}>
        <AuthProvider session={session}>
          <TabLayout>{children}</TabLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
