import StatusSelect from "@/components/admin/StatusSelect";
import { requireAdmin } from "@/lib/server/admin";
import { getOrders } from "@/lib/server/orders";
import { formatDate, formatTRY } from "@/lib/text";

export const metadata = { title: "Siparişler" };

export default async function Page() {
  await requireAdmin();
  const orders = getOrders();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Siparişler <span className="font-mono text-base font-normal text-body">{orders.length}</span></h1>
      <ul className="mt-8 space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[15px] font-semibold text-ink">{o.number} <span className="ml-2 font-sans text-[13px] font-normal text-body">{formatDate(o.createdAt)} · {o.payment === "iyzico" ? "Kart (iyzico)" : "Havale/EFT"}</span></p>
                <p className="mt-1 text-[14px] text-body">{o.customer.company || o.customer.name} · {o.customer.phone} · {o.customer.email}</p>
                <p className="text-[14px] text-body">{o.shipping.line1}, {o.shipping.district} / {o.shipping.city}{o.customer.taxNo && ` · ${o.customer.taxOffice} ${o.customer.taxNo}`}</p>
              </div>
              <p className="text-xl font-semibold text-ink">{formatTRY(o.total)}</p>
            </div>
            <ul className="mt-4 divide-y divide-line border-y border-line text-[14px]">{o.lines.map((l) => <li key={l.slug} className="flex justify-between py-2"><span>{l.name} <span className="font-mono text-[12px] text-body">× {l.qty}</span></span><span className="font-mono">{formatTRY(l.unitPrice * l.qty)}</span></li>)}</ul>
            {o.note && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-[13.5px] text-body">Not: {o.note}</p>}
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[13px] text-body">Ödeme <StatusSelect kind="orderPayment" id={o.id} value={o.paymentStatus} options={[["bekliyor", "Bekliyor"], ["odendi", "Ödendi"], ["basarisiz", "Başarısız"]]} /></label>
              <label className="flex items-center gap-2 text-[13px] text-body">Sipariş <StatusSelect kind="order" id={o.id} value={o.status} options={[["alindi", "Alındı"], ["hazirlaniyor", "Hazırlanıyor"], ["kargoda", "Kargoda"], ["teslim-edildi", "Teslim edildi"], ["iptal", "İptal"]]} /></label>
            </div>
          </li>
        ))}
        {orders.length === 0 && <li className="rounded-[16px] border border-dashed border-gray-300 p-14 text-center text-body">Henüz sipariş yok.</li>}
      </ul>
    </div>
  );
}
