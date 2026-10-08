"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { LogoWordmark } from "@/components/ui/Logo";
import { useUi } from "@/store/shop";
import { useShopValue } from "@/store/hooks";
import { cartTotals } from "@/store/shop";
import MegaMenu from "./MegaMenu";
import type { MenuCategory } from "./types";

const NAV = [
  { label: "Cihazlar", href: "/urunler", mega: true },
  { label: "Laboratuvar Çözümleri", href: "/cozumler" },
  { label: "Ürünler", href: "/urunler" },
  { label: "Kategoriler", href: "/kategoriler" },
  { label: "Markalar", href: "/markalar" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Teknik Destek", href: "/teknik-destek" },
];

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Link href="/" aria-label="Nükleon Lab – Ana sayfa" className="flex shrink-0 items-center">
      <LogoWordmark size={size} />
    </Link>
  );
}

export default function Header({ categories }: { categories: MenuCategory[] }) {
  const pathname = usePathname();
  const [megaFor, setMegaFor] = useState<string | null>(null);
  const mega = megaFor === pathname;
  const setMega = (v: boolean) => setMegaFor(v ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const setSearch = useUi((s) => s.setSearch);
  const setCart = useUi((s) => s.setCart);
  const setMenu = useUi((s) => s.setMenu);
  const favCount = useShopValue((s) => s.favorites.length, 0);
  const cartCount = useShopValue((s) => cartTotals(s.cart).count, 0);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaFor(null);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/input|textarea/i.test((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearch]);

  const openMega = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(true), 90);
  };
  const closeMega = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(false), 160);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const iconBtn = "relative grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-gray-50 hover:text-red active:scale-90";
  const badge = "absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 font-mono text-[10px] font-semibold text-white";

  return (
    <>
      {/* utility bar */}
      <div className="hidden bg-ink text-[12px] text-white/80 lg:block">
        <div className="container-x flex h-9 items-center justify-between">
          <p className="font-mono uppercase tracking-[0.16em]">
            <span className="text-red-cta">●</span>&nbsp; Yerli üretim · Ankara İvedik OSB
          </p>
          <div className="flex items-center gap-6">
            <a href="tel:+903123956613" className="transition hover:text-white">+90 312 395 66 13</a>
            <a href="mailto:info@nukleonlab.com.tr" className="transition hover:text-white">info@nukleonlab.com.tr</a>
            <Link href="/teklif-al" className="font-semibold text-white transition hover:text-red-cta">Kurumsal teklif</Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b bg-white/92 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? "border-line shadow-[0_8px_30px_-18px_rgba(23,23,23,0.35)]" : "border-transparent"}`}
        onMouseLeave={closeMega}
      >
        <div className="container-x flex h-[68px] items-center gap-4 lg:h-[76px] lg:gap-10">
          <button className={`${iconBtn} -ml-2 lg:hidden`} aria-label="Menüyü aç" onClick={() => setMenu(true)}>
            <Menu size={22} />
          </button>

          <div className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
            <Logo />
          </div>

          <nav aria-label="Ana menü" className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {NAV.map((n) => {
              const active = isActive(n.href) && (n.label !== "Cihazlar" || false);
              return (
                <div key={n.label} className="relative" onMouseEnter={n.mega ? openMega : closeMega}>
                  <Link
                    href={n.href}
                    aria-haspopup={n.mega ? "true" : undefined}
                    aria-expanded={n.mega ? mega : undefined}
                    className={`group relative flex h-11 items-center gap-1 whitespace-nowrap px-3 text-[13.5px] font-semibold tracking-tight transition-colors xl:px-3.5 ${
                      active || (n.mega && mega) ? "text-red" : "text-ink hover:text-red"
                    }`}
                  >
                    {n.label}
                    {n.mega && <ChevronDown size={14} className={`transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />}
                    <span
                      className={`absolute inset-x-3.5 -bottom-[17px] h-[2px] origin-left bg-red transition-transform duration-300 ${active || (n.mega && mega) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              className="mr-1 hidden h-11 items-center gap-3 whitespace-nowrap rounded-full border border-line bg-gray-50 pl-4 pr-3 text-[13px] text-body transition hover:border-red/40 hover:bg-white 2xl:flex"
              onClick={() => setSearch(true)}
              aria-label="Ara"
            >
              <Search size={16} />
              Cihaz, kod veya marka ara
              <kbd className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-body">⌘K</kbd>
            </button>
            <button className={`${iconBtn} 2xl:hidden`} onClick={() => setSearch(true)} aria-label="Ara">
              <Search size={20} />
            </button>
            <Link href="/favoriler" className={`${iconBtn} max-sm:hidden`} aria-label="Favoriler">
              <Heart size={20} />
              {favCount > 0 && <span className={badge}>{favCount}</span>}
            </Link>
            <Link href="/hesabim" className={`${iconBtn} max-sm:hidden`} aria-label="Hesabım">
              <User size={20} />
            </Link>
            <button className={iconBtn} onClick={() => setCart(true)} aria-label="Sepet">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={badge}>{cartCount}</span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              key="mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-[0_40px_60px_-30px_rgba(23,23,23,0.28)] lg:block"
              onMouseEnter={openMega}
            >
              <MegaMenu categories={categories} onNavigate={() => setMega(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
