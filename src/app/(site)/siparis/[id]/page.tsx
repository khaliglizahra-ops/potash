import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import ClearCart from "@/components/shop/ClearCart";
import { getOrder } from "@/lib/server/orders";
import { formatDate, formatTRY } from "@/lib/text";

export const metadata: Metadata = { title: "Siparişiniz", robots: { index: false, follow: false } };

const STATUS: Record<string, string> = { alindi: "Alındı", hazirlaniyor: "Hazırlanıyor", kargoda: "Kargoda", "teslim-edildi": "Teslim edildi", iptal: "İptal edildi" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ durum?: string }> }) {
  const { id } = await params;
  const { durum } = await searchParams;
  const o = getOrder(id);
  if (!o) notFound();
  const paid = o.paymentStatus === "odendi";
  const failed = o.paymentStatus === "basarisiz" || durum === "basarisiz";
  const uncertain = durum === "belirsiz" && !paid;
  const iban = process.env.BANK_IBAN;

  const tone = paid || (o.payment === "havale" && !failed) ? "ok" : failed ? "bad" : "wait";
  const Icon = tone === "ok" ? CheckCircle2 : tone === "bad" ? XCircle : Clock;

  return (
    <div className="container-x py-12 sm:py-16">
      {(paid || o.payment === "havale") && <ClearCart />}
      <div className="mx-auto max-w-3xl">
        <Icon size={52} className={tone === "ok" ? "text-emerald-500" : tone === "bad" ? "text-red" : "text-amber-500"} />
        <h1 className="mt-6 text-[clamp(30px,4vw,48px)] font-semibold leading-tight tracking-tight">
          {paid ? "Ödemeniz alındı, teşekkürler." : failed ? "Ödeme tamamlanamadı." : uncertain ? "Ödeme sonucu doğrulanıyor." : o.payment === "havale" ? "Siparişiniz alındı." : "Siparişiniz oluşturuldu."}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-body">
          Sipariş no: <b className="font-mono text-ink">{o.number}</b> · {formatDate(o.createdAt)}. {failed ? "Sepetiniz korundu, ödemeyi yeniden deneyebilirsiniz." : `Onay ${o.customer.email} adresine gönderilecektir.`}
        </p>

        {o.payment === "havale" && !paid && (
          <div className="mt-8 rounded-[18px] border border-red/25 bg-red/[0.03] p-6">
            <h2 className="font-semibold text-ink">Havale / EFT bilgileri</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Lütfen <b className="text-ink">{formatTRY(o.total)}</b> tutarını açıklama kısmına <b className="font-mono text-ink">{o.number}</b> yazarak gönderin. Ödeme ulaştığında siparişiniz hazırlanmaya başlar.
            </p>
            <p className="mt-3 font-mono text-[14px] text-ink">{iban ? `${process.env.BANK_NAME ?? "Nükleon Lab"} · ${iban}` : "Banka hesap bilgileri satış ekibimiz tarafından e-posta ile iletilecektir."}</p>
          </div>
        )}

        <div className="mt-10 overflow-hidden rounded-[18px] border border-line">
          <div className="flex items-center justify-between bg-gray-50 px-6 py-4 text-[14px]">
            <span className="font-semibold text-ink">Sipariş durumu</span>
            <span className="rounded-full bg-ink px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white">{STATUS[o.status]}</span>
          </div>
          <ul className="divide-y divide-line">
            {o.lines.map((l) => (
              <li key={l.slug} className="flex items-center justify-between gap-4 px-6 py-4 text-[14.5px]">
                <span><Link href={`/urunler/${l.slug}`} className="font-semibold text-ink hover:text-red">{l.name}</Link><span className="block font-mono text-[12px] text-body">{l.sku} × {l.qty}</span></span>
                <span className="font-medium text-ink">{formatTRY(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line bg-gray-50 px-6 py-5 text-[14.5px]">
            <div className="flex justify-between"><dt>Ara toplam</dt><dd>{formatTRY(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>KDV</dt><dd>{formatTRY(o.vat)}</dd></div>
            <div className="flex justify-between"><dt>Kargo</dt><dd>{o.shippingCost ? formatTRY(o.shippingCost) : "Ücretsiz"}</dd></div>
            <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-semibold text-ink"><dt>Toplam</dt><dd>{formatTRY(o.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-6 grid gap-6 text-[14px] sm:grid-cols-2">
          <div><h3 className="eyebrow">Teslimat</h3><p className="mt-2 leading-relaxed text-body">{o.customer.name}<br />{o.shipping.line1}<br />{o.shipping.district} / {o.shipping.city}</p></div>
          <div><h3 className="eyebrow">Fatura</h3><p className="mt-2 leading-relaxed text-body">{o.customer.company || o.customer.name}{o.customer.taxNo && <><br />{o.customer.taxOffice} · {o.customer.taxNo}</>}</p></div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {failed ? <Link href="/sepet" className="btn btn-primary">Sepete dön</Link> : <Link href="/urunler" className="btn btn-primary">Alışverişe devam et</Link>}
          <Link href="/hesabim" className="btn btn-ghost">Siparişlerim</Link>
        </div>
      </div>
    </div>
  );
}
