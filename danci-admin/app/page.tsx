import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth-server";

export default async function Home() {
  redirect((await getCurrentAdmin()) ? "/books" : "/signin");
}
