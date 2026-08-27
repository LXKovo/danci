import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 数据库连接客户端（基于 .env 中的 POSTGRES_URL）
// 说明：
// - Next.js 运行时自动加载根目录 .env
// - 独立脚本（drizzle-kit / node scripts）通过顶部 `import 'dotenv/config'` 加载
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    'POSTGRES_URL 环境变量未设置，请检查根目录 .env 文件。',
  );
}

export const client = postgres(`${connectionString}?sslmode=require`, {
  max: 10, // 连接池最大连接数
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });