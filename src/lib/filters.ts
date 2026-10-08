import type { Product } from "./types";

/** Client- and server-safe description of every listing filter. */

export type GroupKey = "kategori" | "marka" | "fiyat" | "stok" | "hacim" | "sicaklik" | "guc" | "boyut" | "tip";

export interface Bucket {
  id: string;
  label: string;
  test: (p: Product) => boolean;
}
export interface FilterGroup {
  key: GroupKey;
  title: string;
  buckets?: Bucket[]; // fixed buckets; kategori/marka/tip are dynamic (see catalog.ts)
}

const v = (n: number | undefined) => n ?? NaN;
const between = (x: number, lo: number, hi: number) => x >= lo && x < hi;

export const STOCK_BUCKETS: Bucket[] = [
  { id: "var", label: "Stokta", test: (p) => p.stock > 0 },
  { id: "siparis", label: "Siparişe özel üretim", test: (p) => p.stock === 0 },
];

export const PRICE_BUCKETS: Bucket[] = [
  { id: "teklif", label: "Teklif ile", test: (p) => p.price === null },
  { id: "0-10000", label: "10.000 ₺ altı", test: (p) => p.price !== null && p.price < 10_000 },
  { id: "10000-30000", label: "10.000 – 30.000 ₺", test: (p) => p.price !== null && between(p.price, 10_000, 30_000) },
  { id: "30000+", label: "30.000 ₺ üzeri", test: (p) => p.price !== null && p.price >= 30_000 },
];

export const VOLUME_BUCKETS: Bucket[] = [
  { id: "0-50", label: "50 L'ye kadar", test: (p) => between(v(p.technicalSpecifications.volumeL), 0, 50) },
  { id: "50-150", label: "50 – 150 L", test: (p) => between(v(p.technicalSpecifications.volumeL), 50, 150) },
  { id: "150-400", label: "150 – 400 L", test: (p) => between(v(p.technicalSpecifications.volumeL), 150, 401) },
  { id: "400+", label: "400 L üzeri", test: (p) => v(p.technicalSpecifications.volumeL) > 400 },
];

export const TEMP_BUCKETS: Bucket[] = [
  { id: "alt0", label: "0 °C altına inebilen", test: (p) => v(p.technicalSpecifications.tempMinC) < 0 },
  { id: "0-100", label: "Maks. 100 °C'ye kadar", test: (p) => between(v(p.technicalSpecifications.tempMaxC), 0, 101) },
  { id: "100-300", label: "Maks. 100 – 300 °C", test: (p) => between(v(p.technicalSpecifications.tempMaxC), 101, 301) },
  { id: "300+", label: "Maks. 300 °C üzeri", test: (p) => v(p.technicalSpecifications.tempMaxC) > 300 },
];

export const POWER_BUCKETS: Bucket[] = [
  { id: "0-500", label: "500 W'a kadar", test: (p) => between(v(p.technicalSpecifications.powerW), 1, 501) },
  { id: "500-1500", label: "500 – 1.500 W", test: (p) => between(v(p.technicalSpecifications.powerW), 501, 1501) },
  { id: "1500+", label: "1.500 W üzeri", test: (p) => v(p.technicalSpecifications.powerW) > 1500 },
];

export const SIZE_BUCKETS: Bucket[] = [
  { id: "tezgah", label: "Tezgâh üstü (≤ 700 mm)", test: (p) => between(v(p.technicalSpecifications.outerMm?.[1]), 1, 701) },
  { id: "orta", label: "Orta (700 – 1.200 mm)", test: (p) => between(v(p.technicalSpecifications.outerMm?.[1]), 701, 1201) },
  { id: "boy", label: "Boy tipi (> 1.200 mm)", test: (p) => v(p.technicalSpecifications.outerMm?.[1]) > 1200 },
];

export const FIXED_GROUPS: Record<"fiyat" | "stok" | "hacim" | "sicaklik" | "guc" | "boyut", FilterGroup> = {
  fiyat: { key: "fiyat", title: "Fiyat", buckets: PRICE_BUCKETS },
  stok: { key: "stok", title: "Stok", buckets: STOCK_BUCKETS },
  hacim: { key: "hacim", title: "Hacim", buckets: VOLUME_BUCKETS },
  sicaklik: { key: "sicaklik", title: "Sıcaklık aralığı", buckets: TEMP_BUCKETS },
  guc: { key: "guc", title: "Güç", buckets: POWER_BUCKETS },
  boyut: { key: "boyut", title: "Boyut (yükseklik)", buckets: SIZE_BUCKETS },
};

export const SORTS = [
  { id: "onerilen", label: "Önerilen" },
  { id: "yeni", label: "Yeni Ürünler" },
  { id: "fiyat-artan", label: "Fiyat Artan" },
  { id: "fiyat-azalan", label: "Fiyat Azalan" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export interface Filters {
  kategori: string[];
  marka: string[];
  fiyat: string[];
  stok: string[];
  hacim: string[];
  sicaklik: string[];
  guc: string[];
  boyut: string[];
  tip: string[];
  model3d: boolean;
  q: string;
  sirala: SortId;
  sayfa: number;
}

export const MULTI_KEYS: GroupKey[] = ["kategori", "marka", "fiyat", "stok", "hacim", "sicaklik", "guc", "boyut", "tip"];

type Raw = Record<string, string | string[] | undefined>;

export function parseFilters(raw: Raw, fixed?: Partial<Filters>): Filters {
  const arr = (k: string) => {
    const x = raw[k];
    if (!x) return [];
    return (Array.isArray(x) ? x : x.split(",")).filter(Boolean);
  };
  const one = (k: string) => {
    const x = raw[k];
    return Array.isArray(x) ? x[0] : x;
  };
  const sort = one("sirala") as SortId | undefined;
  return {
    kategori: arr("kategori"),
    marka: arr("marka"),
    fiyat: arr("fiyat"),
    stok: arr("stok"),
    hacim: arr("hacim"),
    sicaklik: arr("sicaklik"),
    guc: arr("guc"),
    boyut: arr("boyut"),
    tip: arr("tip"),
    model3d: one("model3d") === "1",
    q: (one("q") ?? "").trim(),
    sirala: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "onerilen",
    sayfa: Math.max(1, Number(one("sayfa")) || 1),
    ...fixed,
  };
}

export function filtersToQuery(f: Filters, omit: (keyof Filters)[] = []): string {
  const sp = new URLSearchParams();
  for (const k of MULTI_KEYS) {
    const val = f[k as keyof Filters] as string[];
    if (val.length && !omit.includes(k as keyof Filters)) sp.set(k, val.join(","));
  }
  if (f.model3d && !omit.includes("model3d")) sp.set("model3d", "1");
  if (f.q && !omit.includes("q")) sp.set("q", f.q);
  if (f.sirala !== "onerilen" && !omit.includes("sirala")) sp.set("sirala", f.sirala);
  if (f.sayfa > 1 && !omit.includes("sayfa")) sp.set("sayfa", String(f.sayfa));
  return sp.toString();
}

export const hasActiveFilters = (f: Filters) => MULTI_KEYS.some((k) => (f[k as keyof Filters] as string[]).length > 0) || f.model3d || !!f.q;
