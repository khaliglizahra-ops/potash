import { NextResponse } from "next/server";
import { checkLogin, publicCustomer, startCustomerSession } from "@/lib/server/auth";
import { clientIp, rateLimit, str } from "@/lib/server/security";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 15 * 60_000)) return NextResponse.json({ error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const c = checkLogin(str(b.email, 120), str(b.password, 200));
  if (!c) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  await startCustomerSession(c);
  return NextResponse.json({ ok: true, customer: publicCustomer(c) });
}
