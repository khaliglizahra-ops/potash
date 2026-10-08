import type { Metadata } from "next";
import { Clock, Phone, ShieldCheck, Wrench } from "lucide-react";
import { Suspense } from "react";
import QuoteClient from "@/components/shop/QuoteClient";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kurumsal Teklif Talebi",
  description: "Laboratuvar cihazları ve anahtar teslim laboratuvar projeleri için kurumsal teklif isteyin. 1 iş günü içinde dönüş.",
  alternates: { canonical: "/teklif-al" },
};

export default function QuotePage() {
  const products = Object.fromEntries(getProducts().map((p) => [p.slug, `${p.name}${p.name.includes(p.sku) ? "" : ` (${p.sku})`}`]));
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Teklif Al", href: "/teklif-al" }]} />
      <div className="mt-5 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Kurumsal</p>
          <h1 className="mt-3 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Teklif Talebi</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">İhtiyacınızı yazın; adet, kurulum ve teslimata göre net fiyatı 1 iş günü içinde iletelim.</p>
          <div className="mt-10">
            <Suspense><QuoteClient products={products} /></Suspense>
          </div>
        </div>
        <aside className="space-y-5 lg:pt-24">
          {[
            [Clock, "1 iş günü içinde dönüş", "Satış mühendisimiz talebinizi inceleyip sizi arar."],
            [Wrench, "Kurulum ve eğitim dahil", "Ankara içi siparişlerde yerinde kurulum ve kullanıcı eğitimi."],
            [ShieldCheck, "Resmî teklif ve sözleşme", "Kurumsal fatura, ihale ve kamu alımlarına uygun belgeler."],
          ].map(([I, t, d]) => {
            const Icon = I as typeof Clock;
            return (
              <div key={t as string} className="flex gap-4 rounded-[16px] border border-line p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gray-50 text-red"><Icon size={20} /></span>
                <div><p className="font-semibold text-ink">{t as string}</p><p className="mt-1 text-[14px] leading-relaxed text-body">{d as string}</p></div>
              </div>
            );
          })}
          <a href="tel:+903123956613" className="flex items-center gap-3 rounded-[16px] bg-ink p-6 text-white transition hover:bg-red">
            <Phone size={20} />
            <span><span className="block font-mono text-[11px] uppercase tracking-widest text-white/60">Hemen konuşalım</span><span className="text-lg font-semibold">+90 312 395 66 13</span></span>
          </a>
        </aside>
      </div>
    </div>
  );
}
