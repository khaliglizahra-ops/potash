"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { GitCompareArrows, X } from "lucide-react";
import { MAX_COMPARE, useShop } from "@/store/shop";
import { useShopValue } from "@/store/hooks";

export default function CompareBar() {
  const pathname = usePathname();
  const items = useShopValue((s) => s.compare, []);
  const remove = useShop((s) => s.removeCompare);
  const clear = useShop((s) => s.clearCompare);
  const hidden = pathname === "/karsilastir" || pathname.startsWith("/admin") || pathname.startsWith("/odeme") || /^\/urunler\/[^/]+$/.test(pathname);

  return (
    <AnimatePresence>
      {items.length > 0 && !hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-[84px] z-40 mx-auto flex max-w-[640px] items-center gap-3 rounded-2xl border border-line bg-white p-2.5 pl-4 shadow-[var(--shadow-lift)] lg:bottom-6"
        >
          <GitCompareArrows size={18} className="hidden text-red sm:block" />
          <ul className="flex flex-1 items-center gap-2">
            {items.map((p) => (
              <li key={p.slug} className="group relative h-12 w-12 overflow-hidden rounded-lg bg-gray-50">
                <Image src={p.image} alt={p.name} fill sizes="48px" className="packshot object-contain p-1" />
                <button onClick={() => remove(p.slug)} aria-label={`${p.name} karşılaştırmadan çıkar`} className="absolute inset-0 grid place-items-center bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100">
                  <X size={16} />
                </button>
              </li>
            ))}
            {Array.from({ length: MAX_COMPARE - items.length }).map((_, i) => (
              <li key={i} className="hidden h-12 w-12 rounded-lg border border-dashed border-gray-300 sm:block" />
            ))}
          </ul>
          <button onClick={clear} className="hidden text-[12px] font-semibold text-body hover:text-red sm:block">Temizle</button>
          <Link href="/karsilastir" className={`btn btn-primary btn-sm ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}>
            Karşılaştır ({items.length})
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
