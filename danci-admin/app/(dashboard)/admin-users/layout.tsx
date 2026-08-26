import { redirect } from "next/navigation";

import { getCurrentAdmin, isSystemAdmin } from "@/lib/auth-server";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!isSystemAdmin(user)) redirect("/books");
  return children;
}
