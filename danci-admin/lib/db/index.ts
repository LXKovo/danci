import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 从 .env 读取 Supabase 数据库连接字符串
// 格式：postgresql://用户名:密码@主机地址:端口/库名
const connectionString = process.env.DATABASE_URL;

// 没配置就立刻抛错，避免带 undefined 连接、出错后难以排查
if (!connectionString) {
  throw new Error("DATABASE_URL 环境变量未配置");
}

// 全局单例容器：把 postgres 客户端挂在 globalThis 上。
// 原因：Next.js 开发模式热更新会反复执行本文件，
// 不复用的话每次刷新都新建一堆数据库连接，浪费资源甚至把连接数耗尽。
const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.postgresClient ??
  postgres(connectionString, {
    prepare: false, // 关闭预编译，drizzle + postgres-js 组合的必需配置
  });

// 开发环境复用全局连接；生产环境每次启动新建（热更新只发生在开发模式）
if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

// drizzle(client) 把底层 postgres 客户端包装成类型安全的 ORM 实例。
// 全项目都 import 这个 db 来操作数据库（增删改查都从这走）
export const db = drizzle(client);
