"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/text";

export interface Row { id: string; slug: string; name: string; description: string; count: number; group?: string; image?: string | null; order?: number; country?: string; own?: boolean }

const GROUPS = [["cihazlar", "Laboratuvar Cihazları"], ["olcum", "Ölçüm ve Analiz"], ["gerecler", "Laboratuvar Gereçleri"], ["kimyasal", "Kimyasal Ürünler"], ["kurulum", "Laboratuvar Kurulumu"]];

export default function TaxonomyEditor({ kind, rows }: { kind: "category" | "brand"; rows: Row[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Partial<Row> | null>(null);
  const [err, setErr] = useState("");
  const isCat = kind === "category";

  async function save() {
    setErr("");
    const r = await fetch("/api/admin/taxonomy", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, ...edit }) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error ?? "Hata");
    setEdit(null);
    router.refresh();
  }
  async function del(row: Row) {
    if (!confirm(`“${row.name}” silinsin mi?`)) return;
    const r = await fetch(`/api/admin/taxonomy?kind=${kind}&id=${row.id}`, { method: "DELETE" });
    if (!r.ok) return alert((await r.json()).error ?? "Silinemedi");
    router.refresh();
  }
  async function up(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    fd.append("file", files[0]);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (r.ok && d.files[0].kind === "image") setEdit((e) => ({ ...e, image: d.files[0].url }));
    else setErr(d.error ?? "Görsel yükleyin.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{isCat ? "Kategoriler" : "Markalar"}</h1>
        <button onClick={() => setEdit(isCat ? { group: "cihazlar" } : {})} className="btn btn-primary btn-sm"><Plus size={16} /> {isCat ? "Yeni kategori" : "Yeni marka"}</button>
      </div>

      {edit && (
        <div className="mt-6 rounded-[16px] border border-red/30 bg-white p-6">
          <h2 className="font-semibold">{edit.id ? "Düzenle" : "Yeni kayıt"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label><span className="label">Ad *</span><input className="field" value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value, ...(edit.id ? {} : { slug: slugify(e.target.value) }) })} /></label>
            <label><span className="label">URL adı</span><input className="field font-mono" value={edit.slug ?? ""} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} /></label>
            {isCat ? (
              <>
                <label><span className="label">Grup</span><select className="field" value={edit.group} onChange={(e) => setEdit({ ...edit, group: e.target.value })}>{GROUPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label><span className="label">Sıra</span><input className="field font-mono" type="number" value={edit.order ?? ""} onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) })} /></label>
                <div className="sm:col-span-2">
                  <span className="label">Görsel</span>
                  <div className="flex items-center gap-3">
                    {edit.image && <span className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-50"><Image src={edit.image} alt="" fill sizes="56px" className="packshot object-contain p-1" /></span>}
                    <input className="field flex-1 font-mono text-[13px]" value={edit.image ?? ""} onChange={(e) => setEdit({ ...edit, image: e.target.value })} placeholder="/img/products/…" />
                    <label className="btn btn-ghost btn-sm cursor-pointer"><FileUp size={15} /> Yükle<input type="file" accept="image/*" hidden onChange={(e) => up(e.target.files)} /></label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <label><span className="label">Ülke</span><input className="field" value={edit.country ?? ""} onChange={(e) => setEdit({ ...edit, country: e.target.value })} /></label>
                <label className="flex items-end gap-2.5 pb-3 text-[14px] font-medium text-ink"><input type="checkbox" checked={!!edit.own} onChange={(e) => setEdit({ ...edit, own: e.target.checked })} className="h-[18px] w-[18px] accent-[#c8102e]" /> Kendi markamız</label>
              </>
            )}
            <label className="sm:col-span-2"><span className="label">Açıklama</span><textarea className="field" rows={3} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
          </div>
          {err && <p role="alert" className="mt-3 text-[13px] font-medium text-red">{err}</p>}
          <div className="mt-5 flex gap-3"><button onClick={save} className="btn btn-primary btn-sm">Kaydet</button><button onClick={() => { setEdit(null); setErr(""); }} className="btn btn-ghost btn-sm">Vazgeç</button></div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-[16px] border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="border-b border-line bg-gray-50 font-mono text-[11px] uppercase tracking-wider text-body"><tr><th className="p-4">Ad</th><th className="p-4">{isCat ? "Grup" : "Ülke"}</th><th className="p-4">Ürün</th><th className="p-4" /></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-4"><span className="font-semibold text-ink">{r.name}</span><span className="block font-mono text-[12px] text-body">{r.slug}</span></td>
                <td className="p-4 text-body">{isCat ? GROUPS.find(([v]) => v === r.group)?.[1] : r.country}</td>
                <td className="p-4 font-mono">{r.count}</td>
                <td className="p-4"><span className="flex justify-end gap-1">
                  <button aria-label={`${r.name} düzenle`} onClick={() => setEdit(r)} className="grid h-9 w-9 place-items-center rounded-lg text-body hover:bg-gray-50 hover:text-red"><Pencil size={16} /></button>
                  <button aria-label={`${r.name} sil`} onClick={() => del(r)} className="grid h-9 w-9 place-items-center rounded-lg text-body hover:bg-red/10 hover:text-red"><Trash2 size={16} /></button>
                </span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
