import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type { Listing } from "@/lib/catalog-core";
import { filtersToQuery, type Filters, type GroupKey } from "@/lib/filters";
import ProductCard from "@/components/product/ProductCard";
import FilterPanel from "./FilterPanel";
import SortSelect from "./SortSelect";

/** Presentational listing (filters + grid + pagination). Used by the server page and by the client-side demo. */
export default function ListingBody({ filters, basePath, hide = [], result: r }: { filters: Filters; basePath: string; hide?: GroupKey[]; result: Listing }) {
  const page = Math.min(filters.sayfa, r.pages);
  const href = (n: number) => {
    const qs = filtersToQuery({ ...filters, sayfa: n });
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <FilterPanel
      facets={r.facets}
      filters={filters}
      total={r.total}
      model3dCount={r.model3dCount}
      hide={hide}
      heading={
        <p className="text-[15px] text-ink" aria-live="polite">
          <b className="text-xl font-semibold tracking-tight">{r.total}</b> <span className="text-body">ürün</span>
        </p>
      }
      sortSlot={<SortSelect filters={filters} />}
    >
      {r.items.length === 0 ? (
        <div className="grid place-items-center rounded-[18px] border border-dashed border-gray-300 px-6 py-24 text-center">
          <div>
            <PackageSearch size={40} className="mx-auto text-gray-300" />
            <p className="mt-5 text-xl font-semibold text-ink">Bu kriterlere uygun ürün bulunamadı</p>
            <p className="mx-auto mt-2 max-w-md text-body">Filtreleri gevşetmeyi deneyin. Aradığınız cihaz katalogda yoksa özel üretim için bize yazın.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={basePath} className="btn btn-ghost">Filtreleri temizle</Link>
              <Link href="/teklif-al" className="btn btn-primary">Teklif iste</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
          {r.items.map((p, i) => (
            <ProductCard key={p.slug} p={p} priority={i < 3} />
          ))}
        </div>
      )}

      {r.pages > 1 && (
        <nav aria-label="Sayfalama" className="mt-12 flex items-center justify-center gap-1.5">
          {page > 1 && (
            <Link href={href(page - 1)} aria-label="Önceki sayfa" className="grid h-11 w-11 place-items-center rounded-xl border border-gray-300 hover:border-red hover:text-red"><ChevronLeft size={18} /></Link>
          )}
          {Array.from({ length: r.pages }).map((_, i) => (
            <Link
              key={i}
              href={href(i + 1)}
              aria-current={page === i + 1 ? "page" : undefined}
              className={`grid h-11 min-w-11 place-items-center rounded-xl border px-3 font-mono text-[14px] transition ${page === i + 1 ? "border-red bg-red text-white" : "border-gray-300 text-ink hover:border-red hover:text-red"}`}
            >
              {i + 1}
            </Link>
          ))}
          {page < r.pages && (
            <Link href={href(page + 1)} aria-label="Sonraki sayfa" className="grid h-11 w-11 place-items-center rounded-xl border border-gray-300 hover:border-red hover:text-red"><ChevronRight size={18} /></Link>
          )}
        </nav>
      )}
    </FilterPanel>
  );
}
