"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Phone, X } from "lucide-react";
import { useUi } from "@/store/shop";
import { Logo } from "./Header";
import type { MenuCategory } from "./types";

const GROUPS = [
  { id: "cihazlar", name: "Laboratuvar Cihazları" },
  { id: "olcum", name: "Ölçüm ve Analiz" },
  { id: "gerecler", name: "Laboratuvar Gereçleri" },
];

export default function MobileMenu({ categories }: { categories: MenuCategory[] }) {
  const open = useUi((s) => s.menuOpen);
  const setOpen = useUi((s) => s.setMenu);
  const [acc, setAcc] = useState<string | null>("cihazlar");
  const close = () => setOpen(false);
  const link = "flex h-14 items-center justify-between border-b border-line text-[17px] font-semibold text-ink";

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="menu" className="fixed inset-0 z-[85] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Menüyü kapat" className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={close} />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 flex h-full w-[88%] max-w-[380px] flex-col bg-white"
          >
            <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
              <Logo size="sm" />
              <button onClick={close} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-gray-50"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              {GROUPS.map((g) => (
                <div key={g.id}>
                  <button className={`${link} w-full`} onClick={() => setAcc(acc === g.id ? null : g.id)} aria-expanded={acc === g.id}>
                    {g.name}
                    <ChevronDown size={18} className={`transition ${acc === g.id ? "rotate-180 text-red" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {acc === g.id && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-line bg-gray-50/60">
                        {categories.filter((c) => c.group === g.id).map((c) => (
                          <li key={c.slug}>
                            <Link href={`/kategori/${c.slug}`} onClick={close} className="flex items-center justify-between px-3 py-3 text-[15px] font-medium text-ink active:text-red">
                              {c.name}<span className="font-mono text-[11px] text-body">{c.count || ""}</span>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {[
                ["Laboratuvar Çözümleri", "/cozumler"],
                ["Tüm Ürünler", "/urunler"],
                ["Markalar", "/markalar"],
                ["Bilgi Merkezi", "/bilgi-merkezi"],
                ["Hakkımızda", "/hakkimizda"],
                ["Teknik Destek", "/teknik-destek"],
                ["Hesabım", "/hesabim"],
              ].map(([l, h]) => (
                <Link key={h} href={h} onClick={close} className={link}>{l}</Link>
              ))}
            </div>
            <div className="space-y-3 border-t border-line p-5">
              <Link href="/teklif-al" onClick={close} className="btn btn-primary w-full">Kurumsal teklif al</Link>
              <a href="tel:+903123956613" className="flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"><Phone size={16} className="text-red" /> +90 312 395 66 13</a>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
