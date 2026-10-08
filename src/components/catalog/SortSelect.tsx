"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { filtersToQuery, SORTS, type Filters, type SortId } from "@/lib/filters";

export default function SortSelect({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();
  return (
    <label className="relative inline-flex items-center gap-3 text-[13px] text-body">
      <span className="hidden sm:inline">Sırala</span>
      <span className="relative">
        <select
          value={filters.sirala}
          aria-label="Sıralama"
          onChange={(e) => {
            const qs = filtersToQuery({ ...filters, sirala: e.target.value as SortId, sayfa: 1 });
            start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
          }}
          className="h-11 cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-[14px] font-medium text-ink transition hover:border-red focus:border-red"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
      </span>
    </label>
  );
}
