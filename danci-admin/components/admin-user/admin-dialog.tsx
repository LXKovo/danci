"use client";

import { useState } from "react";
import { LockKeyhole, Mail, ShieldCheck, User, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminRole } from "@/lib/db/schema";

export interface AdminFormValue {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: Omit<AdminFormValue, "password">;
  onSubmit: (data: AdminFormValue) => Promise<string | null>;
}

export function AdminDialog({ open, onOpenChange, initialValue, onSubmit }: AdminDialogProps) {
  const [form, setForm] = useState<AdminFormValue>(() =>
    initialValue
      ? { ...initialValue, password: "" }
      : { name: "", email: "", password: "", role: "admin" }
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const editing = Boolean(initialValue);

  function update(field: keyof AdminFormValue, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const nextError = await onSubmit(form);
    setSubmitting(false);
    if (nextError) return setError(nextError);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserRoundPlus className="size-4 text-primary" />{editing ? "编辑管理员" : "添加管理员"}</DialogTitle>
          <DialogDescription>{editing ? "更新账号资料、角色或登录密码。" : "为团队成员创建后台账号。"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField icon={User} label="姓名" id="admin-name"><Input id="admin-name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：王老师" className="pl-8" required /></FormField>
          <FormField icon={Mail} label="邮箱" id="admin-email"><Input id="admin-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" className="pl-8" required /></FormField>
          <div className="space-y-1.5">
            <Label htmlFor="admin-role">角色</Label>
            <Select value={form.role} onValueChange={(value) => update("role", value)}>
              <SelectTrigger id="admin-role" className="h-9 w-full"><ShieldCheck className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="admin">管理员</SelectItem><SelectItem value="system-admin">系统管理员</SelectItem></SelectContent>
            </Select>
          </div>
          <FormField icon={LockKeyhole} label={editing ? "新密码（可选）" : "初始密码"} id="admin-password"><Input id="admin-password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder={editing ? "留空则保持不变" : "至少 8 位"} className="pl-8" required={!editing} /></FormField>
          {error ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={submitting}>{submitting ? "保存中..." : "保存"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ icon: Icon, label, id, children }: { icon: typeof User; label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><div className="relative"><Icon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>;
}
