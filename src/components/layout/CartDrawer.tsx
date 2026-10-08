"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatTRY } from "@/lib/text";
import { FREE_SHIPPING_FROM } from "@/lib/product-utils";
import { cartTotals, useShop, useUi } from "@/store/shop";
import { useShopValue } from "@/store/hooks";
import { useEffect } from "react";

export default function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const setOpen = useUi((s) => s.setCart);
  const cart = useShopValue((s) => s.cart, []);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeFromCart);
  const t = cartTotals(cart);
  const remain = Math.max(0, FREE_SHIPPING_FROM - t.subtotal);

  useEffect(() => {
    document.body.classList.toggle("lock-scroll", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="cart" className="fixed inset-0 z-[85]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Sepet">
          <button aria-label="Sepeti kapat" className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-[var(--shadow-lift)]"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-line px-6">
              <h2 className="text-lg font-semibold text-ink">
                Sepetim <span className="font-mono text-[13px] font-normal text-body">({t.count})</span>
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-gray-50 hover:text-red">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gray-50 text-body"><ShoppingBag size={26} /></span>
                  <p className="mt-5 text-lg font-semibold text-ink">Sepetiniz boş</p>
                  <p className="mt-1.5 text-[14px] text-body">Fiyatı listelenen ürünleri sepete ekleyebilir, profesyonel cihazlar için teklif isteyebilirsiniz.</p>
                  <Link href="/urunler" onClick={() => setOpen(false)} className="btn btn-primary mt-6">Cihazları keşfet</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-4">
                  <p className="text-[13px] text-ink">
                    {remain === 0 ? <><b className="text-red">Kargo ücretsiz.</b> Siparişiniz ücretsiz gönderilecek.</> : <><b>{formatTRY(remain)}</b> daha ekleyin, kargo ücretsiz olsun.</>}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <motion.div className="h-full rounded-full bg-red" initial={false} animate={{ width: `${Math.min(100, (t.subtotal / FREE_SHIPPING_FROM) * 100)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                </div>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {cart.map((l) => (
                    <li key={l.slug} className="flex gap-4 py-5">
                      <Link href={`/urunler/${l.slug}`} onClick={() => setOpen(false)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                        <Image src={l.p.image} alt="" fill sizes="80px" className="packshot object-contain p-2" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <Link href={`/urunler/${l.slug}`} onClick={() => setOpen(false)} className="text-[14.5px] font-semibold leading-snug text-ink hover:text-red">{l.p.name}</Link>
                          <button onClick={() => remove(l.slug)} aria-label="Sepetten çıkar" className="text-body/60 hover:text-red"><Trash2 size={16} /></button>
                        </div>
                        <p className="mt-0.5 font-mono text-[11.5px] text-red">{l.p.sku}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-gray-300">
                            <button onClick={() => (l.qty > 1 ? setQty(l.slug, l.qty - 1) : remove(l.slug))} aria-label="Azalt" className="grid h-8 w-8 place-items-center hover:text-red"><Minus size={14} /></button>
                            <span className="w-8 text-center font-mono text-[13px]">{l.qty}</span>
                            <button onClick={() => setQty(l.slug, l.qty + 1)} aria-label="Artır" className="grid h-8 w-8 place-items-center hover:text-red"><Plus size={14} /></button>
                          </div>
                          <span className="font-semibold text-ink">{formatTRY((l.p.price ?? 0) * l.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line bg-gray-50 p-6">
                  <dl className="space-y-1.5 text-[14px]">
                    <div className="flex justify-between"><dt>Ara toplam</dt><dd className="font-medium text-ink">{formatTRY(t.subtotal)}</dd></div>
                    <div className="flex justify-between"><dt>KDV (%20)</dt><dd className="font-medium text-ink">{formatTRY(t.vat)}</dd></div>
                    <div className="flex justify-between"><dt>Kargo</dt><dd className="font-medium text-ink">{t.shipping === 0 ? "Ücretsiz" : formatTRY(t.shipping)}</dd></div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-lg"><dt className="font-semibold text-ink">Toplam</dt><dd className="font-semibold text-ink">{formatTRY(t.total)}</dd></div>
                  </dl>
                  <Link href="/odeme" onClick={() => setOpen(false)} className="btn btn-primary mt-5 w-full">Ödemeye geç</Link>
                  <Link href="/sepet" onClick={() => setOpen(false)} className="mt-3 block text-center text-[13px] font-semibold text-ink hover:text-red">Sepeti görüntüle</Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
