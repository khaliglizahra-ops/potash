"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, TriangleAlert } from "lucide-react";
import { useUi } from "@/store/shop";

export default function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[84px] z-[95] flex flex-col items-center gap-2 px-4 lg:top-[96px] lg:items-end lg:pr-8">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white py-3 pl-3.5 pr-4 text-[14px] shadow-[var(--shadow-lift)]"
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${t.tone === "ok" ? "bg-emerald-500" : t.tone === "warn" ? "bg-amber-500" : "bg-ink"}`}>
              {t.tone === "ok" ? <Check size={15} /> : t.tone === "warn" ? <TriangleAlert size={14} /> : <Info size={15} />}
            </span>
            <p className="flex-1 font-medium text-ink">{t.text}</p>
            {t.action && (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 text-[12px] font-semibold uppercase tracking-wider text-red hover:underline">
                {t.action.label}
              </Link>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
