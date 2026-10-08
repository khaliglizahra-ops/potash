"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Rotate3d, X } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import Price from "@/components/ui/Price";
import StockBadge from "@/components/ui/StockBadge";
import { AddToCartButton, CompareButton, FavoriteButton } from "./ProductActions";

export default function QuickView({ p, onClose }: { p: CardProduct; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("lock-scroll");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("lock-scroll");
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="qv"
        className="fixed inset-0 z-[90] grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${p.name} hızlı inceleme`}
      >
        <button aria-label="Kapat" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-[20px] bg-white shadow-[var(--shadow-lift)] md:grid-cols-2"
        >
          <button onClick={onClose} aria-label="Kapat" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow hover:bg-red hover:text-white">
            <X size={18} />
          </button>
          <div className="relative aspect-square bg-gray-50 md:aspect-auto md:min-h-[420px]">
            <Image src={p.image} alt={p.name} fill sizes="(min-width:768px) 380px, 100vw" className="packshot object-contain p-8" />
            {p.model3d && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-red px-2.5 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white">
                <Rotate3d size={13} /> 3D Model Mevcut
              </span>
            )}
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <p className="eyebrow">{p.categoryName}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">{p.name}</h2>
            <p className="mt-1 font-mono text-[13px] text-red">{p.sku}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-body">{p.shortDescription}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-4 text-[13px]">
              {p.keySpecs.map((s) => (
                <div key={s.label}>
                  <dt className="text-body/70">{s.label}</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <StockBadge stock={p.stock} leadTimeDays={p.leadTimeDays} price={p.price} />
              </div>
            </dl>
            <div className="mt-5">
              <Price price={p.price} size="lg" />
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <AddToCartButton p={p} />
              <FavoriteButton p={p} className="!h-12 !w-12 !rounded-xl" />
              <CompareButton p={p} className="!h-12 !w-12 !rounded-xl" />
            </div>
            <Link href={`/urunler/${p.slug}`} onClick={onClose} className="mt-4 text-center text-[13px] font-semibold text-red hover:underline">
              Ürün sayfasına git →
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
