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
// words — 单词表（已存在于数据库，注意实际列为驼峰命名）
// ============================================================
export const words = pgTable(
  'words',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    wordRank: integer('wordRank'),
    headWord: varchar('headWord', { length: 255 }),
    content: json('content'),
    bookId: varchar('bookId', { length: 100 })
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
// user_book_progress — 用户单词书进度
// ============================================================
export const userBookProgress = pgTable(
  'user_book_progress',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: varchar('book_id', { length: 100 }).notNull().references(() => books.bookId, { onDelete: 'cascade' }),
    currentWordIndex: integer('current_word_index').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookUnique: uniqueIndex('user_book_progress_user_book_unique').on(table.userId, table.bookId),
    userIdIdx: index('user_book_progress_user_id_idx').on(table.userId),
  }),
);

// ============================================================
// user_word_progress — 用户单词学习记录
// ============================================================
export const userWordProgress = pgTable(
  'user_word_progress',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    wordId: bigint('word_id', { mode: 'number' }).notNull().references(() => words.id, { onDelete: 'cascade' }),
    bookId: varchar('book_id', { length: 100 }).notNull().references(() => books.bookId, { onDelete: 'cascade' }),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userWordUnique: uniqueIndex('user_word_progress_user_word_unique').on(table.userId, table.wordId),
    userBookIdx: index('user_word_progress_user_book_idx').on(table.userId, table.bookId),
  }),
);

// ============================================================
// study_progress — 学习进度表（兼容旧数据）
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