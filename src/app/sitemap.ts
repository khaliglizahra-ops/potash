import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getArticles, getCategories, getProducts } from "@/lib/catalog";
import { LEGAL } from "@/lib/data/legal";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_PUBLIC_DEMO !== "1") await connection();
  const now = new Date();
  const fixed = ["", "/urunler", "/kategoriler", "/markalar", "/cozumler", "/hakkimizda", "/teknik-destek", "/bilgi-merkezi", "/teklif-al"].map((p) => ({ url: SITE + p, lastModified: now, priority: p === "" ? 1 : 0.7 }));
  return [
    ...fixed,
    ...getCategories().map((c) => ({ url: `${SITE}/kategori/${c.slug}`, lastModified: now, priority: 0.8 })),
    ...getProducts().map((p) => ({ url: `${SITE}/urunler/${p.slug}`, lastModified: new Date(p.createdAt), priority: 0.9 })),
    ...getArticles().map((a) => ({ url: `${SITE}/bilgi-merkezi/${a.slug}`, lastModified: new Date(a.publishedAt), priority: 0.6 })),
    ...LEGAL.map((l) => ({ url: `${SITE}/yasal/${l.slug}`, lastModified: now, priority: 0.2 })),
  ];
}
