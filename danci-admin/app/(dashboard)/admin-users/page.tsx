import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

import { AdminUsersClient, type AdminRecord } from "@/components/admin-user/admin-users-client";
import { getCurrentAdmin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export default async function AdminUsersPage() {
  const current = await getCurrentAdmin();
  if (!current) redirect("/signin");
  if (!isSystemAdmin(current)) redirect("/books");

  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));

  const admins: AdminRecord[] = rows.map((admin) => ({
    ...admin,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  }));

  return <AdminUsersClient initialAdmins={admins} currentId={current.id} />;
}
