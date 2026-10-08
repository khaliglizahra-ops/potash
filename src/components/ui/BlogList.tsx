"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ArticleCard from "@/components/ui/ArticleCard";
import { ARTICLE_CATEGORIES } from "@/lib/data/article-categories";
import type { Article } from "@/lib/types";

/** Category filter runs in the browser, so the blog page itself stays static. */
export default function BlogList({ articles }: { articles: Article[] }) {
  const kategori = useSearchParams().get("kategori") ?? "";
  const list = kategori ? articles.filter((a) => a.category === kategori) : articles;
  const [first, ...rest] = list;
  const chip = (active: boolean) => `rounded-full border px-4 py-2 text-[13px] font-medium transition ${active ? "border-red bg-red text-white" : "border-gray-300 bg-white text-ink hover:border-red hover:text-red"}`;
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/bilgi-merkezi" className={chip(!kategori)}>Tümü</Link>
        {ARTICLE_CATEGORIES.map((c) => <Link key={c.slug} href={`/bilgi-merkezi?kategori=${c.slug}`} className={chip(kategori === c.slug)}>{c.name}</Link>)}
      </div>
      {first ? (
        <div className="mt-10 space-y-5">
          <ArticleCard a={first} featured />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rest.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
        </div>
      ) : (
        <p className="mt-16 text-center text-body">Bu kategoride henüz yazı yok.</p>
      )}
    </>
  );
}
