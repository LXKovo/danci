import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  // 说明：登录/注册改为页面内 AuthPopup 弹窗，不再使用独立 /login /register 路由
  // 后续如需保护 /study 等路由，在此添加 authorized 回调
} satisfies NextAuthConfig;