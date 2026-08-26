import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export default async function SignUpLayout({ children }: { children: React.ReactNode }) {
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing.length > 0) redirect("/signin");
  return children;
}
