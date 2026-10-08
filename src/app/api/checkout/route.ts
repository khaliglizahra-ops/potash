import { NextResponse } from "next/server";
import { currentCustomer } from "@/lib/server/auth";
import { startIyzico, iyzicoConfigured } from "@/lib/server/iyzico";
import { createOrder, priceCart, updateOrder } from "@/lib/server/orders";
import { clientIp, isEmail, isPhone, isTaxNo, rateLimit, str } from "@/lib/server/security";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`checkout:${ip}`, 12, 10 * 60_000)) return NextResponse.json({ error: "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin." }, { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const priced = priceCart(Array.isArray(b.lines) ? (b.lines as { slug: string; qty: number }[]) : []);
  if ("error" in priced) return NextResponse.json({ error: priced.error }, { status: 422 });

  const name = str(b.name, 100), email = str(b.email, 120).toLowerCase(), phone = str(b.phone, 30);
  const company = str(b.company, 140), taxNo = str(b.taxNo, 20).replace(/\s/g, ""), taxOffice = str(b.taxOffice, 80);
  const line1 = str(b.line1, 250), district = str(b.district, 80), city = str(b.city, 80), zip = str(b.zip, 10);
  const note = str(b.note, 600);
  const payment = b.payment === "havale" ? "havale" : "iyzico";

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Ad soyad gerekli";
  if (!isEmail(email)) errors.email = "Geçerli bir e-posta girin";
  if (!isPhone(phone)) errors.phone = "Geçerli bir telefon girin";
  if (line1.length < 8) errors.line1 = "Adres gerekli";
  if (!district) errors.district = "İlçe gerekli";
  if (!city) errors.city = "İl gerekli";
  if (company && !isTaxNo(taxNo)) errors.taxNo = "Firma siparişlerinde vergi/TC no gerekli (10–11 hane)";
  if (company && !taxOffice) errors.taxOffice = "Vergi dairesi gerekli";
  if (b.terms !== true) errors.terms = "Satış sözleşmesini onaylamalısınız";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Lütfen işaretli alanları düzeltin.", fields: errors }, { status: 422 });

  const me = await currentCustomer();
  const order = await createOrder({
    priced,
    customer: { name, company, email, phone, taxOffice, taxNo },
    shipping: { line1, district, city, zip },
    payment,
    note,
    customerId: me?.id,
  });

  if (payment === "havale") return NextResponse.json({ ok: true, orderId: order.id, redirect: `/siparis/${order.id}` });

  if (!iyzicoConfigured) {
    updateOrder(order.id, { paymentStatus: "basarisiz" });
    return NextResponse.json({ error: "Kart ile ödeme şu an kullanılamıyor. Havale/EFT ile devam edebilirsiniz." }, { status: 503 });
  }
  const start = await startIyzico(order, priced, `${SITE}/api/payment/iyzico/callback`, ip);
  if (start.kind === "error") {
    console.error("[iyzico:init]", order.number, start.message);
    updateOrder(order.id, { paymentStatus: "basarisiz" });
    return NextResponse.json({ error: "Ödeme sayfası açılamadı. Lütfen tekrar deneyin veya Havale/EFT seçin.", orderId: order.id }, { status: 502 });
  }
  updateOrder(order.id, { paymentRef: start.reference });
  return NextResponse.json({ ok: true, orderId: order.id, redirect: start.url });
}
