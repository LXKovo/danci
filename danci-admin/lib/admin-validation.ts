// zod 校验规则集中定义。
// 请求进来先 safeParse，不合规直接 400，业务逻辑拿到的都是合法数据。
import { z } from "zod";

// 复用的字段校验规则
const email = z.string().trim().email("请输入有效的邮箱地址").max(255);
const name = z.string().trim().min(1, "请输入姓名").max(100, "姓名不能超过 100 个字符");
// 密码最短 8 位、最长 72 位 —— 72 是 bcrypt 算法本身的上限
const password = z.string().min(8, "密码至少 8 位").max(72, "密码不能超过 72 位");
const role = z.enum(["system-admin", "admin"]);

// 注册：需确认密码，且两次必须一致
export const signUpSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"], // 错误信息挂到 confirmPassword 字段上
  });

// 登录：邮箱 + 任意非空密码
export const signInSchema = z.object({ email, password: z.string().min(1, "请输入密码") });

// 超管创建普通管理员
export const createAdminSchema = z.object({ name, email, password, role });

// 更新管理员：密码留空表示不改（空字符串或省略都不触发密码更新）
export const updateAdminSchema = z.object({
  name,
  email,
  role,
  password: z.union([z.literal(""), password]).optional(),
});
