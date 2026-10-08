"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { DEMO, DEMO_NOTICE } from "@/lib/demo";
import { Input, Textarea } from "@/components/ui/Field";

export default function QuoteForm({ initialProduct = "", initialMessage = "", initialQty = 1 }: { initialProduct?: string; initialMessage?: string; initialQty?: number }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [ref, setRef] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (DEMO) return setErr(DEMO_NOTICE);
    setErr("");
    setFields({});
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error ?? "Gönderilemedi.");
        setFields(d.fields ?? {});
      } else setRef(d.ref ?? "ok");
    } catch {
      setErr("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  if (ref)
    return (
      <div className="rounded-[20px] border border-line bg-gray-50 p-10 text-center sm:p-14">
        <CheckCircle2 size={52} className="mx-auto text-emerald-500" />
        <h2 className="mt-6 text-3xl font-semibold tracking-tight">Talebiniz bize ulaştı.</h2>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-body">
          Talep numaranız <b className="font-mono text-ink">{ref}</b>. Satış mühendisimiz 1 iş günü içinde sizinle iletişime geçecek.
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {err && <p role="alert" className="rounded-xl border border-red/30 bg-red/[0.04] px-4 py-3 text-[14px] font-medium text-ink sm:col-span-2">{err}</p>}
      <Input label="Ad soyad" name="name" required autoComplete="name" error={fields.name} />
      <Input label="Firma / kurum" name="company" required autoComplete="organization" error={fields.company} />
      <Input label="Telefon" name="phone" type="tel" required autoComplete="tel" error={fields.phone} />
      <Input label="E-posta" name="email" type="email" required autoComplete="email" error={fields.email} />
      <Input label="Vergi no" name="taxNo" inputMode="numeric" hint="İsteğe bağlı" error={fields.taxNo} />
      <Input label="Adet" name="qty" type="number" min={1} max={999} defaultValue={initialQty} />
      <Input label="Ürün / ihtiyaç" name="product" required defaultValue={initialProduct} error={fields.product} className="sm:col-span-2" placeholder="Örn. NIN-110 inkübatör ya da 40 m² gıda laboratuvarı" />
      <Textarea label="Mesaj" name="message" defaultValue={initialMessage} className="sm:col-span-2" hint="Kullanım amacı, özel ölçü, teslim tarihi gibi ayrıntılar." />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="sm:col-span-2">
        <button disabled={busy} className="btn btn-primary h-14 w-full text-[13px] sm:w-auto sm:px-10">
          <Send size={16} /> {busy ? "Gönderiliyor…" : "Kurumsal teklif talebi gönder"}
        </button>
        <p className="mt-4 text-[12.5px] leading-relaxed text-body">Bilgileriniz yalnızca teklif hazırlamak için kullanılır. <Link href="/yasal/kvkk" className="underline">KVKK aydınlatma metni</Link></p>
      </div>
    </form>
  );
}
