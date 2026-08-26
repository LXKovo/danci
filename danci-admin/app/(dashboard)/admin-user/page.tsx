"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Shield, Trash2, UserRoundPlus, Users } from "lucide-react";

import { useAuth, type User } from "@/lib/auth";
import { formatDate } from "@/lib/books";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddAdminDialog } from "@/components/admin-user/admin-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

export default function AdminUserPage() {
  const { user, admins, addAdmin, removeAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);

  const stats = useMemo(
    () => ({
      total: admins.length,
      superAdmins: admins.filter((a) => a.role === "super-admin").length,
      regular: admins.filter((a) => a.role === "admin").length,
    }),
    [admins]
  );

  function canDelete(target: User): boolean {
    // 超级管理员不可删除；不能删除自己
    return target.role !== "super-admin" && target.id !== user?.id;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Users className="size-3.5" />
          团队管理
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              管理员管理
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              查看并维护后台的所有管理员，添加团队成员。
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <UserRoundPlus className="size-4" />
            添加管理员
          </Button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "管理员总数", value: stats.total },
          { label: "超级管理员", value: stats.superAdmins },
          { label: "普通管理员", value: stats.regular },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-heading text-xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>管理员</TableHead>
              <TableHead>角色</TableHead>
              <TableHead className="hidden sm:table-cell">注册时间</TableHead>
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => {
              const isSelf = admin.id === user?.id;
              const isSuper = admin.role === "super-admin";
              const deletable = canDelete(admin);
              return (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                          {admin.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium">
                          <span className="truncate">{admin.name}</span>
                          {isSelf && (
                            <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem] text-accent-foreground">
                              我
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        isSuper
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {isSuper ? (
                        <ShieldCheck className="size-3" />
                      ) : (
                        <Shield className="size-3" />
                      )}
                      {isSuper ? "超级管理员" : "管理员"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(admin.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="移除管理员"
                        disabled={!deletable}
                        title={isSuper ? "超级管理员不可删除" : isSelf ? "不能删除自己" : "移除管理员"}
                        className="text-muted-foreground data-[disabled]:opacity-40 hover:text-destructive"
                        onClick={() => setDeleting(admin)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {admins.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  暂无管理员
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AddAdminDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addAdmin} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title="移除管理员"
        description={`确定要移除「${deleting?.name ?? ""}」的管理员权限吗？移除后将无法登录。`}
        confirmLabel="移除"
        onConfirm={() => {
          if (deleting) removeAdmin(deleting.id);
        }}
      />
    </div>
  );
}