import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put, nextSeq } from "@/lib/db";
import { clientIp, isEmail, isPhone, isTaxNo, rateLimit, str } from "@/lib/server/security";
import type { QuoteRequest } from "@/lib/types";

export async function POST(req: Request) {
  if (!rateLimit(`quote:${clientIp(req)}`, 6, 10 * 60_000)) return NextResponse.json({ error: "Çok fazla talep gönderdiniz. Lütfen biraz bekleyin." }, { status: 429 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  if (str(b.website, 50)) return NextResponse.json({ ok: true }); // honeypot

  const name = str(b.name, 100), company = str(b.company, 140), phone = str(b.phone, 30), email = str(b.email, 120).toLowerCase();
  const taxNo = str(b.taxNo, 20), product = str(b.product, 160), message = str(b.message, 2000);
  const qty = Math.min(999, Math.max(1, Math.floor(Number(b.qty) || 1)));

  const fields: Record<string, string> = {};
  if (name.length < 3) fields.name = "Ad soyad gerekli";
  if (company.length < 2) fields.company = "Firma / kurum adı gerekli";
  if (!isPhone(phone)) fields.phone = "Geçerli bir telefon girin";
  if (!isEmail(email)) fields.email = "Geçerli bir e-posta girin";
  if (taxNo && !isTaxNo(taxNo)) fields.taxNo = "10 veya 11 haneli olmalı";
  if (product.length < 2) fields.product = "Ürün veya ihtiyaç belirtin";
  if (Object.keys(fields).length) return NextResponse.json({ error: "Lütfen işaretli alanları düzeltin.", fields }, { status: 422 });

  const q: QuoteRequest = {
    id: randomUUID(), name, company, phone, email, taxNo, product, qty, message, status: "yeni", createdAt: new Date().toISOString(),
  };
  put("quote", q);
  return NextResponse.json({ ok: true, ref: `TK-${new Date().getFullYear()}-${String(nextSeq("quote")).padStart(4, "0")}` });
}
