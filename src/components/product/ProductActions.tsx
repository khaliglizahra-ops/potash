"use client";

import Link from "next/link";
import { GitCompareArrows, Heart, ShoppingBag } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { useShop, useUi } from "@/store/shop";
import { useShopValue } from "@/store/hooks";

export function FavoriteButton({ p, className = "" }: { p: CardProduct; className?: string }) {
  const on = useShopValue((s) => s.favorites.some((f) => f.slug === p.slug), false);
  const toggle = useShop((s) => s.toggleFavorite);
  return (
    <button
      type="button"
      aria-label={on ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(p);
      }}
      className={`grid h-10 w-10 place-items-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition hover:border-red hover:text-red active:scale-90 ${className}`}
    >
      <Heart size={18} className={on ? "fill-red text-red" : ""} />
    </button>
  );
}

export function CompareButton({ p, className = "", label = false }: { p: CardProduct; className?: string; label?: boolean }) {
  const on = useShopValue((s) => s.compare.some((c) => c.slug === p.slug), false);
  const toggle = useShop((s) => s.toggleCompare);
  return (
    <button
      type="button"
      aria-label={on ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(p);
      }}
      className={
        label
          ? `inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition active:scale-95 ${on ? "border-red bg-red/5 text-red" : "border-gray-300 text-ink hover:border-red hover:text-red"} ${className}`
          : `grid h-10 w-10 place-items-center rounded-full border bg-white/95 shadow-sm transition active:scale-90 ${on ? "border-red text-red" : "border-line text-ink hover:border-red hover:text-red"} ${className}`
      }
    >
      <GitCompareArrows size={18} />
      {label && (on ? "Karşılaştırmada" : "Karşılaştır")}
    </button>
  );
}

export function AddToCartButton({ p, qty = 1, size = "md", className = "" }: { p: CardProduct; qty?: number; size?: "sm" | "md"; className?: string }) {
  const add = useShop((s) => s.addToCart);
  const setCart = useUi((s) => s.setCart);
  if (p.price === null)
    return (
      <Link href={`/teklif-al?urun=${p.slug}`} className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""} ${className}`}>
        Teklif Al
      </Link>
    );
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(p, qty);
        setCart(false);
      }}
      className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      <ShoppingBag size={size === "sm" ? 15 : 17} />
      {size === "sm" ? "Sepete Ekle" : "SEPETE EKLE"}
    </button>
  );
}
