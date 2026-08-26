"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      const err = signIn(email, password);
      setSubmitting(false);
      if (err) {
        setError(err);
        return;
      }
      router.replace("/books");
    }, 350);
  }

  function fillDefault() {
    setEmail("admin@danci.com");
    setPassword("admin123");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          欢迎回来
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          登录你的管理后台，继续整理单词书。
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-base">管理员登录</CardTitle>
          <CardDescription>使用邮箱和密码登录</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-8"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="输入密码"
                  className="pl-8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "登录中…" : "登录"}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 rounded-b-xl border-t bg-muted/40 px-6 pb-5 pt-4">
          <p className="text-xs text-muted-foreground">
            管理员账号由超级管理员添加，不支持公开注册。
          </p>
          <button
            type="button"
            onClick={fillDefault}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            使用默认账号登录（admin@danci.com / admin123）
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}