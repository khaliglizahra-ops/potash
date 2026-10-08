"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Factory, Minus, Phone, Plus, Rotate3d, ShoppingBag, Wrench } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { specRows } from "@/lib/product-utils";
import Price from "@/components/ui/Price";
import StockBadge from "@/components/ui/StockBadge";
import { useShop, useUi } from "@/store/shop";
import { CompareButton, FavoriteButton } from "./ProductActions";

export default function BuyBox({ product, card, brandName, categoryName }: { product: Product; card: CardProduct; brandName: string; categoryName: string }) {
  const [qty, setQty] = useState(1);
  const add = useShop((s) => s.addToCart);
  const setCart = useUi((s) => s.setCart);
  const quoteOnly = product.price === null;
  const rows = specRows(product).filter((r) => ["Hacim", "Sıcaklık aralığı", "Güç", "Kontrol sistemi", "İç ölçüler (G×Y×D)", "Dış ölçüler (G×Y×D)", "Ağırlık"].includes(r.label));

  return (
    <div className="lg:sticky lg:top-[100px]">
      <p className="eyebrow">{product.tagline}</p>
      <h1 className="mt-3 text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.05] tracking-[-0.03em]">{product.name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-body">
        <span>Ürün kodu: <b className="font-mono text-[14px] font-semibold text-red">{product.sku}</b></span>
        <span className="h-3 w-px bg-gray-300" />
        <span>Marka: <Link href={`/urunler?marka=${product.brand}`} className="font-semibold text-ink hover:text-red">{brandName}</Link></span>
        <span className="h-3 w-px bg-gray-300" />
        <Link href={`/kategori/${product.category}`} className="font-semibold text-ink hover:text-red">{categoryName}</Link>
      </div>

      {product.model3d && (
        <button
          onClick={() => window.dispatchEvent(new Event("open-3d"))}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red px-3 py-2 font-mono text-[11.5px] font-semibold uppercase tracking-wider text-white transition hover:bg-red-dark"
        >
          <Rotate3d size={14} /> 360° 3D incele
        </button>
      )}

      <p className="mt-5 text-[16px] leading-relaxed text-body">{product.shortDescription}</p>

      <div className="mt-7 flex items-end justify-between gap-4 border-y border-line py-6">
        <div>
          <Price price={product.price} size="lg" />
          {quoteOnly && <p className="mt-1.5 text-[13px] text-body">Fiyat; adet, kurulum ve teslimata göre teklifle belirlenir.</p>}
        </div>
        <StockBadge stock={product.stock} leadTimeDays={product.leadTimeDays} price={product.price} />
      </div>

      <div className="mt-6 hidden gap-3 lg:grid lg:grid-cols-[auto_1fr_1fr]">
        {!quoteOnly && (
          <div className="inline-flex h-12 items-center rounded-xl border border-gray-300">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt" className="grid h-12 w-11 place-items-center hover:text-red"><Minus size={15} /></button>
            <span className="w-8 text-center font-mono text-[14px]">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Artır" className="grid h-12 w-11 place-items-center hover:text-red"><Plus size={15} /></button>
          </div>
        )}
        <button
          onClick={() => {
            add(card, qty);
            if (!quoteOnly) setCart(true);
          }}
          className={`btn ${quoteOnly ? "btn-ghost" : "btn-primary"} h-12 ${quoteOnly ? "col-span-1" : ""}`}
        >
          <ShoppingBag size={17} /> Sepete Ekle
        </button>
        <Link href={`/teklif-al?urun=${product.slug}`} className={`btn h-12 ${quoteOnly ? "btn-primary col-span-2" : "btn-ghost"}`}>
          Teklif Al
        </Link>
      </div>
      <div className="mt-3 hidden gap-2 lg:flex">
        <CompareButton p={card} label className="flex-1 justify-center" />
        <FavoriteButton p={card} className="!h-12 !w-12 !rounded-xl" />
      </div>
      <div className="mt-4 flex gap-2 lg:hidden">
        <CompareButton p={card} label className="flex-1 justify-center" />
        <FavoriteButton p={card} className="!h-12 !w-12 !rounded-xl" />
      </div>

      {rows.length > 0 && (
        <dl className="mt-8 overflow-hidden rounded-[14px] border border-line">
          {rows.map((r, i) => (
            <div key={r.label} className={`grid grid-cols-[40%_1fr] gap-3 px-4 py-3 text-[14px] ${i % 2 ? "bg-white" : "bg-gray-50"}`}>
              <dt className="text-body">{r.label.replace(" (G×Y×D)", "")}</dt>
              <dd className="font-mono text-[13px] font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {product.specsDraft && <p className="mt-2 text-[12px] text-body/70">Değerler bilgilendirme amaçlıdır; kesin teknik föy teklifle birlikte iletilir.</p>}

      <ul className="mt-7 grid grid-cols-3 gap-3 text-[12.5px] text-ink">
        {[
          [Factory, "Ankara'da üretim"],
          [Wrench, "Kurulum ve eğitim"],
          [BadgeCheck, `${product.technicalSpecifications.warrantyMonths ?? 24} ay garanti`],
        ].map(([I, t]) => {
          const Icon = I as typeof Factory;
          return (
            <li key={t as string} className="flex flex-col items-start gap-2 rounded-xl bg-gray-50 p-3.5">
              <Icon size={19} className="text-red" />
              <span className="font-medium leading-tight">{t as string}</span>
            </li>
          );
        })}
      </ul>
      <a href="tel:+903123956613" className="mt-5 flex items-center gap-3 text-[14px] text-body hover:text-red"><Phone size={17} className="text-red" /> Uzmana danışın: <b className="text-ink">+90 312 395 66 13</b></a>
    </div>
  );
}
