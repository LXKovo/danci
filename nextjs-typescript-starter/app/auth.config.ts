import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  // 登录/注册改为页面内 AuthPopup 弹窗，不再使用独立 /login /register 路由
  // 未登录访问受保护路由时重定向到「我的」页（附 callbackUrl），由前端自动弹出登录框
  pages: {
    signIn: '/mine',
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      // /study 学习页需要登录
      if (pathname.startsWith('/study')) {
        return !!auth?.user;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;