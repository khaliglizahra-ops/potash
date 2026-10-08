"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CardProduct } from "@/lib/catalog";
import { VAT_RATE, FREE_SHIPPING_FROM, SHIPPING_FLAT } from "@/lib/product-utils";

export type Snapshot = CardProduct;

export interface Line {
  slug: string;
  qty: number;
  p: Snapshot;
}

interface Toast {
  id: number;
  text: string;
  tone?: "ok" | "info" | "warn";
  action?: { label: string; href: string };
}

interface ShopState {
  cart: Line[];
  favorites: Snapshot[];
  compare: Snapshot[];

  addToCart: (p: Snapshot, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;

  toggleFavorite: (p: Snapshot) => void;
  toggleCompare: (p: Snapshot) => void;
  removeCompare: (slug: string) => void;
  clearCompare: () => void;
}

interface UiState {
  searchOpen: boolean;
  cartOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  setSearch: (v: boolean) => void;
  setCart: (v: boolean) => void;
  setMenu: (v: boolean) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

export const MAX_COMPARE = 4;
let toastSeq = 1;

export const useUi = create<UiState>((set, get) => ({
  searchOpen: false,
  cartOpen: false,
  menuOpen: false,
  toasts: [],
  setSearch: (v) => set({ searchOpen: v, ...(v ? { cartOpen: false, menuOpen: false } : {}) }),
  setCart: (v) => set({ cartOpen: v, ...(v ? { searchOpen: false, menuOpen: false } : {}) }),
  setMenu: (v) => set({ menuOpen: v, ...(v ? { searchOpen: false, cartOpen: false } : {}) }),
  toast: (t) => {
    const id = toastSeq++;
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      compare: [],

      addToCart: (p, qty = 1) => {
        if (p.price === null) {
          useUi.getState().toast({ text: "Bu ürün için fiyat teklif ile belirlenir.", tone: "info", action: { label: "Teklif al", href: `/teklif-al?urun=${p.slug}` } });
          return;
        }
        const cart = get().cart;
        const hit = cart.find((l) => l.slug === p.slug);
        set({
          cart: hit ? cart.map((l) => (l.slug === p.slug ? { ...l, qty: Math.min(99, l.qty + qty), p } : l)) : [...cart, { slug: p.slug, qty, p }],
        });
        useUi.getState().toast({ text: `${p.name} sepete eklendi`, tone: "ok", action: { label: "Sepete git", href: "/sepet" } });
      },
      setQty: (slug, qty) =>
        set({ cart: get().cart.map((l) => (l.slug === slug ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)) }),
      removeFromCart: (slug) => set({ cart: get().cart.filter((l) => l.slug !== slug) }),
      clearCart: () => set({ cart: [] }),

      toggleFavorite: (p) => {
        const has = get().favorites.some((f) => f.slug === p.slug);
        set({ favorites: has ? get().favorites.filter((f) => f.slug !== p.slug) : [p, ...get().favorites] });
        useUi.getState().toast({
          text: has ? "Favorilerden çıkarıldı" : "Favorilere eklendi",
          tone: has ? "info" : "ok",
          action: has ? undefined : { label: "Favoriler", href: "/favoriler" },
        });
      },
      toggleCompare: (p) => {
        const cur = get().compare;
        if (cur.some((c) => c.slug === p.slug)) {
          set({ compare: cur.filter((c) => c.slug !== p.slug) });
          return;
        }
        if (cur.length >= MAX_COMPARE) {
          useUi.getState().toast({ text: `En fazla ${MAX_COMPARE} ürün karşılaştırabilirsiniz.`, tone: "warn" });
          return;
        }
        set({ compare: [...cur, p] });
      },
      removeCompare: (slug) => set({ compare: get().compare.filter((c) => c.slug !== slug) }),
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "nukleon-shop-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function cartTotals(cart: Line[]) {
  const subtotal = cart.reduce((s, l) => s + (l.p.price ?? 0) * l.qty, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
  return { subtotal, vat, shipping, total: subtotal + vat + shipping, count: cart.reduce((s, l) => s + l.qty, 0) };
}
