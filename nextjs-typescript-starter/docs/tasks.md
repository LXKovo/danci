# 英语单词学习 H5 — 任务清单（tasks.md）

## 使用说明

- **原则**：一个任务 = 一个可验收模块，每个任务独立可交付、可验证
- 按序号顺序执行（序号即依赖顺序），完成后勾选 `[x]` 并记录验收结果
- 需求见 `proposal.md`，技术细节见 `design.md`
- **前置条件**：`books` / `words` 表的单词数据由管理员通过 danci-admin 或其他方式导入，**不在本任务清单内**；开发/联调前需保证表中已有数据

## 已完成（项目基础）

- [x] 数据库表迁移：`User`、`study_progress` 已建表（drizzle-kit）
- [x] 数据层：`lib/db.ts` 客户端、`lib/schema.ts` Schema、`app/db.ts` 操作函数
- [x] 工程化：`drizzle.config.ts` + `db:*` 脚本
- [x] 清理 starter 冗余文件（login/register/protected/form/submit-button）

---

## 任务 1：底部 Tab 导航框架

- **目标**：实现 TabLayout + TabBar（首页/我的两个 Tab），`/` 和 `/mine` 两个占位页可切换
- **涉及**：`components/TabBar.tsx`、`app/layout.tsx`（改造）、`app/mine/page.tsx`（新建占位）、`app/page.tsx`
- **验收**：H5 底部固定双 Tab，点击可在首页/我的间切换，当前 Tab 高亮；含 H5 安全区适配
- **依赖**：无

## 任务 2：首页单词书列表

- **目标**：首页服务端查询 `books` 表，渲染单词书卡片列表（封面占位 + 书名 + 词数）
- **涉及**：`components/BookCard.tsx`、`app/page.tsx`、`app/db.ts`（`getBooks`）
- **验收**：首页展示所有单词书；空数据时显示空状态占位
- **依赖**：任务 1（Tab 容器）

## 任务 3：登录/注册 AuthPopup

- **目标**：未登录用户点击单词书 → 自动切到「我的」Tab → 弹出登录/注册弹窗；支持邮箱密码登录、注册、模式切换、错误提示
- **涉及**：`components/AuthPopup.tsx`（含 AuthForm、ToggleLink）、`app/api/register/route.ts`（新建）、Auth Context、`app/auth.ts`（`signIn`）
- **验收**：可注册新账号、用账号登录成功并跳回原单词书；错误密码/重复邮箱有提示；成功后首页刷新登录态
- **依赖**：任务 1（Tab 切换）、任务 2（点击单词书入口）

## 任务 4：单词学习卡片页（含进度记录）

- **目标**：`/study/[bookId]` 单词卡片渲染（拼写+音标+释义+示例句），上一个/下一个翻页，切换时记录学习进度（每 5 词同步 + 卸载 sendBeacon）；`/study` 路由权限保护
- **涉及**：`components/WordCard.tsx`、`app/study/[bookId]/page.tsx`、`app/api/progress/route.ts`（新建）、`middleware.ts`/`app/auth.config.ts`（加权限）、`app/db.ts`（`getWordsByBook`/`upsertProgress`）
- **验收**：进入学习页从指定索引开始，可翻卡；进度写入 `study_progress`；未登录访问 `/study` 被重定向到登录
- **依赖**：任务 2（书籍入口）、任务 3（登录）

## 任务 5：我的页面

- **目标**：`/mine` 展示用户邮箱、各单词书学习进度条（书名 + 进度）、退出登录按钮
- **涉及**：`app/mine/page.tsx`、`components/ProgressBar.tsx`、`app/db.ts`（`getAllProgress`）、`app/auth.ts`（`signOut`）
- **验收**：显示当前用户邮箱；进度条与数据库一致；退出后回到首页且登录态清除
- **依赖**：任务 4（进度数据来源）

## 任务 6：首页最近学习

- **目标**：登录后首页展示「最近学习」卡片（书名 + 已学进度），点击从上次位置继续学习；未登录或有学习记录时不展示
- **涉及**：`app/page.tsx`、`components/BookCard.tsx`（复用）、`app/db.ts`（`getAllProgress`）
- **验收**：有学习记录时首页显示最近学习卡片，点击进入 `/study/[bookId]` 并从上个学习位置继续
- **依赖**：任务 4（进度记录）、任务 5

## 任务 7：单词详情页

- **目标**：`/study/[bookId]/[wordId]` 完整渲染 content：音标（美/英）、发音、释义、例句、短语、同根词；底部「返回学习」
- **涉及**：`app/study/[bookId]/[wordId]/page.tsx`、`components/WordDetail/*`、`app/db.ts`（`getWordById`）
- **验收**：点击学习卡片进入详情页，各区块字段正确渲染；「返回学习」回到卡片页原位置
- **依赖**：任务 4（卡片页入口）

---

## 联调验收（全部完成后）

- 全流程：未登录 → 点单词书 → 弹登录 → 注册 → 进入学习 → 翻卡记录进度 → 我的页看到进度 → 回首页看到最近学习 → 继续学习 → 查看详情 → 退出登录
