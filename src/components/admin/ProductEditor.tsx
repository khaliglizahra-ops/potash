"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileUp, Plus, Trash2, X } from "lucide-react";
import { slugify } from "@/lib/text";
import type { Product } from "@/lib/types";

type Opt = { slug: string; name: string };
type Triple = [string, string, string];

const KINDS = [["katalog", "Katalog"], ["kullanim-kilavuzu", "Kullanım kılavuzu"], ["teknik-sartname", "Teknik şartname"], ["diger", "Diğer"]];
const TYPES = ["Cihaz", "Ölçüm Aleti", "Yardımcı Ekipman", "Kurulum Sistemi", "Sarf Malzeme"];

const s = (n: number | undefined) => (n === undefined ? "" : String(n));
const tri = (t?: [number, number, number]): Triple => (t ? [String(t[0]), String(t[1]), String(t[2])] : ["", "", ""]);

async function upload(files: FileList | File[]): Promise<{ url: string; kind: string }[]> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("file", f);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? "Yükleme başarısız");
  return d.files;
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] border border-line bg-white p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-body">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="label">{label}</span>{children}</label>;
}

export default function ProductEditor({ product, categories, brands }: { product: Product | null; categories: Opt[]; brands: Opt[] }) {
  const router = useRouter();
  const t = product?.technicalSpecifications ?? {};
  const [f, setF] = useState({
    id: product?.id ?? "",
    name: product?.name ?? "", slug: product?.slug ?? "", sku: product?.sku ?? "",
    category: product?.category ?? categories[0]?.slug ?? "", brand: product?.brand ?? "nukleon", type: product?.type ?? "Cihaz",
    tagline: product?.tagline ?? "", shortDescription: product?.shortDescription ?? "", description: product?.description ?? "",
    highlights: (product?.highlights ?? []).join("\n"),
    price: s(product?.price ?? undefined), stock: s(product?.stock ?? 0), leadTimeDays: s(product?.leadTimeDays ?? 14),
    featured: product?.featured ?? false, isNew: product?.isNew ?? false, specsDraft: product?.specsDraft ?? true,
    images: product?.images ?? [] as string[],
    model3d: product?.model3d ?? "",
    volumeL: s(t.volumeL), tempMinC: s(t.tempMinC), tempMaxC: s(t.tempMaxC), powerW: s(t.powerW), voltage: t.voltage ?? "230 V / 50 Hz", control: t.control ?? "",
    inner: tri(t.innerMm), outer: tri(t.outerMm), weightKg: s(t.weightKg), warrantyMonths: s(t.warrantyMonths ?? 24),
    extra: t.extra ?? [] as { label: string; value: string }[],
    documents: product?.documents ?? [] as Product["documents"],
    certificates: product?.certificates ?? [] as Product["certificates"],
    videos: (product?.videos ?? []).map((v) => ({ title: v.title, youtubeId: v.youtubeId })),
    faq: product?.faq ?? [] as { q: string; a: string }[],
    seoTitle: product?.seoTitle ?? "", seoDescription: product?.seoDescription ?? "",
  });
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((o) => ({ ...o, [k]: v }));
  const upd = <K extends "extra" | "documents" | "certificates" | "videos" | "faq">(k: K, i: number, patch: Partial<(typeof f)[K][number]>) =>
    setF((o) => ({ ...o, [k]: (o[k] as unknown[]).map((x, j) => (j === i ? { ...(x as object), ...patch } : x)) as (typeof f)[K] }));
  const del = (k: "extra" | "documents" | "certificates" | "videos" | "faq" | "images", i: number) => setF((o) => ({ ...o, [k]: (o[k] as unknown[]).filter((_, j) => j !== i) as never }));
  const add = (k: "extra" | "documents" | "certificates" | "videos" | "faq", v: unknown) => setF((o) => ({ ...o, [k]: [...(o[k] as unknown[]), v] as never }));

  async function pick(files: FileList | null, onDone: (urls: { url: string; kind: string }[]) => void) {
    if (!files?.length) return;
    try {
      onDone(await upload(files));
      setMsg(null);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Yükleme hatası" });
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const body = {
      id: f.id || undefined, name: f.name, slug: f.slug, sku: f.sku, category: f.category, brand: f.brand, type: f.type,
      tagline: f.tagline, shortDescription: f.shortDescription, description: f.description,
      highlights: f.highlights.split("\n"),
      price: f.price, stock: f.stock, leadTimeDays: f.leadTimeDays, featured: f.featured, isNew: f.isNew, specsDraft: f.specsDraft,
      images: f.images, model3d: f.model3d,
      technicalSpecifications: { volumeL: f.volumeL, tempMinC: f.tempMinC, tempMaxC: f.tempMaxC, powerW: f.powerW, voltage: f.voltage, control: f.control, innerMm: f.inner, outerMm: f.outer, weightKg: f.weightKg, warrantyMonths: f.warrantyMonths, extra: f.extra },
      documents: f.documents, certificates: f.certificates, videos: f.videos, faq: f.faq, seoTitle: f.seoTitle, seoDescription: f.seoDescription,
    };
    const r = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: d.error ?? "Kaydedilemedi" });
    setMsg({ ok: true, text: "Kaydedildi" });
    router.refresh();
    if (!f.id) router.replace(`/admin/urunler/${d.product.id}`);
    else setF((o) => ({ ...o, id: d.product.id, slug: d.product.slug }));
  }

  async function remove() {
    if (!f.id || !confirm("Bu ürün kalıcı olarak silinsin mi?")) return;
    const r = await fetch(`/api/admin/products?id=${f.id}`, { method: "DELETE" });
    if (r.ok) {
      router.push("/admin/urunler");
      router.refresh();
    }
  }

  const rowBtn = "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-300 text-body hover:border-red hover:text-red";
  const addBtn = "btn btn-ghost btn-sm mt-4";

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/urunler" className="text-[13px] font-semibold text-body hover:text-red">← Ürünler</Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product ? product.name : "Yeni ürün"}</h1>
        </div>
        {product && <Link href={`/urunler/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm">Sayfayı gör</Link>}
      </div>

      <div className="mt-8 space-y-5">
        <Card title="Temel bilgiler">
          <div className="grid gap-4 sm:grid-cols-2">
            <L label="Ürün adı *" className="sm:col-span-2"><input className="field" value={f.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></L>
            <L label="Ürün kodu (SKU) *"><input className="field font-mono" value={f.sku} onChange={(e) => set("sku", e.target.value)} /></L>
            <L label="URL adı"><input className="field font-mono" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></L>
            <L label="Kategori"><select className="field" value={f.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></L>
            <L label="Marka"><select className="field" value={f.brand} onChange={(e) => set("brand", e.target.value)}>{brands.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></L>
            <L label="Ürün tipi"><select className="field" value={f.type} onChange={(e) => set("type", e.target.value as Product["type"])}>{TYPES.map((x) => <option key={x}>{x}</option>)}</select></L>
            <L label="Alt başlık"><input className="field" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Laboratuvar Tipi İnkübatör" /></L>
            <L label="Kısa açıklama" className="sm:col-span-2"><input className="field" value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></L>
            <L label="Açıklama" className="sm:col-span-2"><textarea className="field" rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} /></L>
            <L label="Öne çıkan özellikler (her satıra bir madde)" className="sm:col-span-2"><textarea className="field" rows={4} value={f.highlights} onChange={(e) => set("highlights", e.target.value)} /></L>
          </div>
        </Card>

        <Card title="Fiyat ve stok" hint="Fiyat alanını boş bırakırsanız ürün yalnızca “Teklif Al” ile satılır.">
          <div className="grid gap-4 sm:grid-cols-3">
            <L label="Fiyat (₺, KDV hariç)"><input className="field font-mono" inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="Teklif" /></L>
            <L label="Stok (adet)"><input className="field font-mono" type="number" min={0} value={f.stock} onChange={(e) => set("stock", e.target.value)} /></L>
            <L label="Sipariş üretim süresi (gün)"><input className="field font-mono" type="number" min={0} value={f.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} /></L>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[14px] font-medium text-ink">
            {([["featured", "Öne çıkan ürün"], ["isNew", "Yeni ürün"], ["specsDraft", "Teknik değerler taslak (onay bekliyor)"]] as const).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-[18px] w-[18px] accent-[#c8102e]" />{label}</label>
            ))}
          </div>
        </Card>

        <Card title="Ürün görselleri" hint="İlk görsel ürün kartında ve aramada kullanılır. Beyaz veya şeffaf arka planlı, en az 800 px görseller önerilir.">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {f.images.map((src, i) => (
              <li key={src + i} className="rounded-xl border border-line p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50"><Image src={src} alt="" fill sizes="200px" className="packshot object-contain p-2" /></div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-body">{i === 0 ? "Kapak" : `#${i + 1}`}</span>
                  <span className="flex gap-1">
                    <button type="button" aria-label="Yukarı" disabled={i === 0} onClick={() => setF((o) => { const a = [...o.images]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...o, images: a }; })} className="grid h-7 w-7 place-items-center rounded text-body hover:text-red disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" aria-label="Aşağı" disabled={i === f.images.length - 1} onClick={() => setF((o) => { const a = [...o.images]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; return { ...o, images: a }; })} className="grid h-7 w-7 place-items-center rounded text-body hover:text-red disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" aria-label="Sil" onClick={() => del("images", i)} className="grid h-7 w-7 place-items-center rounded text-body hover:text-red"><X size={15} /></button>
                  </span>
                </div>
              </li>
            ))}
            <li><button type="button" onClick={() => imgInput.current?.click()} className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-[13px] font-medium text-body transition hover:border-red hover:text-red"><FileUp size={22} />Görsel yükle</button></li>
          </ul>
          <input ref={imgInput} type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple hidden onChange={(e) => pick(e.target.files, (u) => set("images", [...f.images, ...u.filter((x) => x.kind === "image").map((x) => x.url)]))} />
        </Card>

        <Card title="3D model (GLB)" hint="Draco sıkıştırmalı GLB önerilir (en fazla 30 MB). Model yoksa ürün sayfasında fotoğraf galerisi gösterilir.">
          <div className="flex flex-wrap items-center gap-3">
            <input className="field min-w-[260px] flex-1 font-mono text-[13px]" value={f.model3d} onChange={(e) => set("model3d", e.target.value)} placeholder="/models/nin-110.glb" />
            <label className="btn btn-ghost btn-sm cursor-pointer"><FileUp size={15} /> GLB yükle<input type="file" accept=".glb,model/gltf-binary" hidden onChange={(e) => pick(e.target.files, (u) => { const m = u.find((x) => x.kind === "model"); if (m) set("model3d", m.url); else setMsg({ ok: false, text: "GLB dosyası seçin." }); })} /></label>
            {f.model3d && <button type="button" onClick={() => set("model3d", "")} className="text-[13px] font-semibold text-body hover:text-red">Kaldır</button>}
          </div>
        </Card>

        <Card title="Teknik özellikler">
          <div className="grid gap-4 sm:grid-cols-4">
            <L label="Hacim (L)"><input className="field font-mono" value={f.volumeL} onChange={(e) => set("volumeL", e.target.value)} /></L>
            <L label="Sıcaklık min (°C)"><input className="field font-mono" value={f.tempMinC} onChange={(e) => set("tempMinC", e.target.value)} /></L>
            <L label="Sıcaklık maks (°C)"><input className="field font-mono" value={f.tempMaxC} onChange={(e) => set("tempMaxC", e.target.value)} /></L>
            <L label="Güç (W)"><input className="field font-mono" value={f.powerW} onChange={(e) => set("powerW", e.target.value)} /></L>
            <L label="Besleme"><input className="field" value={f.voltage} onChange={(e) => set("voltage", e.target.value)} /></L>
            <L label="Ağırlık (kg)"><input className="field font-mono" value={f.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></L>
            <L label="Garanti (ay)"><input className="field font-mono" value={f.warrantyMonths} onChange={(e) => set("warrantyMonths", e.target.value)} /></L>
            <L label="Kontrol sistemi" className="sm:col-span-4"><input className="field" value={f.control} onChange={(e) => set("control", e.target.value)} /></L>
            {(["inner", "outer"] as const).map((k) => (
              <div key={k} className="sm:col-span-4">
                <span className="label">{k === "inner" ? "İç ölçüler (mm): genişlik × yükseklik × derinlik" : "Dış ölçüler (mm): genişlik × yükseklik × derinlik"}</span>
                <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <input key={i} className="field font-mono" aria-label={["G", "Y", "D"][i]} placeholder={["G", "Y", "D"][i]} value={f[k][i]} onChange={(e) => set(k, f[k].map((x, j) => (j === i ? e.target.value : x)) as Triple)} />)}</div>
              </div>
            ))}
          </div>
          <h3 className="mt-7 text-[14px] font-semibold text-ink">Ek özellikler</h3>
          <div className="mt-3 space-y-2.5">
            {f.extra.map((e, i) => (
              <div key={i} className="flex gap-2.5">
                <input className="field" placeholder="Özellik" value={e.label} onChange={(x) => upd("extra", i, { label: x.target.value })} />
                <input className="field" placeholder="Değer" value={e.value} onChange={(x) => upd("extra", i, { value: x.target.value })} />
                <button type="button" aria-label="Sil" onClick={() => del("extra", i)} className={rowBtn}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => add("extra", { label: "", value: "" })} className={addBtn}><Plus size={15} /> Özellik ekle</button>
        </Card>

        <Card title="Dokümanlar (PDF)">
          <div className="space-y-2.5">
            {f.documents.map((d, i) => (
              <div key={i} className="grid gap-2.5 sm:grid-cols-[1fr_1.2fr_170px_auto]">
                <input className="field" placeholder="Başlık" value={d.title} onChange={(e) => upd("documents", i, { title: e.target.value })} />
                <input className="field font-mono text-[13px]" placeholder="/uploads/…pdf veya https://…" value={d.url} onChange={(e) => upd("documents", i, { url: e.target.value })} />
                <select className="field" value={d.kind} onChange={(e) => upd("documents", i, { kind: e.target.value as Product["documents"][number]["kind"] })}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <span className="flex gap-2">
                  <label className={`${rowBtn} cursor-pointer`} title="PDF yükle"><FileUp size={16} /><input type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files, (u) => u[0]?.kind === "pdf" ? upd("documents", i, { url: u[0].url, title: d.title || e.target.files![0].name.replace(/\.pdf$/i, "") }) : setMsg({ ok: false, text: "PDF dosyası seçin." }))} /></label>
                  <button type="button" aria-label="Sil" onClick={() => del("documents", i)} className={rowBtn}><Trash2 size={16} /></button>
                </span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => add("documents", { title: "", url: "", kind: "kullanim-kilavuzu" })} className={addBtn}><Plus size={15} /> Doküman ekle</button>
        </Card>

        <Card title="Sertifikalar">
          <div className="space-y-2.5">
            {f.certificates.map((c, i) => (
              <div key={i} className="grid gap-2.5 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
                <input className="field" placeholder="Sertifika adı" value={c.title} onChange={(e) => upd("certificates", i, { title: e.target.value })} />
                <input className="field" placeholder="Veren kuruluş" value={c.issuer ?? ""} onChange={(e) => upd("certificates", i, { issuer: e.target.value })} />
                <input className="field font-mono text-[13px]" placeholder="Belge (PDF) yolu" value={c.url ?? ""} onChange={(e) => upd("certificates", i, { url: e.target.value })} />
                <span className="flex gap-2">
                  <label className={`${rowBtn} cursor-pointer`}><FileUp size={16} /><input type="file" accept="application/pdf,image/*" hidden onChange={(e) => pick(e.target.files, (u) => u[0] && upd("certificates", i, { url: u[0].url }))} /></label>
                  <button type="button" aria-label="Sil" onClick={() => del("certificates", i)} className={rowBtn}><Trash2 size={16} /></button>
                </span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => add("certificates", { title: "", issuer: "", url: "" })} className={addBtn}><Plus size={15} /> Sertifika ekle</button>
        </Card>

        <Card title="Videolar" hint="YouTube bağlantısını veya video kimliğini yapıştırın.">
          <div className="space-y-2.5">
            {f.videos.map((v, i) => (
              <div key={i} className="flex gap-2.5">
                <input className="field" placeholder="Başlık" value={v.title} onChange={(e) => upd("videos", i, { title: e.target.value })} />
                <input className="field font-mono text-[13px]" placeholder="https://youtu.be/…" value={v.youtubeId} onChange={(e) => upd("videos", i, { youtubeId: e.target.value })} />
                <button type="button" aria-label="Sil" onClick={() => del("videos", i)} className={rowBtn}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => add("videos", { title: "", youtubeId: "" })} className={addBtn}><Plus size={15} /> Video ekle</button>
        </Card>

        <Card title="Sık sorulan sorular">
          <div className="space-y-3">
            {f.faq.map((q, i) => (
              <div key={i} className="grid gap-2.5 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1.6fr_auto]">
                <input className="field" placeholder="Soru" value={q.q} onChange={(e) => upd("faq", i, { q: e.target.value })} />
                <textarea className="field" rows={2} placeholder="Cevap" value={q.a} onChange={(e) => upd("faq", i, { a: e.target.value })} />
                <button type="button" aria-label="Sil" onClick={() => del("faq", i)} className={rowBtn}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => add("faq", { q: "", a: "" })} className={addBtn}><Plus size={15} /> Soru ekle</button>
        </Card>

        <Card title="SEO" hint="Boş bırakılırsa ürün adı ve kısa açıklamadan otomatik üretilir.">
          <div className="grid gap-4">
            <L label={`SEO başlığı (${f.seoTitle.length}/60)`}><input className="field" value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></L>
            <L label={`Meta açıklama (${f.seoDescription.length}/160)`}><textarea className="field" rows={2} value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></L>
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-[248px]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4 px-4 sm:px-8 lg:px-10">
          <p role="status" className={`text-[14px] font-medium ${msg?.ok ? "text-emerald-600" : "text-red"}`}>{msg?.text}</p>
          <div className="flex gap-3">
            {product && <button type="button" onClick={remove} className="btn btn-ghost btn-sm text-red hover:!border-red"><Trash2 size={15} /> Sil</button>}
            <button type="button" disabled={busy} onClick={save} className="btn btn-primary btn-sm">{busy ? "Kaydediliyor…" : "Kaydet"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
