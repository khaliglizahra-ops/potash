import "server-only";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { isAdmin } from "./auth";
import { slugify } from "../text";
import type { Product, ProductType } from "../types";

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/giris");
}
export async function guard(): Promise<NextResponse | null> {
  return (await isAdmin()) ? null : NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
}

const num = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};
const text = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const triple = (v: unknown): [number, number, number] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const t = v.map(num);
  return t.every((x) => x !== undefined && x > 0) && t.length === 3 ? (t as [number, number, number]) : undefined;
};
const localUrl = (u: unknown) => {
  const s = text(u, 300);
  return /^(\/(img|uploads|models)\/|https:\/\/)/.test(s) ? s : "";
};
const TYPES: ProductType[] = ["Cihaz", "Ölçüm Aleti", "Yardımcı Ekipman", "Kurulum Sistemi", "Sarf Malzeme"];

/** Youtube URL or bare id → id. */
export function youtubeId(v: string): string {
  const m = v.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
}

export function normalizeProduct(input: Record<string, unknown>, existing?: Product): Product | { error: string } {
  const name = text(input.name, 160);
  const sku = text(input.sku, 40);
  if (name.length < 3) return { error: "Ürün adı gerekli." };
  if (!sku) return { error: "Ürün kodu gerekli." };
  const slug = slugify(text(input.slug, 120) || name);
  if (!slug) return { error: "Geçersiz URL adı." };

  const ts = (input.technicalSpecifications ?? {}) as Record<string, unknown>;
  const price = num(input.price);
  const images = (Array.isArray(input.images) ? input.images : []).map(localUrl).filter(Boolean).slice(0, 12);
  if (!images.length) return { error: "En az bir ürün görseli gerekli." };
  const model = localUrl(input.model3d);

  return {
    id: existing?.id ?? `p-${slug}`,
    name, slug, sku,
    category: text(input.category, 80),
    brand: text(input.brand, 80) || "nukleon",
    type: TYPES.includes(input.type as ProductType) ? (input.type as ProductType) : "Cihaz",
    tagline: text(input.tagline, 140),
    shortDescription: text(input.shortDescription, 300),
    description: text(input.description, 6000),
    highlights: (Array.isArray(input.highlights) ? input.highlights : []).map((h) => text(h, 160)).filter(Boolean).slice(0, 10),
    price: price !== undefined && price >= 0 ? price : null,
    stock: Math.max(0, Math.floor(num(input.stock) ?? 0)),
    leadTimeDays: Math.max(0, Math.floor(num(input.leadTimeDays) ?? 14)),
    images,
    model3d: model || null,
    technicalSpecifications: {
      volumeL: num(ts.volumeL), tempMinC: num(ts.tempMinC), tempMaxC: num(ts.tempMaxC), powerW: num(ts.powerW),
      voltage: text(ts.voltage, 40) || undefined, control: text(ts.control, 140) || undefined,
      innerMm: triple(ts.innerMm), outerMm: triple(ts.outerMm), weightKg: num(ts.weightKg), warrantyMonths: num(ts.warrantyMonths),
      extra: (Array.isArray(ts.extra) ? ts.extra : []).map((e) => ({ label: text((e as Record<string, unknown>).label, 80), value: text((e as Record<string, unknown>).value, 160) })).filter((e) => e.label && e.value).slice(0, 20),
    },
    documents: (Array.isArray(input.documents) ? input.documents : []).map((d) => {
      const o = d as Record<string, unknown>;
      return { title: text(o.title, 120), url: localUrl(o.url) || (/^http:\/\//.test(text(o.url)) ? text(o.url, 300) : ""), kind: (["katalog", "kullanim-kilavuzu", "teknik-sartname", "diger"].includes(o.kind as string) ? o.kind : "diger") as Product["documents"][number]["kind"] };
    }).filter((d) => d.title && d.url).slice(0, 12),
    certificates: (Array.isArray(input.certificates) ? input.certificates : []).map((c) => {
      const o = c as Record<string, unknown>;
      return { title: text(o.title, 120), issuer: text(o.issuer, 120) || undefined, url: localUrl(o.url) || undefined };
    }).filter((c) => c.title).slice(0, 12),
    videos: (Array.isArray(input.videos) ? input.videos : []).map((v) => {
      const o = v as Record<string, unknown>;
      return { title: text(o.title, 120), youtubeId: youtubeId(text(o.youtubeId, 200)) };
    }).filter((v) => v.title && v.youtubeId).slice(0, 6),
    faq: (Array.isArray(input.faq) ? input.faq : []).map((f) => ({ q: text((f as Record<string, unknown>).q, 200), a: text((f as Record<string, unknown>).a, 1200) })).filter((f) => f.q && f.a).slice(0, 12),
    featured: input.featured === true,
    isNew: input.isNew === true,
    specsDraft: input.specsDraft === true,
    seoTitle: text(input.seoTitle, 120) || undefined,
    seoDescription: text(input.seoDescription, 200) || undefined,
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  };
}
