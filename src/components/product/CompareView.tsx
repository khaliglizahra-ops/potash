"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GitCompareArrows, Plus, Rotate3d, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { DEMO, loadCatalog } from "@/lib/demo";
import { dimensions, stockInfo } from "@/lib/product-utils";
import { formatTRY } from "@/lib/text";
import { MAX_COMPARE, useShop } from "@/store/shop";
import { useShopValue } from "@/store/hooks";

const ROWS: { label: string; get: (p: Product) => string }[] = [
  { label: "Fiyat", get: (p) => (p.price === null ? "Teklif ile" : `${formatTRY(p.price)} + KDV`) },
  { label: "Stok", get: (p) => stockInfo(p).label },
  { label: "Hacim", get: (p) => (p.technicalSpecifications.volumeL ? `${p.technicalSpecifications.volumeL} L` : "—") },
  { label: "Sıcaklık", get: (p) => (p.technicalSpecifications.tempMaxC !== undefined ? `${p.technicalSpecifications.tempMinC ?? "—"} … ${p.technicalSpecifications.tempMaxC} °C` : "—") },
  { label: "Güç", get: (p) => (p.technicalSpecifications.powerW ? `${p.technicalSpecifications.powerW} W` : "—") },
  { label: "Kontrol sistemi", get: (p) => p.technicalSpecifications.control ?? "—" },
  { label: "Boyut (G×Y×D)", get: (p) => dimensions(p.technicalSpecifications.outerMm) ?? "—" },
  { label: "Ağırlık", get: (p) => (p.technicalSpecifications.weightKg ? `${p.technicalSpecifications.weightKg} kg` : "—") },
  { label: "Garanti", get: (p) => (p.technicalSpecifications.warrantyMonths ? `${p.technicalSpecifications.warrantyMonths} ay` : "—") },
  { label: "3D Model", get: (p) => (p.model3d ? "Var" : "Yok") },
];

export default function CompareView() {
  const items = useShopValue((s) => s.compare, []);
  const remove = useShop((s) => s.removeCompare);
  const clear = useShop((s) => s.clearCompare);
  const [data, setData] = useState<Product[]>([]);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const key = items.map((i) => i.slug).join(",");

  useEffect(() => {
    if (!key) return;
    const source: Promise<Product[]> = DEMO
      ? loadCatalog().then((c) => c.products)
      : fetch(`/api/products?slugs=${key}`).then((r) => r.json());
    source.then((d: Product[]) => {
        setData(key.split(",").map((s) => d.find((p) => p.slug === s)).filter(Boolean) as Product[]);
        setLoaded(true);
      });
  }, [key]);

  const list = useMemo(() => (key ? data : []), [key, data]);
  const rows = useMemo(
    () =>
      ROWS.map((r) => {
        const vals = list.map(r.get);
        return { ...r, vals, differs: new Set(vals).size > 1 };
      }),
    [list],
  );

  if (!loaded && items.length) return <div className="mt-12 h-72 animate-pulse rounded-[18px] bg-gray-50" />;

  if (list.length === 0)
    return (
      <div className="mt-12 grid place-items-center rounded-[18px] border border-dashed border-gray-300 px-6 py-24 text-center">
        <div>
          <GitCompareArrows size={40} className="mx-auto text-gray-300" />
          <p className="mt-5 text-xl font-semibold text-ink">Karşılaştırılacak ürün seçilmedi</p>
          <p className="mx-auto mt-2 max-w-md text-body">Ürün kartlarındaki karşılaştır simgesine tıklayarak en fazla {MAX_COMPARE} ürün ekleyin.</p>
          <Link href="/urunler" className="btn btn-primary mt-6">Ürünlere git</Link>
        </div>
      </div>
    );

  const cols = `minmax(130px,170px) repeat(${MAX_COMPARE}, minmax(190px,1fr))`;
  const shown = rows.filter((r) => !onlyDiff || r.differs);

  return (
    <div className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-ink">
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="h-[18px] w-[18px] accent-[#c8102e]" />
          Yalnızca farkları göster
        </label>
        <button onClick={clear} className="text-[13px] font-semibold text-body hover:text-red">Listeyi temizle</button>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-line">
        <div className="min-w-[860px]" style={{ display: "grid", gridTemplateColumns: cols }}>
          {/* product header row */}
          <div className="sticky left-0 z-10 border-b border-line bg-white" />
          {Array.from({ length: MAX_COMPARE }).map((_, i) => {
            const p = list[i];
            return p ? (
              <div key={p.slug} className="relative border-b border-l border-line p-5">
                <button onClick={() => remove(p.slug)} aria-label={`${p.name} çıkar`} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-gray-50 text-body hover:bg-red hover:text-white"><X size={15} /></button>
                <Link href={`/urunler/${p.slug}`} className="group block">
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-gray-50">
                    <Image src={p.images[0]} alt={p.name} fill sizes="200px" className="packshot object-contain p-4 transition group-hover:scale-105" />
                    {p.model3d && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-red px-2 py-1 font-mono text-[9.5px] font-semibold uppercase text-white"><Rotate3d size={11} /> 3D</span>}
                  </span>
                  <span className="mt-3 block font-mono text-[11.5px] text-red">{p.sku}</span>
                  <span className="block text-[15px] font-semibold leading-snug text-ink group-hover:text-red">{p.name}</span>
                </Link>
              </div>
            ) : (
              <Link key={i} href="/urunler" className="group grid place-items-center border-b border-l border-dashed border-gray-300 p-5 text-center text-body transition hover:bg-gray-50 hover:text-red">
                <span><Plus size={26} className="mx-auto" /><span className="mt-2 block text-[13px] font-medium">Ürün ekle</span></span>
              </Link>
            );
          })}

          {shown.map((r, ri) => (
            <div key={r.label} className="contents">
              <div className={`sticky left-0 z-10 flex items-center px-5 py-4 font-mono text-[11.5px] font-semibold uppercase tracking-wider text-body ${ri % 2 ? "bg-white" : "bg-gray-50"}`}>{r.label}</div>
              {Array.from({ length: MAX_COMPARE }).map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center border-l border-line px-5 py-4 text-[14px] ${ri % 2 ? "bg-white" : "bg-gray-50"} ${r.differs && list[i] ? "font-semibold text-red" : "text-ink"}`}
                >
                  {list[i] ? r.vals[i] : ""}
                </div>
              ))}
            </div>
          ))}

          <div className="sticky left-0 border-t border-line bg-white" />
          {Array.from({ length: MAX_COMPARE }).map((_, i) => (
            <div key={i} className="border-l border-t border-line p-4">
              {list[i] && (
                <Link href={list[i].price === null ? `/teklif-al?urun=${list[i].slug}` : `/urunler/${list[i].slug}`} className="btn btn-primary btn-sm w-full">
                  {list[i].price === null ? "Teklif Al" : "Ürünü Gör"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
