"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <li key={f.q}>
          <button className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-ink" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {f.q}
            <ChevronDown size={20} className={`shrink-0 transition ${open === i ? "rotate-180 text-red" : "text-body"}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="pb-6 pr-10 text-[16px] leading-relaxed text-body">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}
