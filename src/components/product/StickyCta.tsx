"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { formatTRY } from "@/lib/text";
import { useShop, useUi } from "@/store/shop";

/** Mobile-only bottom bar on product pages. */
export default function StickyCta({ card }: { card: CardProduct }) {
  const add = useShop((s) => s.addToCart);
  const setCart = useUi((s) => s.setCart);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(23,23,23,0.35)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2.5">
        <div className="min-w-0 pr-1">
          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-body">{card.sku}</p>
          <p className="text-[15px] font-semibold leading-tight text-ink">{card.price === null ? <>Teklif <span className="text-red">Al</span></> : formatTRY(card.price)}</p>
        </div>
        <Link href={`/teklif-al?urun=${card.slug}`} className={`btn h-12 flex-1 px-3 ${card.price === null ? "btn-primary" : "btn-ghost"}`}>Teklif Al</Link>
        <button
          className={`btn h-12 flex-1 px-3 ${card.price === null ? "btn-ghost" : "btn-primary"}`}
          onClick={() => {
            add(card, 1);
            if (card.price !== null) setCart(true);
          }}
        >
          <ShoppingBag size={16} /> Sepete Ekle
        </button>
      </div>
    </div>
  );
}
