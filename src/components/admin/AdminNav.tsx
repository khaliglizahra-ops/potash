"use client";

import { LogoWordmark } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, LifeBuoy, LogOut, Package, ShoppingCart, Tags, Layers, ExternalLink } from "lucide-react";

const ITEMS = [
  ["/admin", LayoutDashboard, "Panel"],
  ["/admin/urunler", Package, "Ürünler"],
  ["/admin/kategoriler", Layers, "Kategoriler"],
  ["/admin/markalar", Tags, "Markalar"],
  ["/admin/teklifler", FileText, "Teklif talepleri"],
  ["/admin/siparisler", ShoppingCart, "Siparişler"],
  ["/admin/destek", LifeBuoy, "Destek talepleri"],
] as const;

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <aside className="bg-ink text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5 lg:block">
        <Link href="/admin" className="inline-block"><LogoWordmark tone="light" size="sm" /></Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 lg:mt-3">Yönetim paneli</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:p-4">
        {ITEMS.map(([href, Icon, label]) => {
          const on = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition ${on ? "bg-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden space-y-1 border-t border-white/10 p-4 lg:block">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] text-white/70 hover:bg-white/10 hover:text-white"><ExternalLink size={17} /> Siteyi gör</Link>
        <Link href="/bilgi-merkezi" target="_blank" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] text-white/70 hover:bg-white/10 hover:text-white"><BookOpen size={17} /> Bilgi merkezi</Link>
        <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/giris"); router.refresh(); }} className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={17} /> Çıkış</button>
      </div>
    </aside>
  );
}
