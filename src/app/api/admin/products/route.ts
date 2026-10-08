import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { put, remove } from "@/lib/db";
import { guard, normalizeProduct } from "@/lib/server/admin";
import type { Product } from "@/lib/types";

/** Create (no id) or update (id) a product. */
export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const all = getProducts();
  const existing = typeof b.id === "string" ? all.find((p) => p.id === b.id) : undefined;
  const p = normalizeProduct(b, existing);
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 422 });
  if (all.some((x) => x.slug === p.slug && x.id !== p.id)) return NextResponse.json({ error: "Bu URL adı başka bir üründe kullanılıyor." }, { status: 409 });
  if (all.some((x) => x.sku.toLowerCase() === p.sku.toLowerCase() && x.id !== p.id)) return NextResponse.json({ error: "Bu ürün kodu başka bir üründe kullanılıyor." }, { status: 409 });
  put<Product>("product", p);
  return NextResponse.json({ ok: true, product: p });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!getProducts().some((p) => p.id === id)) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  remove("product", id);
  return NextResponse.json({ ok: true });
}

/** Quick inline edits from the list (stock / price / flags). */
export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as { id?: string; stock?: unknown; price?: unknown; featured?: unknown };
  const p = getProducts().find((x) => x.id === b.id);
  if (!p) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const next = { ...p };
  if (b.stock !== undefined) next.stock = Math.max(0, Math.floor(Number(b.stock) || 0));
  if (b.price !== undefined) next.price = b.price === "" || b.price === null ? null : Math.max(0, Number(b.price) || 0);
  if (typeof b.featured === "boolean") next.featured = b.featured;
  put<Product>("product", next);
  return NextResponse.json({ ok: true, product: next });
}
