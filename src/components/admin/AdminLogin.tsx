"use client";

import { LogoWordmark } from "@/components/ui/Logo";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: new FormData(e.currentTarget).get("password") }) });
    setBusy(false);
    if (r.ok) {
      router.push("/admin");
      router.refresh();
    } else setErr((await r.json()).error ?? "Hata");
  }
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[20px] border border-line bg-white p-8 shadow-[var(--shadow-soft)]">
        <LogoWordmark size="lg" />
        <h1 className="mt-8 text-2xl font-semibold">Yönetim girişi</h1>
        <label htmlFor="password" className="label mt-6">Şifre</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
        {err && <p role="alert" className="mt-3 text-[13px] font-medium text-red">{err}</p>}
        <button disabled={busy} className="btn btn-primary mt-6 w-full">{busy ? "…" : "Giriş yap"}</button>
      </form>
    </div>
  );
}
