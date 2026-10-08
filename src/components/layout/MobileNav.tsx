"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, Heart, Home, Search, ShoppingBag } from "lucide-react";
import { cartTotals, useUi } from "@/store/shop";
import { useShopValue } from "@/store/hooks";

export default function MobileNav() {
  const pathname = usePathname();
  const setSearch = useUi((s) => s.setSearch);
  const fav = useShopValue((s) => s.favorites.length, 0);
  const cart = useShopValue((s) => cartTotals(s.cart).count, 0);

  // product detail pages carry their own sticky CTA bar
  const hide = /^\/urunler\/[^/]+$/.test(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/odeme");
  if (hide) return null;

  const item = (active: boolean) => `relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-semibold tracking-wide transition active:scale-90 ${active ? "text-red" : "text-body"}`;
  const dot = "absolute right-[calc(50%-20px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 font-mono text-[9px] font-semibold text-white";

  return (
    <nav aria-label="Mobil gezinme" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl">
        <Link href="/" className={item(pathname === "/")}><Home size={21} />Ana Sayfa</Link>
        <Link href="/kategoriler" className={item(pathname.startsWith("/kategori"))}><Grid2x2 size={21} />Kategoriler</Link>
        <button onClick={() => setSearch(true)} className={item(false)}>
          <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-red text-white shadow-[0_10px_22px_-8px_rgba(200,16,46,0.8)]"><Search size={20} /></span>
          Ara
        </button>
        <Link href="/favoriler" className={item(pathname === "/favoriler")}><Heart size={21} />Favoriler{fav > 0 && <span className={dot}>{fav}</span>}</Link>
        <Link href="/sepet" className={item(pathname === "/sepet")}><ShoppingBag size={21} />Sepet{cart > 0 && <span className={dot}>{cart}</span>}</Link>
      </div>
    </nav>
  );
}
