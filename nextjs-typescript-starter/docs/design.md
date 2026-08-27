# 英语单词学习 H5 — 技术设计文档

## 1. 技术概览

| 层次 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Next.js 14 (App Router) | 服务端渲染 + API Routes |
| 语言 | TypeScript | 全栈类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS，H5 适配 |
| 认证 | NextAuth v5 (Credentials) | 邮箱 + 密码登录 |
| 数据库 | PostgreSQL (Supabase) | 关系型数据库 |
| ORM | Drizzle ORM + drizzle-kit | 类型安全查询 + 迁移 |
| 密码加密 | bcrypt-ts | 密码哈希 |

## 2. 数据库设计

表结构与 Drizzle Schema 定义见 [lib/schema.ts](../lib/schema.ts)，已通过 drizzle-kit 迁移完成（`drizzle/0000_slippery_vulcan.sql`）。数据库连接客户端见 [lib/db.ts](../lib/db.ts)。

### 2.1 表结构总览

| 表 | 状态 | 说明 |
|----|------|------|
| `books` | 已有 | 单词书 |
| `words` | 已有 | 单词（含完整 content JSON） |
| `User` | 已迁移 | 用户（id/email/password） |
| `study_progress` | 已迁移 | 学习进度 |

### 2.2 words.content JSON 结构（渲染依据）

```json
{
  "word": {
    "wordHead": "pencil",
    "wordId": "PEPXiaoXue3_1_2",
    "content": {
      "sentence": { "sentences": [{ "sContent": "a sharp pencil", "sCn": "尖尖的铅笔" }], "desc": "例句" },
      "usphone": "'pɛnsəl", "ukphone": "'pens(ə)l; -sɪl",
      "usspeech": "pencil&type=2", "ukspeech": "pencil&type=1",
      "phrase": { "phrases": [{ "pContent": "pencil case", "pCn": "文具盒" }], "desc": "短语" },
      "relWord": { "rels": [{ "pos": "adj", "words": [{ "hwd": "penciled", "tran": " 用铅笔写的" }] }], "desc": "同根" },
      "trans": [{ "tranCn": "铅笔", "tranOther": "an instrument...", "descCn": "中释", "descOther": "英释" }]
    }
  }
}
```

### 2.3 ER 关系

```
User ──1:N── study_progress ──N:1── books ──1:N── words
(id)          (user_id, book_id)      (book_id)     (book_id FK)
```

`study_progress` 唯一约束 `(user_id, book_id)`：每个用户对每本书仅一条进度。`current_word_index` 表示已学完前 N 个单词（从 0 起）。

## 3. 字段渲染映射

### 3.1 卡片模式（精简）

| 显示项 | JSON 路径 |
|--------|-----------|
| 单词拼写 | `content.word.wordHead` |
| 美式音标 | `content.word.content.usphone` |
| 中文释义 | `content.word.content.trans[0].tranCn` |
| 例句英/中 | `content.word.content.sentence.sentences[0].sContent` / `.sCn` |

### 3.2 详情页（完整）

| 区域 | JSON 路径 |
|------|-----------|
| 拼写/音标 | `wordHead`、`usphone`、`ukphone` |
| 发音 | `usspeech`（美）、`ukspeech`（英） |
| 释义 | `trans[].tranCn`（中）、`trans[].tranOther`（英，如有） |
| 例句 | `sentence.sentences[]` → `sContent` + `sCn` |
| 短语 | `phrase.phrases[]` → `pContent` + `pCn` |
| 同根词 | `relWord.rels[]` → 按 `pos` 分组，`words[]` → `hwd` + `tran` |

## 4. 数据库操作（app/db.ts 已实现）

| 函数 | 作用 |
|------|------|
| `getUser` / `createUser` | 用户查询/创建（bcrypt 哈希，已有） |
| `getBooks` / `getBookById` | 单词书查询 |
| `getWordsByBook` / `getWordById` / `getWordCountByBook` | 单词查询 |
| `getProgress` / `getAllProgress` / `upsertProgress` | 学习进度读写（UPSERT） |

## 5. API 路由设计

| 方法/路径 | 鉴权 | 说明 |
|-----------|------|------|
| `POST /api/auth/[...nextauth]` | - | NextAuth 内置（已有） |
| `POST /api/register` | - | 注册：body `{email, password}`，查重→bcrypt 创建→自动登录；成功 200，重复 409 |
| `GET /api/books` | - | 单词书列表：`{ books: [...] }`，取 `status='active'` |
| `GET /api/words?bookId=&start=&limit=` | - | 单词分页列表（按 wordRank 排序） |
| `GET /api/words/[wordId]` | - | 单词详情（完整 content） |
| `GET /api/progress?bookId=` | 需登录 | 单本书进度；未学过返回 `currentWordIndex: 0` |
| `GET /api/progress` | 需登录 | 全部进度（LEFT JOIN books 取书名/词数） |
| `PUT /api/progress` | 需登录 | 更新进度：body `{bookId, currentWordIndex}`，UPSERT |

