import {
  pgTable,
  bigint,
  integer,
  varchar,
  text,
  json,
  timestamp,
  uniqueIndex,
  index,
  serial,
} from 'drizzle-orm/pg-core';

// ============================================================
// User — 用户表
// ============================================================
export const users = pgTable('User', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 64 }),
  password: varchar('password', { length: 64 }),
});

// ============================================================
// books — 单词书表（已存在于数据库）
// ============================================================
export const books = pgTable(
  'books',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    title: varchar('title', { length: 255 }).notNull(),
    wordCount: integer('word_count').default(0).notNull(),
    coverUrl: text('cover_url'),
    bookId: varchar('book_id', { length: 100 }).notNull().unique(),
    tags: text('tags'),
    status: varchar('status', { length: 20 }).default('active').notNull(),
    stage: varchar('stage', { length: 20 }).default('小学').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookIdUnique: uniqueIndex('books_book_id_unique').on(table.bookId),
  }),
);

// ============================================================
// words — 单词表（已存在于数据库）
// ============================================================
export const words = pgTable(
  'words',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    wordRank: integer('word_rank'),
    headWord: varchar('head_word', { length: 255 }),
    content: json('content'),
    bookId: varchar('book_id', { length: 100 })
      .notNull()
      .references(() => books.bookId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookIdIdx: index('words_book_id_idx').on(table.bookId),
  }),
);

// ============================================================
// study_progress — 学习进度表（新增）
// ============================================================
export const studyProgress = pgTable(
  'study_progress',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: varchar('book_id', { length: 100 })
      .notNull()
      .references(() => books.bookId, { onDelete: 'cascade' }),
    currentWordIndex: integer('current_word_index').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookUnique: uniqueIndex('study_progress_user_book_unique').on(
      table.userId,
      table.bookId,
    ),
    userIdIdx: index('study_progress_user_id_idx').on(table.userId),
  }),
);