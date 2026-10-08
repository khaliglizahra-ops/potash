import { NextResponse } from "next/server";
import { list, put } from "@/lib/db";
import { guard } from "@/lib/server/admin";

const ALLOWED = {
  order: { field: "status", values: ["alindi", "hazirlaniyor", "kargoda", "teslim-edildi", "iptal"] },
  orderPayment: { field: "paymentStatus", values: ["bekliyor", "odendi", "basarisiz"] },
  quote: { field: "status", values: ["yeni", "inceleniyor", "teklif-gonderildi", "kapandi"] },
  contact: { field: "status", values: ["yeni", "inceleniyor", "kapandi"] },
} as const;

export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as { kind?: keyof typeof ALLOWED; id?: string; value?: string };
  const rule = b.kind && ALLOWED[b.kind];
  if (!rule || !b.value || !(rule.values as readonly string[]).includes(b.value)) return NextResponse.json({ error: "Geçersiz değer." }, { status: 400 });
  const docKind = b.kind === "orderPayment" ? "order" : b.kind!;
  const doc = list<Record<string, unknown> & { id: string }>(docKind as "order").find((d) => d.id === b.id);
  if (!doc) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  put(docKind as "order", { ...doc, [rule.field]: b.value } as never);
  return NextResponse.json({ ok: true });
}
