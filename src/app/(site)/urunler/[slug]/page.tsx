import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BuyBox from "@/components/product/BuyBox";
import ProductCard from "@/components/product/ProductCard";
import ProductMedia from "@/components/product/ProductMedia";
import ProductTabs from "@/components/product/ProductTabs";
import StickyCta from "@/components/product/StickyCta";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHead from "@/components/ui/SectionHead";
import { getBrand, getCategory, getProduct, getProducts, toCard } from "@/lib/catalog";
import { JsonLd, productLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const title = p.seoTitle ?? `${p.name}${p.name.includes(p.sku) ? "" : ` (${p.sku})`} | ${p.tagline}`;
  const description = p.seoDescription ?? `${p.name}: ${p.shortDescription} Ankara'da üretim, kurulum ve servis. ${p.price === null ? "Kurumsal teklif alın." : "Hemen sipariş verin."}`;
  return {
    title,
    description,
    alternates: { canonical: `/urunler/${p.slug}` },
    openGraph: { title, description, images: p.images.slice(0, 1), type: "website" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = getCategory(p.category);
  const brand = getBrand(p.brand);
  const card = toCard(p);
  const related = getProducts()
    .filter((x) => x.slug !== p.slug && x.category === p.category)
    .concat(getProducts().filter((x) => x.slug !== p.slug && x.category !== p.category && x.brand === p.brand))
    .slice(0, 4)
    .map(toCard);

  return (
    <>
      <div className="container-x pt-8 sm:pt-10">
        <Breadcrumb
          items={[
            { name: "Ürünler", href: "/urunler" },
            ...(cat ? [{ name: cat.name, href: `/kategori/${cat.slug}` }] : []),
            { name: p.name, href: `/urunler/${p.slug}` },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14 xl:gap-20">
          <ProductMedia name={p.name} images={p.images} modelUrl={p.model3d} />
          <BuyBox product={p} card={card} brandName={brand?.name ?? ""} categoryName={cat?.name ?? ""} />
        </div>
        <ProductTabs product={p} />
      </div>

      {related.length > 0 && (
        <section className="container-x mt-10 pb-28 lg:pb-0">
          <SectionHead eyebrow="Benzer ürünler" title="Bunlara da göz atın" href={cat ? `/kategori/${cat.slug}` : "/urunler"} cta="Kategoriye git" />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </section>
      )}

      <StickyCta card={card} />
      <JsonLd data={productLd(p, brand?.name ?? "Potash", cat?.name ?? "")} />
    </>
  );
}
