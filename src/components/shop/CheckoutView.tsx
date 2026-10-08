"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, CreditCard, Landmark, Lock } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Field";
import { DEMO, DEMO_NOTICE } from "@/lib/demo";
import { formatTRY } from "@/lib/text";
import { cartTotals } from "@/store/shop";
import { useShopValue } from "@/store/hooks";
import { Summary } from "./CartView";

type Errors = Record<string, string>;

export default function CheckoutView({ cardEnabled = true }: { cardEnabled?: boolean }) {
  const router = useRouter();
  const cart = useShopValue((s) => s.cart, []);
  const [corp, setCorp] = useState(false);
  const [pay, setPay] = useState<"iyzico" | "havale">(cardEnabled ? "iyzico" : "havale");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");
  const [fields, setFields] = useState<Errors>({});
  const [pre, setPre] = useState<Record<string, string>>({});
  const t = cartTotals(cart);

  useEffect(() => {
    if (DEMO) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ customer: c }) => {
        if (!c) return;
        const a = c.addresses?.[0];
        setPre({ name: c.name, email: c.email, phone: c.phone ?? "", company: c.company ?? "", line1: a?.line1 ?? "", district: a?.district ?? "", city: a?.city ?? "", zip: a?.zip ?? "" });
        if (c.company) setCorp(true);
      })
      .catch(() => {});
  }, []);

  if (cart.length === 0)
    return (
      <div className="mt-12 rounded-[18px] border border-dashed border-gray-300 px-6 py-20 text-center">
        <p className="text-xl font-semibold text-ink">Ödeme için sepetinizde ürün yok</p>
        <Link href="/urunler" className="btn btn-primary mt-6">Ürünlere git</Link>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (DEMO) return setErr(DEMO_NOTICE);
    setErr("");
    setFields({});
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      ...Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")),
      terms: fd.get("terms") === "on",
      payment: pay,
      lines: cart.map((l) => ({ slug: l.slug, qty: l.qty })),
    };
    if (!corp) {
      body.company = "";
      body.taxNo = "";
      body.taxOffice = "";
    }
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error ?? "Bir sorun oluştu.");
        setFields(d.fields ?? {});
        document.querySelector("[data-first-error]")?.scrollIntoView({ block: "center" });
        return;
      }
      if (d.redirect.startsWith("http")) window.location.assign(d.redirect);
      else router.push(d.redirect);
    } catch {
      setErr("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  const f = (name: string) => ({ name, defaultValue: pre[name] ?? "", error: fields[name] });
  const sectionTitle = "mb-5 flex items-center gap-3 text-xl font-semibold tracking-tight text-ink";
  const num = "grid h-8 w-8 place-items-center rounded-full bg-red font-mono text-[13px] text-white";

  return (
    <form onSubmit={submit} noValidate className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_400px] xl:gap-16" key={JSON.stringify(pre)}>
      <div className="space-y-12">
        {err && <p role="alert" data-first-error className="rounded-xl border border-red/30 bg-red/[0.04] px-4 py-3 text-[14px] font-medium text-ink">{err}</p>}

        <section>
          <h2 className={sectionTitle}><span className={num}>1</span> İletişim ve fatura</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ad soyad" autoComplete="name" required {...f("name")} />
            <Input label="E-posta" type="email" autoComplete="email" required {...f("email")} />
            <Input label="Telefon" type="tel" autoComplete="tel" required placeholder="05xx xxx xx xx" {...f("phone")} className="sm:col-span-2" />
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 transition hover:border-red/40">
            <input type="checkbox" checked={corp} onChange={(e) => setCorp(e.target.checked)} className="h-[18px] w-[18px] accent-[#c8102e]" />
            <Building2 size={18} className="text-red" />
            <span className="text-[14px] font-medium text-ink">Kurumsal fatura istiyorum</span>
          </label>
          {corp && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Firma / kurum adı" required autoComplete="organization" {...f("company")} className="sm:col-span-2" />
              <Input label="Vergi dairesi" required {...f("taxOffice")} />
              <Input label="Vergi / TC kimlik no" required inputMode="numeric" {...f("taxNo")} />
            </div>
          )}
        </section>

        <section>
          <h2 className={sectionTitle}><span className={num}>2</span> Teslimat adresi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Adres" required autoComplete="street-address" {...f("line1")} className="sm:col-span-2" />
            <Input label="İlçe" required {...f("district")} />
            <Input label="İl" required autoComplete="address-level1" {...f("city")} />
            <Input label="Posta kodu" inputMode="numeric" autoComplete="postal-code" {...f("zip")} />
          </div>
          <Textarea label="Sipariş notu" name="note" rows={3} className="mt-4" hint="Teslimat saati, kurulum talebi vb." />
        </section>

        <section>
          <h2 className={sectionTitle}><span className={num}>3</span> Ödeme yöntemi</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["iyzico", CreditCard, "Kredi / banka kartı", "iyzico güvenli ödeme sayfası · taksit seçenekleri"],
              ["havale", Landmark, "Havale / EFT", "Sipariş onayından sonra banka bilgileri iletilir"],
            ] as const).filter(([id]) => cardEnabled || id === "havale").map(([id, Icon, title, text]) => (
              <label key={id} className={`flex cursor-pointer gap-4 rounded-xl border p-5 transition ${pay === id ? "border-red bg-red/[0.03] shadow-[0_0_0_3px_rgba(200,16,46,0.1)]" : "border-gray-300 hover:border-red/50"}`}>
                <input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} className="sr-only" />
                <Icon size={22} className={pay === id ? "text-red" : "text-body"} />
                <span>
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-body">{text}</span>
                </span>
              </label>
            ))}
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-body">
            <input type="checkbox" name="terms" className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#c8102e]" />
            <span>
              <Link href="/yasal/mesafeli-satis" target="_blank" className="font-semibold text-ink underline">Mesafeli satış sözleşmesi</Link> ve <Link href="/yasal/kvkk" target="_blank" className="font-semibold text-ink underline">KVKK aydınlatma metnini</Link> okudum, onaylıyorum.
            </span>
          </label>
          {fields.terms && <p role="alert" className="mt-2 text-[12px] font-medium text-red">{fields.terms}</p>}
        </section>

        <div className="lg:hidden">
          <button type="submit" disabled={busy} className="btn btn-primary h-14 w-full">
            <Lock size={16} /> {busy ? "İşleniyor…" : pay === "iyzico" ? `Güvenli ödemeye geç · ${formatTRY(t.total)}` : `Siparişi tamamla · ${formatTRY(t.total)}`}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-[100px]">
        <Summary
          cardNote={cardEnabled}
          cta={
            <button type="submit" disabled={busy} className="btn btn-primary hidden h-14 w-full lg:inline-flex">
              <Lock size={16} /> {busy ? "İşleniyor…" : pay === "iyzico" ? "Güvenli ödemeye geç" : "Siparişi tamamla"}
            </button>
          }
        />
        <ul className="mt-5 space-y-3 rounded-[18px] border border-line p-5">
          {cart.map((l) => (
            <li key={l.slug} className="flex items-center gap-3 text-[13px]">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50"><Image src={l.p.image} alt="" fill sizes="48px" className="packshot object-contain p-1" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-medium text-ink">{l.p.name}</span><span className="text-body">{l.qty} adet</span></span>
              <span className="font-medium text-ink">{formatTRY((l.p.price ?? 0) * l.qty)}</span>
            </li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
