"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { formatTRY } from "@/lib/text";
import { FREE_SHIPPING_FROM } from "@/lib/product-utils";
import { cartTotals, useShop } from "@/store/shop";
import { useShopValue } from "@/store/hooks";

export function Summary({ cta, cardNote = false }: { cta?: React.ReactNode; cardNote?: boolean }) {
  const cart = useShopValue((s) => s.cart, []);
  const t = cartTotals(cart);
  const remain = Math.max(0, FREE_SHIPPING_FROM - t.subtotal);
  return (
    <div className="rounded-[18px] border border-line bg-gray-50 p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-ink">Sipariş özeti</h2>
      <dl className="mt-5 space-y-2.5 text-[14.5px]">
        <div className="flex justify-between"><dt>Ara toplam ({t.count} ürün)</dt><dd className="font-medium text-ink">{formatTRY(t.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>KDV (%20)</dt><dd className="font-medium text-ink">{formatTRY(t.vat)}</dd></div>
        <div className="flex justify-between"><dt>Kargo</dt><dd className="font-medium text-ink">{t.shipping === 0 ? "Ücretsiz" : formatTRY(t.shipping)}</dd></div>
        <div className="flex justify-between border-t border-gray-300 pt-4 text-xl"><dt className="font-semibold text-ink">Toplam</dt><dd className="font-semibold text-ink">{formatTRY(t.total)}</dd></div>
      </dl>
      {t.subtotal > 0 && remain > 0 && <p className="mt-4 rounded-lg bg-white px-3.5 py-2.5 text-[13px] text-ink"><b>{formatTRY(remain)}</b> daha ekleyin, kargo ücretsiz olsun.</p>}
      {cta && <div className="mt-6">{cta}</div>}
      <ul className="mt-6 space-y-2.5 text-[13px] text-body">
        <li className="flex items-center gap-2.5"><ShieldCheck size={16} className="text-red" /> {cardNote ? "Kart bilgileri iyzico güvenli ödeme sayfasında girilir" : "Siparişiniz Potash satış ekibince onaylanır"}</li>
        <li className="flex items-center gap-2.5"><Truck size={16} className="text-red" /> Kurumsal faturalı sevkiyat</li>
      </ul>
    </div>
  );
}

export default function CartView({ cardNote = false }: { cardNote?: boolean }) {
  const cart = useShopValue((s) => s.cart, []);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeFromCart);
  const err = useSearchParams().get("odeme");

  if (cart.length === 0)
    return (
      <div className="mt-12 grid place-items-center rounded-[18px] border border-dashed border-gray-300 px-6 py-24 text-center">
        <div>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gray-50 text-body"><ShoppingBag size={26} /></span>
          <p className="mt-5 text-xl font-semibold text-ink">Sepetiniz boş</p>
          <p className="mx-auto mt-2 max-w-md text-body">Fiyatı listelenen ürünleri sepete ekleyebilir; profesyonel cihazlar için kurumsal teklif isteyebilirsiniz.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/urunler" className="btn btn-primary">Ürünlere git</Link>
            <Link href="/teklif-al" className="btn btn-ghost">Teklif iste</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px] xl:gap-14">
      <div>
        {err && <p role="alert" className="mb-5 rounded-xl border border-red/30 bg-red/[0.04] px-4 py-3 text-[14px] text-ink">Ödeme tamamlanamadı. Sepetiniz korundu; tekrar deneyebilirsiniz.</p>}
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((l) => (
            <li key={l.slug} className="grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[112px_1fr_auto] sm:gap-6">
              <Link href={`/urunler/${l.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                <Image src={l.p.image} alt="" fill sizes="112px" className="packshot object-contain p-2" />
              </Link>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-wider text-body">{l.p.categoryName}</p>
                <Link href={`/urunler/${l.slug}`} className="mt-1 block text-[17px] font-semibold leading-snug text-ink hover:text-red">{l.p.name}</Link>
                <p className="mt-1 font-mono text-[12px] text-red">{l.p.sku}</p>
                <p className="mt-2 text-[13px] text-body">Birim: {formatTRY(l.p.price ?? 0)} + KDV</p>
                <div className="mt-4 flex items-center gap-4 sm:hidden">
                  <Stepper qty={l.qty} onChange={(q) => setQty(l.slug, q)} />
                  <button onClick={() => remove(l.slug)} className="text-[13px] text-body hover:text-red">Kaldır</button>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
                <p className="text-lg font-semibold text-ink">{formatTRY((l.p.price ?? 0) * l.qty)}</p>
                <div className="hidden items-center gap-4 sm:flex">
                  <Stepper qty={l.qty} onChange={(q) => setQty(l.slug, q)} />
                  <button onClick={() => remove(l.slug)} aria-label="Sepetten çıkar" className="grid h-10 w-10 place-items-center rounded-full text-body hover:bg-gray-50 hover:text-red"><Trash2 size={18} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/urunler" className="mt-6 inline-block text-[14px] font-semibold text-ink hover:text-red">← Alışverişe devam et</Link>
      </div>
      <div className="lg:sticky lg:top-[100px]">
        <Summary cardNote={cardNote} cta={<Link href="/odeme" className="btn btn-primary w-full">Ödemeye geç</Link>} />
        <p className="mt-4 text-center text-[13px] text-body">Toplu alım mı yapıyorsunuz? <Link href="/teklif-al" className="font-semibold text-red hover:underline">Kurumsal teklif alın</Link></p>
      </div>
    </div>
  );
}

function Stepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className="inline-flex h-10 items-center rounded-lg border border-gray-300">
      <button onClick={() => onChange(qty - 1)} disabled={qty <= 1} aria-label="Azalt" className="grid h-10 w-10 place-items-center hover:text-red disabled:opacity-30"><Minus size={14} /></button>
      <span className="w-8 text-center font-mono text-[13px]" aria-live="polite">{qty}</span>
      <button onClick={() => onChange(qty + 1)} aria-label="Artır" className="grid h-10 w-10 place-items-center hover:text-red"><Plus size={14} /></button>
    </div>
  );
}
