import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export default async function SignInLayout({ children }: { children: React.ReactNode }) {
  const [current, existing] = await Promise.all([
    getCurrentAdmin(),
    db.select({ id: adminUsers.id }).from(adminUsers).limit(1),
  ]);

  if (current) redirect("/books");
  if (existing.length === 0) redirect("/signup");
  return children;
}
