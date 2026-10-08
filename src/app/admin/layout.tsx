import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: { default: "Yönetim", template: "%s | Nükleon Yönetim" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin();
  if (!ok) return <div className="min-h-dvh bg-gray-50">{children}</div>;
  return (
    <div className="min-h-dvh bg-gray-50 lg:grid lg:grid-cols-[248px_1fr]">
      <AdminNav />
      <main className="min-w-0 p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
