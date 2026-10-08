import { NextResponse } from "next/server";
import { checkAdminPassword, startAdminSession } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/security";

export async function POST(req: Request) {
  if (!rateLimit(`admin:${clientIp(req)}`, 6, 15 * 60_000)) return NextResponse.json({ error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as { password?: string };
  if (!checkAdminPassword(typeof b.password === "string" ? b.password : "")) return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  await startAdminSession();
  return NextResponse.json({ ok: true });
}
