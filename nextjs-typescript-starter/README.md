# 阳光单词屋 — 英语单词学习 H5

一个面向小学生的英语单词学习 H5 应用，支持单词书浏览、学习计划、单词学习卡片、发音、进度追踪等功能。

## 功能特性

- **单词书列表**：浏览所有单词书，查看书名和词数
- **学习计划**：将单词书加入学习计划，追踪学习进度
- **单词学习卡片**：翻卡学习模式，显示拼写、音标、释义、例句
- **英美发音**：点击小喇叭播放有道词典英美发音
- **单词详情**：查看完整释义、例句、短语、同根词
- **学习进度**：自动记录用户学习进度，支持断点续学
- **最近学习**：首页展示最近学习的单词书，一键继续学习
- **登录注册**：邮箱密码登录/注册

## 在线体验

> [wordflow-nine.vercel.app](https://wordflow-nine.vercel.app/)

## 技术栈

- **框架**：[Next.js 14](https://nextjs.org/) (App Router)
- **认证**：[NextAuth.js v5](https://next-auth.js.org/) (Credentials Provider)
- **ORM**：[Drizzle ORM](https://orm.drizzle.team/)
- **数据库**：PostgreSQL (Neon / Supabase)
- **样式**：Tailwind CSS
- **字体**：Geist Sans

## 快速开始

### 1. 进入项目目录

```bash
cd nextjs-typescript-starter
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
POSTGRES_URL=你的PostgreSQL数据库连接串
AUTH_SECRET=生成一个随机密钥（可使用 openssl rand -base64 32）
NEXTAUTH_URL=http://localhost:3000
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

> 数据库表（`User`、`user_book_progress`、`user_word_progress`）会在应用首次启动时自动创建。`books` 和 `words` 表需通过管理后台或其他方式导入数据。

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── auth/              # NextAuth 认证路由
│   │   ├── plan/              # 学习计划 API
│   │   ├── progress/          # 学习进度 API
│   │   ├── recent-learning/   # 最近学习 API
│   │   └── register/          # 注册 API
│   ├── mine/                  # 我的页面
│   ├── study/[bookId]/        # 学习卡片页
│   ├── study/[bookId]/[wordId]/ # 单词详情页
│   ├── page.tsx               # 首页
│   ├── auth.ts                # NextAuth 配置
│   └── db.ts                  # 数据库操作函数
├── components/
│   ├── BookCard.tsx            # 单词书卡片
│   ├── PlanButton.tsx          # 加入学习计划按钮
│   ├── PlanCard.tsx            # 学习计划卡片
│   ├── PlanSection.tsx         # 学习计划区域
│   ├── WordCard.tsx            # 单词学习卡片
│   ├── WordDetail.tsx          # 单词详情组件
│   ├── AuthPopup.tsx           # 登录/注册弹窗
│   ├── LoginPrompt.tsx         # 未登录提示
│   ├── TabBar.tsx              # 底部 Tab 栏
│   ├── TabLayout.tsx           # Tab 布局
│   ├── ProgressBar.tsx         # 进度条
│   └── auth-context.tsx        # 认证上下文
├── lib/
│   ├── schema.ts               # Drizzle 表 Schema
│   └── db.ts                   # 数据库连接
└── docs/
    ├── proposal.md             # 需求文档
    ├── design.md               # 技术设计
    └── tasks.md                # 任务清单
```

## 数据库表

| 表名 | 说明 |
|------|------|
| `books` | 单词书（由管理后台维护） |
| `words` | 单词（由管理后台维护） |
| `User` | 用户（自动创建） |
| `user_book_progress` | 用户单词书进度（自动创建） |
| `user_word_progress` | 用户单词学习记录（自动创建） |

## 学习流程

1. 浏览单词书列表，点击「加入学习」添加到学习计划
2. 点击单词书进入学习卡片页，翻卡查看释义
3. 每翻一页自动同步进度，下次进入从上次位置继续
4. 点击「查看完整单词详情」进入详情页，支持英美发音
5. 首页「我的学习计划」展示已加入的单词书及进度
6. 首页「最近学习」卡片，一键继续学习
7. 「我的」页面查看所有单词书学习进度