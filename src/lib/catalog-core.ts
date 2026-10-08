import { ARTICLE_CATEGORIES } from "./data/article-categories";
import { FIXED_GROUPS, type Bucket, type Filters, type GroupKey } from "./filters";
import { fold } from "./text";
import type { Article, Brand, Category, Product } from "./types";

/**
 * Pure catalogue logic (no database, no server-only imports): the same code filters/searches
 * on the server (real site) and in the browser (static demo build).
 */
export interface Ctx {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  articles: Article[];
}

/** Lightweight shape sent to client components (cards, search, cart, compare). */
export interface CardProduct {
  slug: string;
  name: string;
  sku: string;
  tagline: string;
  shortDescription: string;
  category: string;
  categoryName: string;
  brand: string;
  brandName: string;
  price: number | null;
  stock: number;
  leadTimeDays: number;
  image: string;
  model3d: boolean;
  isNew: boolean;
  keySpecs: { label: string; value: string }[];
}

export function toCard(p: Product, ctx: Pick<Ctx, "categories" | "brands">): CardProduct {
  const t = p.technicalSpecifications;
  const keySpecs: { label: string; value: string }[] = [];
  if (t.volumeL) keySpecs.push({ label: "Hacim", value: `${t.volumeL} L` });
  if (t.tempMaxC !== undefined) keySpecs.push({ label: "Sıcaklık", value: `${t.tempMinC ?? ""}${t.tempMinC !== undefined ? "…" : "maks. "}${t.tempMaxC} °C` });
  if (keySpecs.length < 2 && t.powerW) keySpecs.push({ label: "Güç", value: `${t.powerW} W` });
  if (keySpecs.length < 2 && t.extra?.[0]) keySpecs.push({ label: t.extra[0].label, value: t.extra[0].value });
  return {
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    tagline: p.tagline,
    shortDescription: p.shortDescription,
    category: p.category,
    categoryName: ctx.categories.find((c) => c.slug === p.category)?.name ?? "",
    brand: p.brand,
    brandName: ctx.brands.find((b) => b.slug === p.brand)?.name ?? "",
    price: p.price,
    stock: p.stock,
    leadTimeDays: p.leadTimeDays,
    image: p.images[0] ?? "",
    model3d: !!p.model3d,
    isNew: p.isNew,
    keySpecs: keySpecs.slice(0, 2),
  };
}

// ----------------------------------------------------------------- listing
const GROUP_KEYS: GroupKey[] = ["kategori", "marka", "fiyat", "stok", "hacim", "sicaklik", "guc", "boyut", "tip"];

const passes = (p: Product, group: GroupKey, ids: string[]): boolean => {
  if (!ids.length) return true;
  switch (group) {
    case "kategori":
      return ids.includes(p.category);
    case "marka":
      return ids.includes(p.brand);
    case "tip":
      return ids.includes(p.type);
    default: {
      const buckets = FIXED_GROUPS[group].buckets as Bucket[];
      return buckets.filter((b) => ids.includes(b.id)).some((b) => b.test(p));
    }
  }
};

function applyAll(ctx: Ctx, f: Filters, skip?: GroupKey) {
  return ctx.products.filter(
    (p) =>
      GROUP_KEYS.every((g) => g === skip || passes(p, g, f[g] as string[])) &&
      (!f.model3d || !!p.model3d) &&
      (!f.q || scoreProduct(p, f.q, ctx) > 0),
  );
}

function sortProducts(list: Product[], sort: Filters["sirala"]) {
  const out = [...list];
  switch (sort) {
    case "yeni":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "fiyat-artan":
      return out.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "fiyat-azalan":
      return out.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    default:
      return out.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(!!b.model3d) - Number(!!a.model3d) ||
          Number(b.stock > 0) - Number(a.stock > 0) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }
}

export interface Facet {
  key: GroupKey;
  title: string;
  options: { id: string; label: string; count: number }[];
}
export interface Listing {
  total: number;
  items: CardProduct[];
  pageSize: number;
  pages: number;
  facets: Facet[];
  model3dCount: number;
}
export const PAGE_SIZE = 12;

