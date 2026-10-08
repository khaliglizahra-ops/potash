import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import { getArticle, getArticles, getProduct, toCard } from "@/lib/catalog";
import { ARTICLE_CATEGORIES } from "@/lib/data/article-categories";
import { JsonLd, SITE } from "@/lib/seo";
import { formatDate } from "@/lib/text";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  return a ? { title: a.title, description: a.excerpt, alternates: { canonical: `/bilgi-merkezi/${a.slug}` }, openGraph: { type: "article", title: a.title, description: a.excerpt } } : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const cat = ARTICLE_CATEGORIES.find((c) => c.slug === a.category);
  const related = (a.relatedProducts ?? []).map(getProduct).filter(Boolean).map((p) => toCard(p!));
  const others = getArticles().filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Bilgi Merkezi", href: "/bilgi-merkezi" }, { name: a.title, href: `/bilgi-merkezi/${a.slug}` }]} />
      <article className="mx-auto mt-10 max-w-3xl">
        <Link href={`/bilgi-merkezi?kategori=${a.category}`} className="eyebrow hover:underline">{cat?.name}</Link>
        <h1 className="mt-4 text-[clamp(30px,4.4vw,54px)] font-semibold leading-[1.06] tracking-[-0.03em]">{a.title}</h1>
        <p className="mt-5 text-[19px] leading-relaxed text-body">{a.excerpt}</p>
        <p className="mt-6 border-y border-line py-4 font-mono text-[12px] text-body">{formatDate(a.publishedAt)} · {a.readingMinutes} dk okuma · Potash Teknik Ekip</p>
        <div className="mt-10">
          {a.body.map((t, i) =>
            t.startsWith("## ") ? (
              <h2 key={i} className="mb-3 mt-12 text-2xl font-semibold tracking-tight">{t.slice(3)}</h2>
            ) : (
              <p key={i} className="mt-4 text-[17px] leading-[1.85] text-body">{t}</p>
            ),
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Konuyla ilgili ürünler</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>
      )}
      <section className="mt-20 border-t border-line pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Diğer yazılar</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">{others.map((o) => <li key={o.id}><Link href={`/bilgi-merkezi/${o.slug}`} className="card block p-6 hover:border-red"><span className="eyebrow">{ARTICLE_CATEGORIES.find((c) => c.slug === o.category)?.name}</span><span className="mt-3 block text-lg font-semibold leading-snug text-ink">{o.title}</span></Link></li>)}</ul>
      </section>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt, datePublished: a.publishedAt, image: a.image ? `${SITE}${a.image}` : undefined, author: { "@type": "Organization", name: "Potash" }, publisher: { "@type": "Organization", name: "Potash" }, mainEntityOfPage: `${SITE}/bilgi-merkezi/${a.slug}` }} />
    </div>
  );
}