进度 UPSERT：`INSERT ... ON CONFLICT (user_id, book_id) DO UPDATE SET current_word_index, updated_at=NOW()`。

## 6. 前端架构

### 6.1 布局方案

App Router 嵌套布局实现 Tab 导航。`TabLayout` 为 Client Component，用 `usePathname()` 高亮当前 Tab：

```
RootLayout (app/layout.tsx)
└── TabLayout (Client)
    ├── <main>{children}</main>    ← 内容区
    └── <TabBar activeTab />       ← 底部固定 Tab
```

### 6.2 认证状态管理

`layout.tsx` 用 `SessionProvider` 包裹。页面用 `useSession()` 判断登录态（`status === 'authenticated'`），登录态变化时首页条件渲染「最近学习」。

### 6.3 路由权限

- `/`、`/mine` 公开；`/study/*` 需登录
- 未登录访问 `/study/*`：middleware 重定向到 `/mine?login=required` 并弹登录框
- 当前 [auth.config.ts](../app/auth.config.ts) 为放行状态，实现 `/study` 时补充 `authorized` 回调

### 6.4 AuthPopup（登录/注册弹窗）

Client 组件，内部维护 `mode: 'login' | 'register'` 切换。用 React Context 全局管理开关与 `redirectTo`。

流程：未登录点单词书 → 设置 `redirectTo='/study/[bookId]'` → 切到「我的」Tab → 打开弹窗 → 登录/注册成功 → `router.push(redirectTo)`。

- 登录：`signIn('credentials', { email, password, redirect: false })`，失败显示错误
- 注册：`POST /api/register`（查重 + 创建 + 自动登录）

### 6.5 学习进度更新策略

点击「下一个」时记录进度，每切 5 个词同步一次 `PUT /api/progress`（用 `useRef` 记录上次同步索引），页面卸载时 `navigator.sendBeacon` 强制同步一次。

### 6.6 单词数据加载

- 首页/学习页/详情页均使用 Server Component 直接查库（`getBooks` / `getWordsByBook` 等）
- 单词书仅 120~150 词，学习页一次性把整本书加载到客户端内存，翻页本地切换，避免逐词请求

## 7. 组件规划

| 组件 | 路径 | 说明 |
|------|------|------|
| `TabBar` | components/TabBar.tsx | 底部导航 |
| `AuthPopup` | components/AuthPopup.tsx | 登录/注册弹窗（含 AuthForm、ToggleLink） |
| `BookCard` | components/BookCard.tsx | 单词书卡片 |
| `WordCard` | components/WordCard.tsx | 学习卡片 |
| `ProgressBar` | components/ProgressBar.tsx | 进度条 |
| `WordDetail/*` | components/WordDetail/ | 详情页分区块组件 |

## 8. 关键实现细节

### 8.1 单词发音

优先用浏览器 `SpeechSynthesis` API（`lang='en-US'`，无需依赖）；`usspeech`/`ukspeech` 字段可对接有道等第三方 TTS 作为备选。

### 8.2 校验

- 邮箱格式校验；密码长度 ≥ 6（面向家长/小学生，不强求强度）

### 8.3 H5 适配

- `max-w-md` 居中限宽；底部 Tab `h-16` + `safe-area-inset-bottom` 适配刘海屏
- 按钮最小点击区域 44×44px

### 8.4 错误处理

- API 统一返回 `{ error: string }`，前端提示
- session 过期 API 返回 401 → 弹出登录框
- 列表为空显示空状态占位

## 9. 环境变量

```
POSTGRES_URL=...   # 已有
AUTH_SECRET=...    # 已有（需设置有效值）
```

## 10. 实施状态

| 状态 | 事项 |
|------|------|
| ✅ 完成 | 数据库迁移（User/study_progress 已建表） |
| ✅ 完成 | lib/db.ts 客户端、lib/schema.ts、app/db.ts 操作函数 |
| ✅ 完成 | drizzle.config.ts + db:* 脚本 |
| ✅ 完成 | 清理 starter 冗余（login/register/protected/form/submit-button） |
| ⏳ 待办 | 见 tasks.md（按可验收模块拆分） |

## 11. 任务拆分

实现按"一个任务 = 一个可验收模块"拆分，见 `tasks.md`。
