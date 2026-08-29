# danci-admin — 单词书后台管理系统

单词书管理后台，供管理员维护单词书和单词数据。

## 功能特性

- **单词书管理**：创建、编辑、删除单词书
- **单词数据管理**：维护单词书中的单词数据
- **管理员认证**：注册/登录，会话管理
- **数据导入**：支持通过 CSV 等方式导入单词数据

## 在线体验

> [danci-seven.vercel.app](https://danci-seven.vercel.app/books)

## 技术栈

- **框架**：[Next.js 14](https://nextjs.org/) (App Router)
- **UI 组件库**：[shadcn/ui](https://ui.shadcn.com/)
- **ORM**：[Drizzle ORM](https://orm.drizzle.team/)
- **数据库**：PostgreSQL (Supabase)
- **样式**：Tailwind CSS

## 快速开始

### 1. 进入项目目录

```bash
cd danci-admin
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
DATABASE_URL=你的PostgreSQL数据库连接串
```

### 4. 初始化数据库

```bash
npm run db:generate   # 生成迁移文件
npm run db:migrate    # 执行数据库迁移
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 数据库表

| 表名 | 说明 |
|------|------|
| `books` | 单词书 |
| `words` | 单词（通过 book_id 外键关联 books 表） |
| `admin_users` | 管理员用户 |
| `admin_sessions` | 管理员会话 |

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── admin-users/       # 管理员 API
│   │   ├── auth/              # 认证 API
│   │   └── books/             # 单词书 CRUD API
│   ├── books/                 # 单词书管理页面
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 登录/注册页
├── components/
│   └── ui/                    # shadcn/ui 组件
├── lib/
│   ├── db/
│   │   ├── schema.ts          # 数据库表 Schema
│   │   └── index.ts           # 数据库连接
│   ├── api-response.ts        # API 响应工具
│   └── auth-server.ts         # 服务端认证工具
└── drizzle/                   # 数据库迁移文件
```

## 数据导入

配合项目根目录下的 `scripts/json2csv.mjs` 脚本，可以将 JSON 格式的单词数据转换为 CSV 文件，然后通过 PostgreSQL 客户端导入到 `words` 表中。

```bash
# 从项目根目录执行
npm run json2csv -- "路径/数据文件.json" "路径/输出文件.csv"
```