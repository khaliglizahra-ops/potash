import { NextResponse } from "next/server";
import { getOrders, updateOrder } from "@/lib/server/orders";
import { verifyIyzico } from "@/lib/server/iyzico";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** iyzico posts the shopper's browser back here. The form body is untrusted: we only take the token and ask iyzico what happened. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = typeof form?.get("token") === "string" ? (form!.get("token") as string) : "";
  const back = (path: string) => NextResponse.redirect(`${SITE}${path}`, 303);
  if (!token) return back("/sepet?odeme=hata");

  const order = getOrders().find((o) => o.paymentRef === token);
  if (!order) return back("/sepet?odeme=hata");
  if (order.paymentStatus === "odendi") return back(`/siparis/${order.id}`);

  const v = await verifyIyzico(token);
  const ok = v.reached && v.paid && v.basketId === order.number && v.paidPriceK === Math.round(order.total * 100);
  if (!v.reached) return back(`/siparis/${order.id}?durum=belirsiz`);
  updateOrder(order.id, ok ? { paymentStatus: "odendi", status: "hazirlaniyor" } : { paymentStatus: "basarisiz" });
  return back(`/siparis/${order.id}${ok ? "" : "?durum=basarisiz"}`);
}
