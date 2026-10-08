import { NextResponse } from "next/server";
import { publicCustomer, registerCustomer, startCustomerSession } from "@/lib/server/auth";
import { clientIp, isEmail, rateLimit, str } from "@/lib/server/security";

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60 * 60_000)) return NextResponse.json({ error: "Çok fazla deneme." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = str(b.name, 100), email = str(b.email, 120).toLowerCase(), password = typeof b.password === "string" ? b.password.slice(0, 200) : "";
  const fields: Record<string, string> = {};
  if (name.length < 3) fields.name = "Ad soyad gerekli";
  if (!isEmail(email)) fields.email = "Geçerli bir e-posta girin";
  if (password.length < 8) fields.password = "Şifre en az 8 karakter olmalı";
  if (Object.keys(fields).length) return NextResponse.json({ error: "Lütfen işaretli alanları düzeltin.", fields }, { status: 422 });
  const c = registerCustomer({ name, email, password, phone: str(b.phone, 30), company: str(b.company, 140) });
  if (c === "exists") return NextResponse.json({ error: "Bu e-posta ile kayıtlı bir hesap var. Giriş yapın.", fields: { email: "Kayıtlı e-posta" } }, { status: 409 });
  await startCustomerSession(c);
  return NextResponse.json({ ok: true, customer: publicCustomer(c) });
}
