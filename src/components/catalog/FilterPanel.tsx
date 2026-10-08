"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Rotate3d, SlidersHorizontal, X } from "lucide-react";
import type { Facet } from "@/lib/catalog";
import { filtersToQuery, hasActiveFilters, type Filters, type GroupKey, MULTI_KEYS } from "@/lib/filters";

interface Props {
  facets: Facet[];
  filters: Filters;
  total: number;
  model3dCount: number;
  hide?: GroupKey[];
  /** wraps the page's results so we can dim them while navigating */
  children: React.ReactNode;
  sortSlot: React.ReactNode;
  heading: React.ReactNode;
}

export default function FilterPanel({ facets, filters, total, model3dCount, hide = [], children, sortSlot, heading }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ kategori: true, marka: true, fiyat: true, stok: true, hacim: true });

  useEffect(() => {
    document.body.classList.toggle("lock-scroll", sheet);
    return () => document.body.classList.remove("lock-scroll");
  }, [sheet]);

  const go = (next: Filters) => {
    const qs = filtersToQuery({ ...next, sayfa: 1 });
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const toggle = (key: GroupKey, id: string) => {
    const cur = filters[key as keyof Filters] as string[];
    go({ ...filters, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const clear = () => go({ ...filters, kategori: hide.includes("kategori") ? filters.kategori : [], marka: [], fiyat: [], stok: [], hacim: [], sicaklik: [], guc: [], boyut: [], tip: [], model3d: false, q: "" });

  const active = hasActiveFilters({ ...filters, kategori: hide.includes("kategori") ? [] : filters.kategori });
  const labelOf = (key: GroupKey, id: string) => facets.find((f) => f.key === key)?.options.find((o) => o.id === id)?.label ?? id;
  const chips = MULTI_KEYS.filter((k) => !hide.includes(k)).flatMap((k) => (filters[k as keyof Filters] as string[]).map((id) => ({ key: k, id, label: labelOf(k, id) })));

  const panel = (
    <div className="space-y-1">
      <label className="mb-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-gray-50 p-3.5 transition hover:border-red/40">
        <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
          <Rotate3d size={18} className="text-red" /> 3D model mevcut
          <span className="font-mono text-[11px] font-normal text-body">{model3dCount}</span>
        </span>
        <span className="relative inline-flex">
          <input type="checkbox" checked={filters.model3d} onChange={() => go({ ...filters, model3d: !filters.model3d })} className="peer sr-only" />
          <span className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-red peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      {facets
        .filter((f) => !hide.includes(f.key))
        .map((f) => {
          const isOpen = open[f.key] ?? false;
          const selected = (filters[f.key as keyof Filters] as string[]).length;
          return (
            <div key={f.key} className="border-t border-line">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => ({ ...o, [f.key]: !isOpen }))}
                className="flex w-full items-center justify-between py-4 text-left text-[14px] font-semibold text-ink"
              >
                <span className="flex items-center gap-2">
                  {f.title}
                  {selected > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 font-mono text-[10px] text-white">{selected}</span>}
                </span>
                <ChevronDown size={17} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-red" : "text-body"}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="-mx-1 overflow-hidden px-1"
                  >
                    <div className="space-y-0.5 pb-4">
                      {f.options.map((o) => {
                        const checked = (filters[f.key as keyof Filters] as string[]).includes(o.id);
                        const dim = o.count === 0 && !checked;
                        return (
                          <li key={o.id}>
                            <label className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] transition hover:bg-gray-50 ${dim ? "opacity-40" : ""}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggle(f.key, o.id)} className="peer sr-only" />
                              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border border-gray-300 bg-white transition peer-checked:border-red peer-checked:bg-red peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                                <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2 5 8.6l4.5-5" /></svg>
                              </span>
                              <span className="flex-1 text-ink">{o.label}</span>
                              <span className="font-mono text-[11px] text-body">{o.count}</span>
                            </label>
                          </li>
                        );
                      })}
                    </div>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[272px_1fr] xl:gap-14">
      {/* desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-[100px] max-h-[calc(100dvh-120px)] overflow-y-auto pr-2 no-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><SlidersHorizontal size={16} className="text-red" /> Filtrele</h2>
            {active && <button onClick={clear} className="text-[12px] font-semibold text-red hover:underline">Temizle</button>}
          </div>
          {panel}
        </div>
      </aside>

      <div className={`min-w-0 transition-opacity duration-300 ${pending ? "opacity-50" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSheet(true)} className="btn btn-ghost btn-sm lg:hidden"><SlidersHorizontal size={15} /> Filtrele{active ? " •" : ""}</button>
            {heading}
          </div>
          {sortSlot}
        </div>

        {(chips.length > 0 || filters.model3d || filters.q) && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {filters.q && <Chip label={`“${filters.q}”`} onRemove={() => go({ ...filters, q: "" })} />}
            {filters.model3d && <Chip label="3D model mevcut" onRemove={() => go({ ...filters, model3d: false })} />}
            {chips.map((c) => <Chip key={c.key + c.id} label={c.label} onRemove={() => toggle(c.key, c.id)} />)}
            <button onClick={clear} className="ml-1 text-[12px] font-semibold text-red hover:underline">Tümünü temizle</button>
          </div>
        )}

        <div className="pt-6">{children}</div>
      </div>

      {/* mobile sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div key="sheet" className="fixed inset-0 z-[88] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Filtreler">
            <button className="absolute inset-0 bg-ink/45 backdrop-blur-sm" aria-label="Kapat" onClick={() => setSheet(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[22px] bg-white"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-lg font-semibold text-ink">Filtrele</h2>
                <button onClick={() => setSheet(false)} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-50"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">{panel}</div>
              <div className="flex gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button onClick={clear} className="btn btn-ghost flex-1">Temizle</button>
                <button onClick={() => setSheet(false)} className="btn btn-primary flex-[2]">{total} ürünü göster</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button onClick={onRemove} className="group inline-flex items-center gap-1.5 rounded-full border border-red/30 bg-red/[0.04] py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-ink transition hover:border-red">
      {label}
      <X size={14} className="text-red transition group-hover:rotate-90" />
    </button>
  );
}