export function queryProducts(f: Filters, ctx: Ctx): Listing {
  const all = ctx.products;
  const matched = sortProducts(applyAll(ctx, f), f.sirala);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(f.sayfa, pages);
  const items = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => toCard(p, ctx));
  const types = [...new Set(all.map((p) => p.type))];
  const count = (group: GroupKey, test: (p: Product) => boolean) => applyAll(ctx, f, group).filter(test).length;

  const facets: Facet[] = [
    {
      key: "kategori",
      title: "Kategori",
      options: [...ctx.categories]
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ id: c.slug, label: c.name, count: count("kategori", (p) => p.category === c.slug) }))
        .filter((o) => o.count > 0 || f.kategori.includes(o.id)),
    },
    {
      key: "marka",
      title: "Marka",
      options: ctx.brands
        .map((b) => ({ id: b.slug, label: b.name, count: count("marka", (p) => p.brand === b.slug) }))
        .filter((o) => o.count > 0 || f.marka.includes(o.id)),
    },
    ...(["fiyat", "stok", "hacim", "sicaklik", "guc", "boyut"] as const).map((key) => ({
      key: key as GroupKey,
      title: FIXED_GROUPS[key].title,
      options: (FIXED_GROUPS[key].buckets as Bucket[]).map((b) => ({ id: b.id, label: b.label, count: count(key, b.test) })),
    })),
    { key: "tip", title: "Ürün tipi", options: types.map((t) => ({ id: t, label: t, count: count("tip", (p) => p.type === t) })) },
  ];

  return {
    total: matched.length,
    items,
    pageSize: PAGE_SIZE,
    pages,
    facets,
    model3dCount: applyAll(ctx, { ...f, model3d: false }).filter((p) => !!p.model3d).length,
  };
}

// ------------------------------------------------------------------ search
function scoreProduct(p: Product, q: string, ctx: Pick<Ctx, "categories" | "brands">): number {
  const tokens = fold(q).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  const cat = ctx.categories.find((c) => c.slug === p.category)?.name ?? "";
  const brand = ctx.brands.find((b) => b.slug === p.brand)?.name ?? "";
  const fields: [string, number][] = [
    [p.name, 6],
    [p.sku, 6],
    [p.tagline, 4],
    [cat, 3],
    [brand, 3],
    [p.shortDescription, 2],
    [p.description, 1],
    [(p.technicalSpecifications.extra ?? []).map((e) => `${e.label} ${e.value}`).join(" "), 1],
  ];
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const [text, w] of fields) {
      const ft = fold(text);
      if (ft.includes(t)) best = Math.max(best, w * (ft.startsWith(t) || ft.includes(` ${t}`) ? 1.4 : 1));
    }
    if (!best) return 0; // every token has to match something
    total += best;
  }
  return total;
}

export interface SearchResult {
  products: CardProduct[];
  categories: { slug: string; name: string; group: string; productCount: number }[];
  brands: { slug: string; name: string; productCount: number }[];
  articles: { slug: string; title: string; categoryName: string; excerpt: string }[];
  totalProducts: number;
}

export function search(q: string, ctx: Ctx, limit = 6): SearchResult {
  const term = q.trim();
  if (!term) return { products: [], categories: [], brands: [], articles: [], totalProducts: 0 };
  const tokens = fold(term).split(/\s+/).filter(Boolean);
  const all = ctx.products;
  const scored = all
    .map((p) => ({ p, s: scoreProduct(p, term, ctx) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  const hit = (text: string) => tokens.every((t) => fold(text).includes(t));
  const categories = [...ctx.categories]
    .sort((a, b) => a.order - b.order)
    .filter((c) => hit(c.name) || hit(c.description))
    .map((c) => ({ slug: c.slug, name: c.name, group: c.group, productCount: all.filter((p) => p.category === c.slug).length }))
    .sort((a, b) => Number(hit(b.name)) - Number(hit(a.name)))
    .slice(0, 5);
  const brands = ctx.brands
    .filter((b) => hit(b.name))
    .map((b) => ({ slug: b.slug, name: b.name, productCount: all.filter((p) => p.brand === b.slug).length }))
    .slice(0, 4);
  const articles = ctx.articles
    .filter((a) => hit(`${a.title} ${a.excerpt} ${a.body.join(" ")}`))
    .slice(0, 4)
    .map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, categoryName: ARTICLE_CATEGORIES.find((c) => c.slug === a.category)?.name ?? "" }));
  return { products: scored.slice(0, limit).map((x) => toCard(x.p, ctx)), categories, brands, articles, totalProducts: scored.length };
}
