"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { DEMO, DEMO_NOTICE } from "@/lib/demo";
import { Input, Textarea } from "@/components/ui/Field";

const TOPICS = ["Arıza / servis", "Periyodik bakım", "Kalibrasyon", "Yedek parça", "Kurulum ve eğitim", "Diğer"];

export default function SupportForm() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (DEMO) return setErr(DEMO_NOTICE);
    setErr("");
    setFields({});
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error ?? "Gönderilemedi.");
        setFields(d.fields ?? {});
      } else setDone(true);
    } catch {
      setErr("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="rounded-[20px] border border-line bg-gray-50 p-10 text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
        <h3 className="mt-5 text-2xl font-semibold">Talebiniz alındı.</h3>
        <p className="mx-auto mt-3 max-w-sm text-body">Teknik servis ekibimiz en kısa sürede sizi arayacak.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {err && <p role="alert" className="rounded-xl border border-red/30 bg-red/[0.04] px-4 py-3 text-[14px] font-medium text-ink sm:col-span-2">{err}</p>}
      <Input label="Ad soyad" name="name" required autoComplete="name" error={fields.name} />
      <Input label="E-posta" name="email" type="email" required autoComplete="email" error={fields.email} />
      <Input label="Telefon" name="phone" type="tel" autoComplete="tel" error={fields.phone} />
      <div>
        <label htmlFor="topic" className="label">Konu</label>
        <select id="topic" name="topic" className="field">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <Input label="Cihaz modeli / seri no" name="device" className="sm:col-span-2" placeholder="Örn. NST-120, seri no 2406-118" />
      <Textarea label="Sorunu anlatın" name="message" required className="sm:col-span-2" error={fields.message} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="sm:col-span-2"><button disabled={busy} className="btn btn-primary h-14 px-10"><Send size={16} /> {busy ? "Gönderiliyor…" : "Destek talebi gönder"}</button></div>
    </form>
  );
}
