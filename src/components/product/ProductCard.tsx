"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Rotate3d } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import Price from "@/components/ui/Price";
import StockBadge from "@/components/ui/StockBadge";
import { AddToCartButton, CompareButton, FavoriteButton } from "./ProductActions";
import QuickView from "./QuickView";

export default function ProductCard({ p, priority = false }: { p: CardProduct; priority?: boolean }) {
  const [quick, setQuick] = useState(false);
  return (
    <>
      <article className="card group relative flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:border-red/40 hover:shadow-[var(--shadow-lift)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={p.image}
            alt={`${p.name} – ${p.tagline}`}
            fill
            priority={priority}
            sizes="(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw"
            className="packshot object-contain p-6 transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]"
          />
          {p.model3d && (
            <Link
              href={`/urunler/${p.slug}#3d`}
              className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-red px-2.5 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white shadow-[0_6px_16px_-6px_rgba(200,16,46,0.8)] transition hover:bg-red-dark"
            >
              <Rotate3d size={13} />
              360° 3D İncele
            </Link>
          )}
          {p.isNew && !p.model3d && (
            <span className="absolute left-3 top-3 rounded-lg bg-ink px-2.5 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white">Yeni</span>
          )}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <FavoriteButton p={p} />
            <CompareButton p={p} className="max-md:hidden" />
          </div>
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="absolute inset-x-3 bottom-3 z-10 hidden h-10 translate-y-3 items-center justify-center gap-2 rounded-xl bg-white/95 text-[12px] font-semibold uppercase tracking-wider text-ink opacity-0 shadow-sm backdrop-blur transition-all duration-300 hover:bg-ink hover:text-white group-hover:translate-y-0 group-hover:opacity-100 md:flex"
          >
            <Eye size={15} /> Hızlı İncele
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-body/80">{p.categoryName}</p>
          <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight text-ink sm:text-[18px]">
            <Link href={`/urunler/${p.slug}`} className="after:absolute after:inset-0 after:z-0 after:content-['']">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-[12px] text-red">{p.sku}</p>
          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-body">{p.shortDescription}</p>

          {p.keySpecs.length > 0 && (
            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-[12px]">
              {p.keySpecs.map((s) => (
                <div key={s.label} className="flex gap-1.5">
                  <dt className="text-body/70">{s.label}</dt>
                  <dd className="font-mono font-medium text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto pt-4">
            <StockBadge stock={p.stock} leadTimeDays={p.leadTimeDays} price={p.price} />
            <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
              <Price price={p.price} size="sm" />
              <AddToCartButton p={p} size="sm" />
            </div>
          </div>
        </div>
      </article>
      {quick && <QuickView p={p} onClose={() => setQuick(false)} />}
    </>
  );
}
