# 为什么我的代码里再也看不到 SQL 了？

> 系列：《我做一个单词后台管理系统时搞懂的事》
> 本文是第 1 篇，聊聊 ORM 和手写 SQL 的区别，以及 schema 是怎么变成数据库里的表的。

最近用 Next.js 做了一个单词后台管理系统。作为后端新手，第一次接触到 ORM（Drizzle），也第一次亲手写出「不写 SQL 也能操作数据库」的代码。

这篇文章把我理解的东西讲清楚：**ORM 是什么、为什么需要它、schema 怎么变成数据库表、Drizzle 和 Prisma 怎么选。**

---

## 一、没有 ORM 的世界：手写 SQL

先看传统做法。你的系统要给数据库存用户、查用户，就得手写 SQL 字符串，拼到代码里：

```ts
// 手写 SQL：字符串拼查询，错一个字运行时才暴露
const result = await client.query(
  "SELECT id, name, email, password_hash FROM \"admin-users\" WHERE email = $1",
  [email]
);
```

问题很多：

1. **容易拼错** —— 表名、字段名、引号、占位符，错一个只能在运行时报错。
2. **SQL 注入风险** —— 字符串拼接一不注意就被人注入攻击。
3. **没有类型** —— 查出来的 `result` 是任意的，字段是 string 还是 number，编译器根本不管。
4. **数据库方言** —— 换个数据库（Postgres → MySQL）语法就变，代码跟着重写。

写多了你会觉得：能不能**用写普通代码的方式**操作数据库，让工具去生成 SQL？

这就是 ORM 存在的意义。

---

## 二、什么是 ORM

**ORM（Object Relational Mapping，对象关系映射）** 是把「数据库里的表」和「编程语言里的对象/类型」互相转换的工具。

数据库是关系型的（表、行、列），代码是对象式的（类、对象、类型）。ORM 在中间当翻译官：你用对象的方式写代码，它翻译成 SQL 执行，再把结果翻译回对象。

用 ORM 之后，同一个查询长这样：

```ts
const user = await db.select()
  .from(adminUsers)                // 表，就是代码里的一个对象
  .where(eq(adminUsers.email, email));  // 列，就是对象上的一个属性

// user 是带类型的：写错字段名，编译器直接报错
```

对比一下：

| | 手写 SQL | ORM |
|---|---|---|
| 写查询 | 拼字符串 | 链式方法调用 |
| 错字段名 | 运行时崩 | 编译期报错 |
| 类型 | 没有 | 完整推导 |
| 换数据库 | 重写 | 换驱动 |
| 注入风险 | 靠自己小心 | 参数自动转义 |

**一句话：ORM 让你不用写 SQL，也能安全、有类型地操作数据库。**

---

## 三、Schema：用代码表达表结构

ORM 的核心是 **schema（数据库结构定义）** —— 在代码里描述「有哪些表、每张表有哪些列、有什么约束」。

我用的是 Drizzle，schema 就是一个普通的 TypeScript 文件。看我们项目里管理员表的定义：

```ts
export const adminUsers = pgTable("admin-users", {
  // TS属性名 : 类型构建器("数据库列名").修饰符链
  id: uuid("id").defaultRandom().primaryKey(),          // 主键，自动生成 uuid
  name: varchar("name", { length: 100 }).notNull(),      // 姓名，最长100，必填
  email: varchar("email", { length: 255 }).notNull().unique(), // 邮箱，唯一
  passwordHash: text("password_hash").notNull(),         // 密码哈希
  role: varchar("role", { length: 20 }).$type<AdminRole>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

理解这段代码的关键是一个模式：

```
TS属性名: 类型构建器("数据库列名").约束1.约束2...
   ↑              ↑              ↑
 代码里用      数据库里叫      默认值/主键/非空/唯一/外键...
```

几个容易迷糊的点：

- **`uuid("id")`** —— 括号里的 `"id"` 是**数据库里真实的列名**；左边的 `id` 是**你在 TypeScript 里用到的属性名**。两者可以不一样（比如 `passwordHash` ↔ 数据库里的 `password_hash`）。
- **`.$type<AdminRole>()`** —— 纯 TS 层的约束。数据库里它还是普通 `varchar(20)`，但代码里只允许赋 `"system-admin" | "admin"` 两种值，防止拼错字符串。
- **索引** —— 经常出现在 `WHERE`/`JOIN` 里的列值得加索引。Drizzle 里写在 `pgTable` 的第三个参数：

```ts
export const adminSessions = pgTable(
  "admin-session",
  { /* 列定义 */ },
  (table) => [index("admin_session_admin_id_idx").on(table.adminId)]
);
```

---

## 四、Schema 是怎么变成数据库表的？—— 迁移（Migration）

schema 只是「结构描述」，**它本身不碰数据库**。真正建表要走两步，Drizzle 配套工具 `drizzle-kit` 负责：

```
schema.ts (TS 定义)
    │  npm run db:generate     只生成，不执行
    ▼
drizzle/0001_xxx.sql            迁移文件（标准 SQL）
    │  npm run db:migrate       执行
    ▼
Postgres 数据库真实建表
```

`generate` 会对比「当前数据库的结构快照」和「schema.ts 的差异」，把差异生成为一段标准 SQL。比如我上面的 schema 生成出来是这样：

```sql
CREATE TABLE "admin-users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "admin-users_email_unique" UNIQUE("email")
);
```

`migrate` 才把这 SQL 真的执行到数据库里。

**所以：建表是一次性的迁移动作，而 ORM 每天干的活是建表之后的增删改查。**

---

## 五、Drizzle vs Prisma：两个主流怎么选

TypeScript 生态里最常见两个 ORM：

| | Drizzle（我用的） | Prisma |
|---|---|---|
| Schema 怎么定义 | 普通 TS 文件 | 独立的 `.prisma` 文件 |
| 需要代码生成 | 不需要 | 需要 `prisma generate` |
| API 风格 | 贴近 SQL（`select().from().where()`） | ORM 风格（`prisma.user.findMany()`） |
| 体积 / 性能 | 轻量、无魔法 | 较重、抽象层高 |
| 适合 | 对性能/体积敏感、喜欢可控 | 追求开发体验、功能全家桶 |

Drizzle 的哲学是「SQL 优先」：它的 API 几乎就是 SQL 的逐字翻译，schema 就是普通 TS 代码，没有代码生成那层神秘环节，学起来也更容易看懂底层在干嘛。

**选型建议**：如果项目对性能、包体积敏感，或者想弄明白底层原理，选 Drizzle；如果想开箱即用、少操心，选 Prisma。

---

## 小结

1. **ORM** 是表和对象之间的翻译官，让你不写 SQL 也能安全操作数据库。
2. **Schema** 是用代码表达表结构，`TS属性名 : 类型构建器("列名").约束` 是它的核心语法。
3. **迁移** 把 schema 变成 SQL 再执行建表，`generate` 生成、`migrate` 执行。
4. **Drizzle vs Prisma** —— 前者贴近 SQL、轻量；后者抽象高、功能全。

下一篇我会聊这个项目里另一个让我彻底想通的问题：**为什么要建一张 session 表？它和 JWT 到底有什么区别？**

> 文中代码来自我的开源练习项目（Next.js 16 + Drizzle + Postgres）。欢迎留言交流。
