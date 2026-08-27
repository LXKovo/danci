# 把数据库扔到云端之后，我少写了多少代码？

> 系列第 3 篇 · 后端基础设施选型

---

## 一、BaaS 是什么

**BaaS（Backend as a Service，后端即服务）** 是一种云服务模式：把后端开发中**通用、重复、与业务无关**的部分（数据库、认证、文件存储、实时通信、推送、无服务器函数）标准化成开箱即用的云端能力，开发者通过 SDK / API 直接调用，而不必自己搭建和维护。

它的核心主张是：**后端 80% 的工作是「套路」，不该每个团队重造一遍。**

与之相对的传统路线：自建服务器 → 装数据库 → 写认证 → 写权限 → 处理部署 → 盯运维。每一件都耗时且与核心业务无关。

---

## 二、没有 BaaS 时，你要自己搞定什么

一个典型 Web 应用的后端清单：

| 模块 | 自建时要做的事 |
|---|---|
| 服务器 | 买机器 / 配容器 / 做负载均衡 |
| 数据库 | 安装、初始化、备份、监控、扩容 |
| 认证 | 注册/登录/密码哈希/session/找回密码/防暴力破解 |
| 权限 | RBAC、角色、路由守卫 |
| 文件存储 | 上传、CDN、防盗链 |
| 实时通信 | WebSocket 服务端、心跳、断线重连 |
| 部署运维 | CI/CD、日志、告警、升级 |

每一项都涉及大量工程细节。BaaS 的取舍是：**用「可定制性」换「交付速度」** —— 以上全部开箱即用，你只写业务代码。

---

## 三、BaaS、DBaaS、PaaS、FaaS —— 别再把它们搞混

这是最容易混淆的一组概念，先厘清：

| | 全称 | 提供什么 | 你仍要写 | 代表 |
|---|---|---|---|---|
| **DBaaS** | Database as a Service | 托管数据库 | 全部后端逻辑 | Neon、PlanetScale、RDS |
| **BaaS** | Backend as a Service | 数据库+认证+存储+实时+函数（一整套） | 只写业务逻辑 | Supabase、Firebase |
| **PaaS** | Platform as a Service | 应用运行平台（代码传上去就能跑） | 数据库、认证等仍要自己接 | Vercel、Heroku、Fly.io |
| **FaaS** | Function as a Service | 单函数运行环境（按调用计费） | 架构设计、数据层 | AWS Lambda、Cloudflare Workers |

**关键区分**：

- **BaaS ⊃ DBaaS** —— 数据库只是 BaaS 提供的众多能力之一。用了 BaaS，默认不用单独选 DBaaS。
- **PaaS ≠ BaaS** —— Vercel 部署的是「你的应用代码」，不等于你的后端能力（认证、数据库）也自动有了。
- **FaaS 是「函数即服务」** —— 适合无服务器单函数，不是完整后端方案。

> 常有人把「Supabase 的数据库」单独拿出来当 DBaaS 用（只连它的 Postgres，认证自己写）—— 合法，但那不是 BaaS 的完整形态。

---

## 四、BaaS 提供哪些核心能力

| 能力 | 做什么 | 典型用法 |
|---|---|---|
| **数据库** | 托管数据库 + 建表/迁移工具 | 存业务数据 |
| **认证 Auth** | 注册/登录/OAuth/JWT/密码重置 | 用户系统 |
| **实时 Realtime** | WebSocket 双向同步 | 聊天、协同、消息推送 |
| **存储 Storage** | 文件上传/CDN/鉴权访问 | 图片、音视频、附件 |
| **云函数** | 服务端逻辑按需执行 | 定时任务、Webhook、复杂查询 |
| **安全规则** | 行级/字段级权限控制 | 多租户数据隔离 |

---

## 五、Supabase 是什么

**Supabase** 是目前最流行的**开源 BaaS**，常被称为「Firebase 的开源替代品」。它建立在 **PostgreSQL** 之上 —— 这点是它与 Firebase 最本质的分野。

### Supabase vs Firebase 对比

| | Supabase | Firebase |
|---|---|---|
| 开源 | ✅ Apache 2.0，可自托管 | ❌ 闭源 |
| 数据库 | **PostgreSQL（关系型，标准 SQL）** | Firestore（NoSQL 文档型） |
| 查询 | SQL / 类 SQL | NoSQL 查询 |
| 数据关系 | 原生 JOIN、外键、事务 | 弱关联，反范式设计 |
| 认证 | 基于 Postgres 用户 + JWT | 闭源实现 |
| 自托管 | 支持（Docker/托管） | 不支持 |
| 生态 | 可接入任意 Postgres 工具 | 封闭生态 |
| 适合 | 需要关系型数据、想掌控数据的团队 | Google 生态、NoSQL 场景 |

**为什么选 Postgres 是核心卖点**：关系型数据库经过几十年验证，事务、JOIN、复杂查询都是原生的；且你随时可以「逃离」—— 导出一份 Postgres dump，换到任何 Postgres 托管商，**没有被锁死在 Supabase 上**。

---

## 六、Supabase 核心模块详解

### 1. Database —— 托管 Postgres

