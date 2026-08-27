# danci
next.js 单词后台管理系统和h5 应用开发

## 应用形式
- 后台管理系统 
- h5应用
- 多端开发
## 亮点
- 数据清洗 
github 高星的 单词资料库 
数据清洗 （选择、格式化、审核）
- supabase 云端类psql数据库
  关系型数据库
- 支持向量数据库
- 云端 BAAS 数据库 
  Backend as a service 
- ORM 
  不用写sql, 不用做数据库的底层处理 
  对象关系映射
  todo.save() 保存
  对象和数据库一行记录 对应起来 

## 后台管理系统 
### 单词书管理
维护单词书，包括单词书的创建、删除、更新、查询等操作。
交给小编管理员 
### 管理员管理
- 注册一个超级管理员， 一个人 
- 添加管理员 

/ -> 注册超级管机员页面 -> 登录 
/ -> 登录页 
      -》 跳转到单词书管理

## shadcn/ui UI 组件库
- 80% 前端组件业务趋同，不用
重复造轮子，选用第三方组件库。
- element-ui / ANT Design
- shadcn 定制性很好，tailwindcss 配合使用
  语义化， ai 友好
  按需加载
- 目录在 components/ui 目录下

## supabase 
BAAS 数据库云服务
性能、安全、可扩展性、部署成本
几乎为0
- psql embeeding + 关系数据库

**Conventional Commits（约定式提交）** 规范，也是目前最主流的 Git 提交信息风格。
- feat 新增功能
- fix 修复 bug
- docs 文档变更
- refactor 代码重构
- style 样式变更
- test 测试变更
- chore 构建工具变更
coding agent 内置的git 提交

## ORM

- 数据库supabase 已云端部署
.env DATABASE_URL
- next.js面向对象编程 Object 
 user 
 drizzle-orm 映射  翻译
 psql User Table  低级 sql
- drizzle 接受数据库 .env
不需要建表，建schema 映射的就是数据表
migrations 数据表迁移

## drizzle-orm
ORM 工具的一种，有一系列的包和命令
-db 目录
- inex.ts 数据库配置
链接并返回db 数据库操作句柄
- schema.ts 数据库映射
对象定义数据表结构
- 配套一系列脚本 drizzle-kit 
 - generate  生成数据库迁移文件
  
 - migrate  运行数据库迁移文件

 ## words 表
 github 下载zip->json 文件(178kb)
想创建一个words表，导入这个数据？ json ->sql/csv直接导入数据库
可以让ai生成一个转化的脚本

## 数据清洗
- 常见的后端功能
script/
 解决一些问题 爬虫、数据格式转换等等
 ai来做？上下文比较大，上下文窗口限制，token开销大
 可以让ai创建一个数据清洗脚本

 - RLS
 行安全words公共表没必要开启，而每个用户的背单词记录需要开启
 - prompt 执行上下文考虑
 1. 给prompt 添加充足的上下文
 2. 隐藏上下文开销，不让AI去读文件，给他文件的格式

 ## 让ai了解supabase 有books表
 - 