"use client";

import { useCallback, useMemo, useState } from "react";
import { Pencil, Shield, ShieldCheck, Trash2, UserRoundPlus, Users } from "lucide-react";

import { AdminDialog, type AdminFormValue } from "@/components/admin-user/admin-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminRole } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

interface ApiResult {
  error?: string;
  admins?: AdminRecord[];
  admin?: AdminRecord;
}

interface AdminUsersClientProps {
  initialAdmins: AdminRecord[];
  currentId: string;
}

export function AdminUsersClient({ initialAdmins, currentId }: AdminUsersClientProps) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [deleting, setDeleting] = useState<AdminRecord | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-users");
      const data = (await response.json()) as ApiResult;
      if (!response.ok) throw new Error(data.error ?? "管理员列表加载失败");
      setAdmins(data.admins ?? []);
      setPageError(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "管理员列表加载失败");
    }
  }, []);

  const stats = useMemo(
    () => ({
      total: admins.length,
      system: admins.filter((admin) => admin.role === "system-admin").length,
      regular: admins.filter((admin) => admin.role === "admin").length,
    }),
    [admins]
  );

  async function saveAdmin(form: AdminFormValue) {
    const response = await fetch(editing ? `/api/admin-users/${editing.id}` : "/api/admin-users", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (!response) return "网络连接失败，请稍后重试";
    const data = (await response.json()) as ApiResult;
    if (!response.ok) return data.error ?? "保存失败";
    await loadAdmins();
    return null;
  }

  async function deleteAdmin() {
    if (!deleting) return;
    const response = await fetch(`/api/admin-users/${deleting.id}`, { method: "DELETE" }).catch(() => null);
    if (!response) return setPageError("网络连接失败，请稍后重试");
    const data = (await response.json()) as ApiResult;
    if (!response.ok) return setPageError(data.error ?? "删除失败");
    setDeleting(null);
    await loadAdmins();
  }

  function closeDialog(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditing(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"><Users className="size-3.5" />团队管理</span>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-heading text-2xl font-semibold sm:text-3xl">管理员管理</h1><p className="mt-1.5 text-sm text-muted-foreground">维护后台账号及访问角色。</p></div><Button onClick={() => { setEditing(null); setDialogOpen(true); }}><UserRoundPlus className="size-4" />添加管理员</Button></div>
      </header>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ label: "管理员总数", value: stats.total }, { label: "系统管理员", value: stats.system }, { label: "普通管理员", value: stats.regular }].map(({ label, value }) => <Card key={label} className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="font-heading text-xl font-semibold">{value}</p></Card>)}</div>
      {pageError ? <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{pageError}</p> : null}
      <Card className="overflow-hidden p-0"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead>管理员</TableHead><TableHead>角色</TableHead><TableHead className="hidden sm:table-cell">创建时间</TableHead><TableHead className="w-24 text-right">操作</TableHead></TableRow></TableHeader><TableBody>
        {admins.map((admin) => { const self = admin.id === currentId; const system = admin.role === "system-admin"; return <TableRow key={admin.id}><TableCell><div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback className="bg-primary/10 font-semibold text-primary">{admin.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="flex items-center gap-2 font-medium"><span className="truncate">{admin.name}</span>{self ? <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem]">我</span> : null}</p><p className="truncate text-xs text-muted-foreground">{admin.email}</p></div></div></TableCell><TableCell><Badge variant="outline" className={cn("font-medium", system ? "bg-primary/10 text-primary" : "bg-secondary")}>{system ? <ShieldCheck className="size-3" /> : <Shield className="size-3" />}{system ? "系统管理员" : "管理员"}</Badge></TableCell><TableCell className="hidden text-muted-foreground sm:table-cell">{new Intl.DateTimeFormat("zh-CN").format(new Date(admin.createdAt))}</TableCell><TableCell><div className="flex justify-end"><Button variant="ghost" size="icon" title="编辑管理员" onClick={() => { setEditing(admin); setDialogOpen(true); }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" title={self ? "不能删除当前账号" : "删除管理员"} disabled={self} className="text-muted-foreground hover:text-destructive" onClick={() => setDeleting(admin)}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>; })}
        {admins.length === 0 ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">暂无管理员</TableCell></TableRow> : null}
      </TableBody></Table></Card>
      {dialogOpen ? <AdminDialog key={editing?.id ?? "new"} open onOpenChange={closeDialog} initialValue={editing ? { name: editing.name, email: editing.email, role: editing.role } : undefined} onSubmit={saveAdmin} /> : null}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} title="删除管理员" description={`确定删除「${deleting?.name ?? ""}」吗？该账号将立即无法登录。`} confirmLabel="删除" onConfirm={() => void deleteAdmin()} />
    </div>
  );
}
