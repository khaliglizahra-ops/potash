import type { Metadata } from "next";
import { Suspense } from "react";
import DemoListing from "@/components/catalog/DemoListing";
import ListingView from "@/components/catalog/ListingView";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getBrand } from "@/lib/catalog";
import { DEMO } from "@/lib/demo";
import { hasActiveFilters, parseFilters } from "@/lib/filters";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const DESC = "İnkübatör, etüv, çeker ocak, güvenlik kabini, su banyosu ve analiz cihazları. Yerli üretim laboratuvar cihazlarını filtreleyin, 3D inceleyin, teklif alın.";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // the static demo cannot read the query string on the server
  if (DEMO) return { title: "Laboratuvar Cihazları", description: DESC, alternates: { canonical: "/urunler" } };
  const f = parseFilters(await searchParams);
  const filtered = hasActiveFilters(f) || f.sayfa > 1 || f.sirala !== "onerilen";
  return {
    title: f.q ? `“${f.q}” arama sonuçları` : "Laboratuvar Cihazları",
    description: DESC,
    alternates: { canonical: "/urunler" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const f = DEMO ? null : parseFilters(await searchParams);
  const brand = f && f.marka.length === 1 ? getBrand(f.marka[0]) : null;
  return (
    <>
      <section className="border-b border-line bg-[linear-gradient(180deg,#fff,#f5f6f7)]">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumb items={[{ name: "Ürünler", href: "/urunler" }]} />
          <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">
            {f?.q ? <>“{f.q}” <span className="text-body">için sonuçlar</span></> : brand ? `${brand.name} ürünleri` : "Laboratuvar Cihazları"}
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">
            {brand ? brand.description : "Ankara'da üretilen cihazlar ve seçilmiş markalar. Filtreleyin, karşılaştırın, 3D inceleyin."}
          </p>
        </div>
      </section>
      <div className="container-x py-10 sm:py-12">
        {f ? (
          <ListingView filters={f} basePath="/urunler" />
        ) : (
          <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-[18px] bg-gray-50" />}>
            <DemoListing basePath="/urunler" />
          </Suspense>
        )}
      </div>
    </>
  );
}
