import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Reveal from "@/components/ui/Reveal";
import { getCategories, getProducts } from "@/lib/catalog";
import { GROUPS } from "@/lib/data/taxonomy";

export const metadata: Metadata = {
  title: "Kategoriler",
  description: "Laboratuvar cihazları, ölçüm ve analiz, laboratuvar gereçleri ve kurulum çözümleri: tüm ürün kategorileri.",
  alternates: { canonical: "/kategoriler" },
};

export default function CategoriesPage() {
  const cats = getCategories();
  const products = getProducts();
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Kategoriler", href: "/kategoriler" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Tüm Kategoriler</h1>
      {GROUPS.map((g) => {
        const list = cats.filter((c) => c.group === g.id);
        if (!list.length) return null;
        return (
          <section key={g.id} className="mt-14">
            <h2 className="eyebrow border-b border-line pb-3">{g.name}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {list.map((c, i) => {
                const n = products.filter((p) => p.category === c.slug).length;
                return (
                  <Reveal key={c.slug} delay={(i % 4) * 0.05}>
                    <Link href={`/kategori/${c.slug}`} className="card group flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:border-red hover:shadow-[var(--shadow-lift)]">
                      <div className="relative aspect-[4/3] bg-gray-50">
                        {c.image ? (
                          <Image src={c.image} alt="" fill sizes="(min-width:1280px) 22vw, 45vw" className="packshot object-contain p-5 transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center font-mono text-[11px] uppercase tracking-[0.16em] text-gray-300">Yakında</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-[16px] font-semibold text-ink">{c.name}</h3>
                          <p className="mt-0.5 font-mono text-[11px] text-body">{n > 0 ? `${n} ürün` : "Teklif ile"}</p>
                        </div>
                        <ArrowUpRight size={18} className="text-body transition group-hover:text-red" />
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
