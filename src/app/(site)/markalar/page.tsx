import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Reveal from "@/components/ui/Reveal";
import { getBrands, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Markalar",
  description: "Potash'ın kendi markası ve temsil ettiğimiz laboratuvar markaları.",
  alternates: { canonical: "/markalar" },
};

export default function BrandsPage() {
  const products = getProducts();
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Markalar", href: "/markalar" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Markalar</h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-body">Kendi ürettiğimiz Potash cihazlarının yanında, laboratuvarınızı tamamlayan seçilmiş markalar.</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getBrands().map((b, i) => {
          const n = products.filter((p) => p.brand === b.slug).length;
          return (
            <Reveal key={b.slug} delay={(i % 3) * 0.06}>
              <Link href={`/urunler?marka=${b.slug}`} className="card group flex h-full flex-col p-7 hover:-translate-y-1 hover:border-red hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-gray-50 text-[22px] font-semibold text-ink transition group-hover:bg-red group-hover:text-white">{b.name[0]}</span>
                  {b.own && <span className="rounded-md bg-red px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">Kendi markamız</span>}
                </div>
                <h2 className="mt-8 text-2xl font-semibold tracking-tight">{b.name}</h2>
                <p className="mt-1 font-mono text-[12px] text-body">{b.country}</p>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-body">{b.description}</p>
                <p className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[13px] font-semibold text-ink">
                  {n > 0 ? `${n} ürünü gör` : "Yakında"} <ArrowUpRight size={16} className="transition group-hover:text-red" />
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
