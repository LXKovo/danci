"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "登录失败，请稍后重试");
        return;
      }
      router.replace("/books");
      router.refresh();
    } catch {
      setError("网络连接失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">欢迎回来</h1>
        <p className="mt-2 text-sm text-muted-foreground">登录管理后台，继续整理单词书。</p>
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
                <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="pl-8" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" autoComplete="current-password" placeholder="输入密码" className="pl-8" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
            </div>
            {error ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "登录中..." : "登录"}
              {submitting ? null : <ArrowRight className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
