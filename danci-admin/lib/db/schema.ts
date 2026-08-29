// Drizzle 的类型构建器，从 pg-core（Postgres 专属）导入。
// 每个函数用于定义一种数据库列类型 / 表结构。
import {
  bigint,     // 大整数列
  index,      // 建普通索引（在 pgTable 第三个参数里用）
  integer,    // 整数列
  json,       // JSON 列
  pgTable,    // 定义一张表，返回表对象，代码里就靠它引用这张表
  text,       // 不限长度的文本列
  timestamp,  // 时间戳列
  uuid,       // uuid 类型的列
  varchar,    // 定长字符串列（需要传最大长度）
} from "drizzle-orm/pg-core";

// 管理员的角色类型，仅两种取值。
// 这只是 TS 层面的约束（数据库里还是普通 varchar），防拼错字符串。
export type AdminRole = "system-admin" | "admin";

// ===== 管理员表 =====
// pgTable(数据库表名, { 列定义... })
export const adminUsers = pgTable("admin-users", {
  // 主键：插入时不传 id，数据库自动生成随机 uuid（对应 SQL: DEFAULT gen_random_uuid()）
  id: uuid("id").defaultRandom().primaryKey(),
  // 姓名：最长 100 字符，必填
  name: varchar("name", { length: 100 }).notNull(),
  // 邮箱：最长 255，必填，唯一（unique 约束会自动建唯一索引）
  email: varchar("email", { length: 255 }).notNull().unique(),
  // 密码哈希：bcrypt 加密后的密文，长度不固定所以用 text
  passwordHash: text("password_hash").notNull(),
  // 角色：数据库里是 varchar(20)，TS 里限定为 AdminRole 类型
  role: varchar("role", { length: 20 }).$type<AdminRole>().notNull(),
  // 创建时间：带时区，插入时自动填当前时间
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // 更新时间：同上，但更新记录时需要代码里手动刷新
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== 会话表（服务端 session 的"小本本"）=====
// 存「登录凭证」。用户登录后这里多一行：随机 token 的哈希 + 属于谁 + 什么时候过期。
// 浏览器 cookie 里只存 token 原文（那串随机数），
// 每次请求服务端用 token 来这里查身份；登出/过期 = 删行 / 等到期，立刻生效。
export const adminSessions = pgTable(
  "admin-session",
  {
    // 主键是 token 的哈希（存哈希不存原文，防数据库泄露后被伪造会话）
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    // 外键：这条会话属于哪个管理员；管理员被删时级联删掉他所有会话
    adminId: uuid("admin_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    // 过期时间：验证时要求「当前时间 < expires_at」才有效
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // 第三个参数：表级索引。按 adminId 查某人全部会话很常见，建索引加速
  (table) => [index("admin_session_admin_id_idx").on(table.adminId)]
);

// ===== 单词书表 =====
// 每本单词书的元信息，与 words 表通过 book_id 关联
export const books = pgTable("books", {
  id: bigint("id", { mode: "bigint" }).generatedByDefaultAsIdentity().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  wordCount: integer("word_count").notNull().default(0),
  coverUrl: text("cover_url"),
  bookId: varchar("book_id", { length: 100 }).notNull().unique(),
  tags: text("tags"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  stage: varchar("stage", { length: 20 }).notNull().default("小学"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== 单词表 =====
// 存单词数据，从 JSON 文件导入，content 字段存完整单词信息（例句、短语、同近词等）
// book_id 外键关联 books.book_id，删书时级联删除单词
export const words = pgTable(
  "words",
  {
    id: bigint("id", { mode: "bigint" }).generatedByDefaultAsIdentity().primaryKey(),
    wordRank: integer("wordRank"),
    headWord: varchar("headWord", { length: 255 }),
    content: json("content"),
    bookId: varchar("bookId", { length: 100 })
      .notNull()
      .references(() => books.bookId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("words_book_id_idx").on(table.bookId)]
);


// 从表定义自动推导出「查询返回的行」类型，省得手写。
// 等价于 AdminUser = { id: string; name: string; email: string; passwordHash: string; ... }
export type AdminUser = typeof adminUsers.$inferSelect;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Word = typeof words.$inferSelect;