- 真正的 PostgreSQL 14+，支持全部 SQL 特性、外键、触发器、视图、函数。
- 自带表编辑器、SQL 编辑器、自动生成 API（PostgREST）。
- **RLS（Row Level Security）**：Postgres 原生行级安全，可写策略 `CREATE POLICY ... USING (user_id = auth.uid())`，实现「每个用户只能读写自己的数据」，权限下推到数据库层。
- 与 ORM（Drizzle / Prisma）配合：暴露一个连接串，ORM 正常建表、查询即可。

连接串格式（注意各段含义）：

```
postgresql://  用户名  :  密码  @  主机地址  :  端口  /  数据库名
```

### 2. Auth —— 认证

- 支持邮箱+密码、OAuth（GitHub/Google/微信等）、手机号、匿名登录。
- 密码哈希、JWT 签发、session 刷新、邮件验证**全部托管**。
- 返回的凭证是 **JWT**，服务端验签即可识别用户，无需查库。

```js
// 一行完成登录（对比手写 session 表、cookie、过期管理）
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "12345678",
});
// data.session 含 access token / refresh token
```

### 3. Storage —— 对象存储

- 文件上传/下载、CDN 分发、图片处理。
- 访问权限通过 Storage 策略控制（类似 RLS）。

### 4. Realtime —— 实时同步

- 基于 Postgres 的 `LISTEN/NOTIFY`，数据库变更可实时广播到客户端。

```js
supabase.channel("room-1").on(
  "postgres_changes",
  { event: "INSERT", schema: "public", table: "messages" },
  (payload) => console.log(payload.new)
).subscribe();
```

### 5. Edge Functions —— 无服务器函数

- 跑在 Deno 上，按调用计费，适合 Webhook、定时任务、需要数据库连接的服务端逻辑。

---

## 七、一个完整的接入链路（Next.js + Drizzle + Supabase）

### 1. 连接：一条 `DATABASE_URL` 打通

```
你的应用代码 (Drizzle + postgres 驱动)
        │  DATABASE_URL（连接字符串，存于 .env）
        ▼
Supabase 云端托管的 PostgreSQL
```

这条连接串被**两处**复用：

```ts
// 运行时：应用增删改查
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
```

```ts
// 迁移时：ORM 建表（同一变量）
import "dotenv/config";
export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
});
```

### 2. 建表：schema → 迁移 → 云端执行

用 Drizzle 定义 schema，`db:migrate` 把迁移 SQL 执行到 Supabase 的 Postgres 上：

```sql
CREATE TABLE "admin-users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  ...
);
```

### 3. 认证：选择接管方式

| 方案 | 说明 |
|---|---|
| **仅用托管数据库**（DBaaS 形态） | 认证仍手写（session 表 / JWT） |
| **接 Supabase Auth** | 认证也交给云端，JWT 验签识别用户，业务表存 `user_id` 关联 |

> 注意：Auth 只管「你是谁」（认证），角色权限（谁能干什么）通常仍要自己在业务表里实现。

### 4. 安全底线

- `DATABASE_URL` 是真实凭据，必须放 `.env` 且 **gitignore**（`.env*`），绝不提交仓库。
- 连接串泄露 ≠ 密码被看到 = 需要去控制台轮换（rotate）。
- 数据库默认不对外暴露公网，仅白名单 IP 可连。

---

## 八、BaaS 的边界：什么情况不该用

BaaS 不是银弹，有明确的代价：

| 风险 | 说明 |
|---|---|
| **厂商锁定（Vendor Lock-in）** | 深度使用 Auth/Storage/Realtime 后，迁移成本高 |
| **定制受限** | 底层行为由平台决定，特殊需求难绕过 |
| **成本随规模上升** | 免费额度用完，按量付费可能比自建贵 |
| **数据主权/合规** | 数据存国外机房，涉及合规场景需确认区域 |
| **跨云/多环境** | 无法完全离线开发，联调依赖云服务可用性 |

**缓释手段**：数据层用标准 SQL 而非 NoSQL（数据可导出迁移）；核心业务逻辑留在自己代码里；只用 BaaS 的「外围能力」（存储/通知），把数据库和认证留给自己。

---

## 九、选型决策

| 你的情况 | 建议 |
|---|---|
| 个人项目 / 快速验证 / 前端团队 | **BaaS**（Supabase/Firebase），最快上线 |
| 需要关系型数据 + 想保留迁移自由 | **Supabase**（Postgres 可逃离） |
| 已有成熟后端，只想省数据库运维 | **DBaaS**（Neon/RDS） |
| 数据敏感 / 强合规 / 高度定制 | **自建**（传统后端） |
| 有后端团队、追求完全掌控 | 自建 + 托管数据库组合 |

**原则**：BaaS 解决「速度」，自建解决「掌控」。项目阶段决定了取舍 —— 早期用 BaaS 抢时间，架构上留好「数据可导出」的退路，将来要迁移也不会被锁死。

---

## 小结

1. **BaaS = 后端外包**：数据库、认证、存储、实时、函数，全部标准化为可调用服务。
2. **BaaS ⊃ DBaaS**：数据库只是 BaaS 的能力之一，别把两者等同。
3. **Supabase** 是开源的 Postgres 系 BaaS，对比 Firebase 的核心优势是**标准 SQL + 可自托管 + 可逃离**。
4. 用 BaaS 前先想清楚**边界**：省下的是套路，交出去的是掌控。数据层保持标准 SQL，就是给自己留的后路。
