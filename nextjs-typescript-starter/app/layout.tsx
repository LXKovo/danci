import './globals.css';

import { GeistSans } from 'geist/font/sans';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
