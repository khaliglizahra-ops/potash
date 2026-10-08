import { NextResponse } from "next/server";
import { getBrands, getCategories, getProducts } from "@/lib/catalog";
import { put, remove } from "@/lib/db";
import { guard } from "@/lib/server/admin";
import { slugify } from "@/lib/text";
import type { Brand, Category } from "@/lib/types";

const t = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const GROUPS = ["cihazlar", "olcum", "gerecler", "kimyasal", "kurulum"];

export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const name = t(b.name, 80);
  if (name.length < 2) return NextResponse.json({ error: "Ad gerekli." }, { status: 422 });
  const slug = slugify(t(b.slug, 80) || name);

  if (b.kind === "category") {
    const all = getCategories();
    const old = all.find((c) => c.id === b.id);
    if (all.some((c) => c.slug === slug && c.id !== old?.id)) return NextResponse.json({ error: "Bu URL adı kullanımda." }, { status: 409 });
    const img = t(b.image);
    const c: Category = {
      id: old?.id ?? `c-${Date.now().toString(36)}`, slug, name,
      group: GROUPS.includes(b.group as string) ? (b.group as Category["group"]) : "cihazlar",
      image: /^(\/(img|uploads)\/|https:\/\/)/.test(img) ? img : null,
      description: t(b.description, 400), order: Number(b.order) || all.length + 1,
    };
    // if the slug changes, products pointing at the old one follow it
    if (old && old.slug !== slug) for (const p of getProducts().filter((p) => p.category === old.slug)) put("product", { ...p, category: slug });
    put<Category>("category", c);
    return NextResponse.json({ ok: true });
  }
  if (b.kind === "brand") {
    const all = getBrands();
    const old = all.find((x) => x.id === b.id);
    if (all.some((x) => x.slug === slug && x.id !== old?.id)) return NextResponse.json({ error: "Bu URL adı kullanımda." }, { status: 409 });
    const br: Brand = { id: old?.id ?? `b-${Date.now().toString(36)}`, slug, name, country: t(b.country, 60), description: t(b.description, 300), own: b.own === true };
    if (old && old.slug !== slug) for (const p of getProducts().filter((p) => p.brand === old.slug)) put("product", { ...p, brand: slug });
    put<Brand>("brand", br);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const u = new URL(req.url);
  const kind = u.searchParams.get("kind");
  const id = u.searchParams.get("id") ?? "";
  if (kind === "category") {
    const c = getCategories().find((x) => x.id === id);
    if (!c) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
    const n = getProducts().filter((p) => p.category === c.slug).length;
    if (n) return NextResponse.json({ error: `Bu kategoride ${n} ürün var. Önce ürünleri taşıyın.` }, { status: 409 });
    remove("category", id);
  } else if (kind === "brand") {
    const b = getBrands().find((x) => x.id === id);
    if (!b) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
    const n = getProducts().filter((p) => p.brand === b.slug).length;
    if (n) return NextResponse.json({ error: `Bu markada ${n} ürün var. Önce ürünleri taşıyın.` }, { status: 409 });
    remove("brand", id);
  } else return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
