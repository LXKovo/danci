"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenText, LogOut, Users } from "lucide-react";

import { Brand } from "@/components/brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AdminRole } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface SidebarUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

const navItems = [
  { href: "/books", label: "单词书", hint: "管理单词书", icon: BookOpenText },
  { href: "/admin-users", label: "管理员", hint: "管理团队", icon: Users, systemOnly: true },
];

function getVisibleNav(user: SidebarUser) {
  return navItems.filter((item) => !item.systemOnly || user.role === "system-admin");
}

async function signOut(router: ReturnType<typeof useRouter>) {
  await fetch("/api/auth/signout", { method: "POST" });
  router.replace("/signin");
  router.refresh();
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = user.name.slice(0, 1).toUpperCase();

  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-dvh lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5"><Brand variant="dark" /></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {getVisibleNav(user).map(({ href, label, hint, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}><span className={cn("grid size-9 place-items-center rounded-lg transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-primary")}><Icon className="size-4.5" /></span><span className="flex flex-col leading-tight"><span className="text-sm font-medium">{label}</span><span className="text-xs text-sidebar-foreground/50">{hint}</span></span></Link>;
        })}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-4"><div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback className="bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">{initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user.name}</p><p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p></div><Button variant="ghost" size="icon" aria-label="退出登录" title="退出登录" onClick={() => void signOut(router)} className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><LogOut className="size-4" /></Button></div></div>
    </aside>
  );
}

export function SidebarMobile({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = user.name.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/80 bg-sidebar px-4 py-3 lg:hidden">
      <Brand variant="dark" markClassName="size-8" />
      <nav className="ml-auto flex items-center gap-1 rounded-lg bg-sidebar-accent/60 p-1">{getVisibleNav(user).map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70")}><Icon className="size-3.5" />{label}</Link>; })}</nav>
      <Avatar className="size-8"><AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">{initials}</AvatarFallback></Avatar><Separator orientation="vertical" className="h-6 bg-sidebar-border" /><Button variant="ghost" size="icon" aria-label="退出登录" onClick={() => void signOut(router)} className="size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><LogOut className="size-4" /></Button>
    </header>
  );
}
