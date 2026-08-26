"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "创建失败，请稍后重试");
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
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8"><Brand variant="light" /></div>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">创建系统管理员</CardTitle>
            <CardDescription>仅首次初始化可创建，之后请由系统管理员添加成员。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field icon={User} label="姓名" id="name"><Input id="name" autoComplete="name" placeholder="你的姓名" className="pl-8" value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field>
              <Field icon={Mail} label="邮箱" id="signup-email"><Input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" className="pl-8" value={form.email} onChange={(event) => update("email", event.target.value)} required /></Field>
              <Field icon={LockKeyhole} label="密码" id="signup-password"><Input id="signup-password" type="password" autoComplete="new-password" placeholder="至少 8 位" className="pl-8" value={form.password} onChange={(event) => update("password", event.target.value)} required /></Field>
              <Field icon={LockKeyhole} label="确认密码" id="confirm-password"><Input id="confirm-password" type="password" autoComplete="new-password" placeholder="再次输入密码" className="pl-8" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} required /></Field>
              {error ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "创建中..." : "创建并进入后台"}{submitting ? null : <ArrowRight className="size-4" />}
              </Button>
            </form>
            <p className="mt-5 text-center text-xs text-muted-foreground">已有账号？<Link href="/signin" className="font-medium text-primary hover:underline">返回登录</Link></p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, id, children }: { icon: typeof User; label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>;
}
