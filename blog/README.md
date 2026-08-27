# 系列文章：《我做一个单词后台管理系统时搞懂的事》

从 Next.js + Drizzle + Postgres 后台项目的开发过程出发，整理后端入门最容易踩坑、也最容易困惑的几个知识点。适合有基础前端经验、刚开始接触后端的读者。

## 文章列表

| # | 标题 | 核心内容 | 文章 |
|---|---|---|---|
| 1 | **为什么我的代码里再也看不到 SQL 了？** | ORM、schema 怎么写、迁移如何建表、Drizzle vs Prisma | [01-orm-是什么.md](./01-orm-是什么.md) |
| 2 | **登录为什么要建一张 session 表？它和 JWT 到底差在哪** | session 表存什么、两大认证门派对比 | [02-session-与-jwt.md](./02-session-与-jwt.md) |
| 3 | **把数据库扔到云端之后，我少写了多少代码？** | BaaS/DBaaS 区别、Supabase、云端数据库链路 | [03-baas-与-supabase.md](./03-baas-与-supabase.md) |

## 阅读顺序建议

从 1 到 3 顺读最佳，三篇是递进关系：

```
第1篇  ORM 怎么让代码操作数据库（数据层）
  ↓
第2篇  Session/JWT 怎么让 HTTP 认出你（认证层）
  ↓
第3篇  把数据库放到云端（基础设施层）
```

## 内容来源

文中代码来自本仓库的 `danci-admin/` 练习项目（Next.js 16 + Drizzle ORM + Supabase 托管 Postgres）。

> 注：文章中所有数据库连接串均已打码，不包含真实凭据。
