import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import DemoListing from "@/components/catalog/DemoListing";
import ListingView from "@/components/catalog/ListingView";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
import { DEMO } from "@/lib/demo";
import { hasActiveFilters, parseFilters } from "@/lib/filters";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) return {};
  if (DEMO) return { title: `${c.name} | Laboratuvar Cihazları`, description: c.description, alternates: { canonical: `/kategori/${slug}` } };
  const f = parseFilters(await searchParams, { kategori: [slug] });
  return {
    title: `${c.name} | Laboratuvar Cihazları`,
    description: c.description,
    alternates: { canonical: `/kategori/${slug}` },
    robots: hasActiveFilters({ ...f, kategori: [] }) || f.sayfa > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = getCategory(slug);
  if (!c) notFound();
  const f = DEMO ? null : parseFilters(await searchParams, { kategori: [slug] });
  const siblings = getCategories().filter((x) => x.group === c.group);
  const counts = new Map(getProducts().map((p) => [p.category, 0]));
  for (const p of getProducts()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#fff,#f5f6f7)]">
        <div className="container-x grid items-center gap-8 py-10 sm:py-14 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Breadcrumb items={[{ name: "Kategoriler", href: "/kategoriler" }, { name: c.name, href: `/kategori/${slug}` }]} />
            <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">{c.name}</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">{c.description}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/kategori/${s.slug}`}
                  aria-current={s.slug === slug ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${s.slug === slug ? "border-red bg-red text-white" : "border-gray-300 bg-white text-ink hover:border-red hover:text-red"}`}
                >
                  {s.name} <span className={`font-mono text-[11px] ${s.slug === slug ? "text-white/70" : "text-body"}`}>{counts.get(s.slug) ?? 0}</span>
                </Link>
              ))}
            </div>
          </div>
          {c.image && (
            <div className="relative mx-auto hidden aspect-square w-full max-w-[340px] md:block">
              <Image src={c.image} alt="" fill priority sizes="340px" className="packshot object-contain" />
            </div>
          )}
        </div>
      </section>
      <div className="container-x py-10 sm:py-12">
        {f ? (
          <ListingView filters={f} basePath={`/kategori/${slug}`} hide={["kategori"]} />
        ) : (
          <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-[18px] bg-gray-50" />}>
            <DemoListing basePath={`/kategori/${slug}`} fixed={{ kategori: [slug] }} hide={["kategori"]} />
          </Suspense>
        )}
      </div>
    </>
  );
}
