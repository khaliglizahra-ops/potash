"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Rotate3d, Search, Star, Trash2 } from "lucide-react";
import { fold } from "@/lib/text";
import type { Product } from "@/lib/types";

export default function ProductList({ products, categories }: { products: Product[]; categories: Record<string, string> }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [rows, setRows] = useState(products);
  const list = useMemo(() => rows.filter((p) => (!cat || p.category === cat) && (!q || fold(`${p.name} ${p.sku}`).includes(fold(q)))), [rows, q, cat]);

  async function patch(id: string, body: Record<string, unknown>) {
    const r = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    if (r.ok) {
      const { product } = await r.json();
      setRows((rs) => rs.map((x) => (x.id === id ? product : x)));
    }
  }
  async function del(p: Product) {
    if (!confirm(`“${p.name}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    const r = await fetch(`/api/admin/products?id=${p.id}`, { method: "DELETE" });
    if (r.ok) {
      setRows((rs) => rs.filter((x) => x.id !== p.id));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Ürünler <span className="font-mono text-base font-normal text-body">{list.length}/{rows.length}</span></h1>
        <Link href="/admin/urunler/yeni" className="btn btn-primary btn-sm"><Plus size={16} /> Yeni ürün</Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün adı veya kod ara" className="field !pl-10" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field !w-auto min-w-[200px]" aria-label="Kategori">
          <option value="">Tüm kategoriler</option>
          {Object.entries(categories).map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
        </select>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[16px] border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-[14px]">
          <thead className="border-b border-line bg-gray-50 font-mono text-[11px] uppercase tracking-wider text-body">
            <tr><th className="p-4">Ürün</th><th className="p-4">Kategori</th><th className="p-4">Fiyat (₺, KDV hariç)</th><th className="p-4">Stok</th><th className="p-4">Öne çıkan</th><th className="p-4" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60">
                <td className="p-4">
                  <Link href={`/admin/urunler/${p.id}`} className="flex items-center gap-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50"><Image src={p.images[0]} alt="" fill sizes="48px" className="packshot object-contain p-1" /></span>
                    <span><span className="block font-semibold text-ink hover:text-red">{p.name}</span><span className="font-mono text-[12px] text-red">{p.sku}</span>{p.model3d && <Rotate3d size={13} className="ml-2 inline text-body" aria-label="3D" />}{p.specsDraft && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-800">taslak</span>}</span>
                  </Link>
                </td>
                <td className="p-4 text-body">{categories[p.category] ?? p.category}</td>
                <td className="p-4"><input defaultValue={p.price ?? ""} placeholder="Teklif" inputMode="decimal" aria-label={`${p.name} fiyat`} onBlur={(e) => { if (e.target.value !== String(p.price ?? "")) patch(p.id, { price: e.target.value }); }} className="field !h-10 !w-32 font-mono text-[13px]" /></td>
                <td className="p-4"><input defaultValue={p.stock} type="number" min={0} aria-label={`${p.name} stok`} onBlur={(e) => { if (Number(e.target.value) !== p.stock) patch(p.id, { stock: e.target.value }); }} className="field !h-10 !w-20 font-mono text-[13px]" /></td>
                <td className="p-4"><button onClick={() => patch(p.id, { featured: !p.featured })} aria-pressed={p.featured} aria-label="Öne çıkan" className={`grid h-9 w-9 place-items-center rounded-lg border transition ${p.featured ? "border-red bg-red text-white" : "border-gray-300 text-body hover:border-red hover:text-red"}`}><Star size={16} /></button></td>
                <td className="p-4 text-right"><button onClick={() => del(p)} aria-label={`${p.name} sil`} className="grid h-9 w-9 place-items-center rounded-lg text-body hover:bg-red/10 hover:text-red"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-10 text-center text-body">Eşleşen ürün yok.</p>}
      </div>
      <p className="mt-3 text-[12.5px] text-body">Fiyat veya stok hücresinden çıktığınızda değişiklik otomatik kaydedilir. Fiyat alanı boşsa ürün “Teklif Al” olarak görünür.</p>
    </div>
  );
}
