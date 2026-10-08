import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@/lib/db";
import { clientIp, isEmail, isPhone, rateLimit, str } from "@/lib/server/security";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 6, 10 * 60_000)) return NextResponse.json({ error: "Çok fazla talep. Lütfen biraz bekleyin." }, { status: 429 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  if (str(b.website, 50)) return NextResponse.json({ ok: true });
  const name = str(b.name, 100), email = str(b.email, 120).toLowerCase(), phone = str(b.phone, 30), topic = str(b.topic, 60), device = str(b.device, 120), message = str(b.message, 3000);
  const fields: Record<string, string> = {};
  if (name.length < 3) fields.name = "Ad soyad gerekli";
  if (!isEmail(email)) fields.email = "Geçerli bir e-posta girin";
  if (phone && !isPhone(phone)) fields.phone = "Geçerli bir telefon girin";
  if (message.length < 10) fields.message = "Lütfen sorunu birkaç cümleyle anlatın";
  if (Object.keys(fields).length) return NextResponse.json({ error: "Lütfen işaretli alanları düzeltin.", fields }, { status: 422 });
  put("contact", { id: randomUUID(), name, email, phone, topic, device, message, status: "yeni", createdAt: new Date().toISOString() } as never);
  return NextResponse.json({ ok: true });
}
