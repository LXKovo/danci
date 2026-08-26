import { z } from "zod";

const email = z.string().trim().email("请输入有效的邮箱地址").max(255);
const name = z.string().trim().min(1, "请输入姓名").max(100, "姓名不能超过 100 个字符");
const password = z.string().min(8, "密码至少 8 位").max(72, "密码不能超过 72 位");
const role = z.enum(["system-admin", "admin"]);

export const signUpSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({ email, password: z.string().min(1, "请输入密码") });

export const createAdminSchema = z.object({ name, email, password, role });

export const updateAdminSchema = z.object({
  name,
  email,
  role,
  password: z.union([z.literal(""), password]).optional(),
});
