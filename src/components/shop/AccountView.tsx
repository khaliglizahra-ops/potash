"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, MapPin, Package, Plus, FileText, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { formatDate, formatTRY } from "@/lib/text";
import type { Address, Order, QuoteRequest } from "@/lib/types";

interface Cust { id: string; name: string; email: string; phone: string; company: string; addresses: Address[] }

const ORDER_STATUS: Record<string, string> = { alindi: "Alındı", hazirlaniyor: "Hazırlanıyor", kargoda: "Kargoda", "teslim-edildi": "Teslim edildi", iptal: "İptal" };
const QUOTE_STATUS: Record<string, string> = { yeni: "Alındı", inceleniyor: "İnceleniyor", "teklif-gonderildi": "Teklif gönderildi", kapandi: "Kapandı" };

function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setFields({});
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.error ?? "Hata");
      setFields(d.fields ?? {});
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="mb-8 grid grid-cols-2 rounded-xl bg-gray-50 p-1">
        {(["login", "register"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`h-11 rounded-lg text-[14px] font-semibold transition ${mode === m ? "bg-white text-ink shadow-sm" : "text-body hover:text-ink"}`}>
            {m === "login" ? "Giriş yap" : "Hesap oluştur"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <p role="alert" className="rounded-xl border border-red/30 bg-red/[0.04] px-4 py-3 text-[14px] font-medium text-ink">{err}</p>}
        {mode === "register" && <Input label="Ad soyad" name="name" required autoComplete="name" error={fields.name} />}
        <Input label="E-posta" name="email" type="email" required autoComplete="email" error={fields.email} />
        {mode === "register" && <Input label="Firma" name="company" autoComplete="organization" hint="Kurumsal fatura için (isteğe bağlı)" />}
        <Input label="Şifre" name="password" type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"} error={fields.password} hint={mode === "register" ? "En az 8 karakter" : undefined} />
        <button disabled={busy} className="btn btn-primary h-14 w-full">{busy ? "…" : mode === "login" ? "Giriş yap" : "Hesabımı oluştur"}</button>
      </form>
    </div>
  );
}

export default function AccountView({ customer, orders, quotes }: { customer: Cust | null; orders: Order[]; quotes: QuoteRequest[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "quotes" | "addr">("orders");
  const [addrs, setAddrs] = useState<Address[]>(customer?.addresses ?? []);
  const [draft, setDraft] = useState<Partial<Address> | null>(null);
  const [saved, setSaved] = useState(false);

  if (!customer) return <AuthForms />;

  async function persist(next: Address[]) {
    setAddrs(next);
    const r = await fetch("/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addresses: next }) });
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    }
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  const tabBtn = (id: typeof tab, Icon: typeof Package, label: string, n?: number) => (
    <button onClick={() => setTab(id)} className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-[14px] font-semibold transition ${tab === id ? "border-red text-red" : "border-transparent text-ink hover:text-red"}`}>
      <Icon size={16} /> {label}{n !== undefined && <span className="font-mono text-[11px] text-body">{n}</span>}
    </button>
  );

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-gray-50 p-6">
        <div>
          <p className="text-xl font-semibold text-ink">{customer.name}</p>
          <p className="text-[14px] text-body">{customer.email}{customer.company ? ` · ${customer.company}` : ""}</p>
        </div>
        <button onClick={logout} className="btn btn-ghost btn-sm"><LogOut size={15} /> Çıkış yap</button>
      </div>

      <div className="no-scrollbar mt-8 flex overflow-x-auto border-b border-line">
        {tabBtn("orders", Package, "Siparişlerim", orders.length)}
        {tabBtn("quotes", FileText, "Tekliflerim", quotes.length)}
        {tabBtn("addr", MapPin, "Adreslerim", addrs.length)}
      </div>

      <div className="py-8">
        {tab === "orders" &&
          (orders.length === 0 ? (
            <p className="py-12 text-center text-body">Henüz siparişiniz yok. <Link href="/urunler" className="font-semibold text-red">Ürünlere göz atın</Link></p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/siparis/${o.id}`} className="card flex flex-wrap items-center justify-between gap-4 p-5 hover:border-red">
                    <div><p className="font-mono text-[14px] font-semibold text-ink">{o.number}</p><p className="text-[13px] text-body">{formatDate(o.createdAt)} · {o.lines.length} kalem</p></div>
                    <div className="flex items-center gap-5">
                      <span className="rounded-full bg-gray-50 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink">{ORDER_STATUS[o.status]}</span>
                      <span className="font-semibold text-ink">{formatTRY(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "quotes" &&
          (quotes.length === 0 ? (
            <p className="py-12 text-center text-body">Teklif talebiniz yok. <Link href="/teklif-al" className="font-semibold text-red">Teklif isteyin</Link></p>
          ) : (
            <ul className="space-y-3">
              {quotes.map((q) => (
                <li key={q.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div><p className="font-semibold text-ink">{q.product}</p><p className="text-[13px] text-body">{formatDate(q.createdAt)} · {q.qty} adet</p></div>
                  <span className="rounded-full bg-gray-50 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink">{QUOTE_STATUS[q.status]}</span>
                </li>
              ))}
            </ul>
          ))}

        {tab === "addr" && (
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {addrs.map((a) => (
                <li key={a.id} className="card p-5 text-[14px] leading-relaxed text-body">
                  <div className="flex items-start justify-between"><p className="font-semibold text-ink">{a.title}</p><button aria-label="Sil" onClick={() => persist(addrs.filter((x) => x.id !== a.id))} className="text-body hover:text-red"><Trash2 size={16} /></button></div>
                  {a.name} · {a.phone}<br />{a.line1}<br />{a.district} / {a.city} {a.zip}
                </li>
              ))}
              {!draft && (
                <li>
                  <button onClick={() => setDraft({ title: "Teslimat adresi", name: customer.name, phone: customer.phone })} className="flex h-full min-h-32 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-300 text-[14px] font-semibold text-body transition hover:border-red hover:text-red"><Plus size={18} /> Adres ekle</button>
                </li>
              )}
            </ul>
            {draft && (
              <form
                className="mt-6 grid gap-4 rounded-[18px] border border-line p-6 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as unknown as Address;
                  persist([...addrs, { ...f, id: crypto.randomUUID() }]);
                  setDraft(null);
                }}
              >
                <Input label="Adres başlığı" name="title" defaultValue={draft.title} required />
                <Input label="Alıcı" name="name" defaultValue={draft.name} required />
                <Input label="Telefon" name="phone" defaultValue={draft.phone} required />
                <Input label="Posta kodu" name="zip" />
                <Input label="Adres" name="line1" required className="sm:col-span-2" />
                <Input label="İlçe" name="district" required />
                <Input label="İl" name="city" required />
                <div className="flex gap-3 sm:col-span-2"><button className="btn btn-primary">Kaydet</button><button type="button" onClick={() => setDraft(null)} className="btn btn-ghost">Vazgeç</button></div>
              </form>
            )}
            {saved && <p className="mt-4 text-[13px] font-semibold text-emerald-600">Kaydedildi</p>}
          </div>
        )}
      </div>
    </div>
  );
}
