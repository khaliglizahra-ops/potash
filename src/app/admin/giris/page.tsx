import { redirect } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdmin } from "@/lib/server/auth";

export default async function Page() {
  if (await isAdmin()) redirect("/admin");
  return <AdminLogin />;
}
