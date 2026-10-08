import type { Product } from "./types";

export const VAT_RATE = 0.2;
export const FREE_SHIPPING_FROM = 25_000;
export const SHIPPING_FLAT = 450;

export interface StockInfo {
  label: string;
  tone: "ok" | "warn" | "made";
  inStock: boolean;
}

export function stockInfo(p: Pick<Product, "stock" | "leadTimeDays" | "price">): StockInfo {
  if (p.stock > 5) return { label: "Stokta", tone: "ok", inStock: true };
  if (p.stock > 0) return { label: `Son ${p.stock} adet`, tone: "warn", inStock: true };
  return { label: `Siparişe özel · ~${p.leadTimeDays} gün`, tone: "made", inStock: false };
}

/** A product can be put in the cart only when it has a price. */
export const isPurchasable = (p: Pick<Product, "price">) => p.price !== null;

export const cover = (p: Pick<Product, "images">) => p.images[0] ?? "/img/site/placeholder.svg";

export function dimensions(d?: [number, number, number]) {
  return d ? `${d[0]} × ${d[1]} × ${d[2]} mm` : null;
}

export interface SpecRow {
  group: string;
  label: string;
  value: string;
}

/** Flat, ordered spec rows used by the detail table and the compare view. */
export function specRows(p: Product): SpecRow[] {
  const t = p.technicalSpecifications;
  const rows: SpecRow[] = [];
  const add = (group: string, label: string, value?: string | null) => value && rows.push({ group, label, value });
  add("Performans", "Hacim", t.volumeL ? `${t.volumeL} L` : null);
  add("Performans", "Sıcaklık aralığı", t.tempMaxC !== undefined ? `${t.tempMinC ?? "—"} … ${t.tempMaxC} °C` : null);
  add("Performans", "Güç", t.powerW ? `${t.powerW} W` : null);
  add("Performans", "Kontrol sistemi", t.control);
  add("Boyutlar", "İç ölçüler (G×Y×D)", dimensions(t.innerMm));
  add("Boyutlar", "Dış ölçüler (G×Y×D)", dimensions(t.outerMm));
  add("Boyutlar", "Ağırlık", t.weightKg ? `${t.weightKg} kg` : null);
  add("Elektrik", "Besleme", t.voltage);
  for (const e of t.extra ?? []) add("Diğer", e.label, e.value);
  add("Genel", "Garanti", t.warrantyMonths ? `${t.warrantyMonths} ay` : null);
  return rows;
}
