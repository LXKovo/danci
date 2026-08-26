import { redirect } from "next/navigation";

import { AppSidebar, SidebarMobile } from "@/components/app-sidebar";
import { getCurrentAdmin } from "@/lib/auth-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) redirect("/signin");

  return (
    <div className="min-h-dvh bg-background">
      <SidebarMobile user={user} />
      <div className="lg:flex">
        <AppSidebar user={user} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
