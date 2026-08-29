# danci — 英语单词学习平台

基于 Next.js 的英语单词学习平台，包含后台管理系统和 H5 学习应用，支持多端使用。

## 项目结构

```
danci/
├── danci-admin/              # 后台管理系统
│   ├── app/                  # Next.js App Router 页面
│   ├── lib/db/               # 数据库 Schema 与连接
│   ├── components/ui/        # shadcn/ui 组件
│   └── drizzle/              # 数据库迁移文件
├── nextjs-typescript-starter/ # H5 单词学习应用
│   ├── app/                  # 页面与 API 路由
│   ├── components/           # 前端组件
│   └── lib/                  # 数据库 Schema 与连接
└── scripts/                  # 工具脚本
    └── json2csv.mjs          # JSON 转 CSV 脚本
```

## 项目说明

### [danci-admin](./danci-admin/README.md) — 后台管理系统

单词书管理后台，供管理员使用。

- 单词书 CRUD（创建、查询、更新、删除）
- 管理员认证与管理
- 基于 shadcn/ui 的 UI 组件
- PostgreSQL 数据库，Drizzle ORM

### [nextjs-typescript-starter](./nextjs-typescript-starter/README.md) — H5 学习应用

面向学生的英语单词学习 H5 应用。

- 单词书浏览与学习计划
- 单词学习卡片（翻卡模式）
- 英美发音
- 学习进度追踪
- 邮箱密码登录/注册

### [scripts/json2csv.mjs](./scripts/json2csv.mjs) — 数据转换脚本

将 JSON 格式的单词数据批量转换为 CSV 格式，方便导入数据库。

```bash
npm run json2csv                    # 使用默认文件
npm run json2csv -- "输入路径"       # 指定输入文件
npm run json2csv -- "输入路径" "输出路径"  # 指定输入输出
```

## 技术栈

| 项目 | 技术栈 |
|------|--------|
| 后台管理 | Next.js 14, shadcn/ui, Drizzle ORM, PostgreSQL |
| H5 学习 | Next.js 14, NextAuth.js, Drizzle ORM, PostgreSQL, Tailwind CSS |
| 数据库 | PostgreSQL (Supabase / Neon) |
| 部署 | Vercel |

## 部署

两个项目均部署在 Vercel 上，需分别配置环境变量：

- `POSTGRES_URL` / `DATABASE_URL` — 数据库连接串
- `AUTH_SECRET` — NextAuth 密钥（仅 H5 应用需要）
- `NEXTAUTH_URL` — 部署域名（仅 H5 应用需要）