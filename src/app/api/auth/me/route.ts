import { NextResponse } from "next/server";
import { currentCustomer, publicCustomer, saveAddresses } from "@/lib/server/auth";
import { str } from "@/lib/server/security";
import { randomUUID } from "node:crypto";
import type { Address } from "@/lib/types";

export async function GET() {
  const c = await currentCustomer();
  return NextResponse.json({ customer: c ? publicCustomer(c) : null });
}

/** Replace the saved address list. */
export async function PUT(req: Request) {
  const c = await currentCustomer();
  if (!c) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { addresses?: Partial<Address>[] };
  const addresses: Address[] = (b.addresses ?? []).slice(0, 10).map((a) => ({
    id: str(a.id, 60) || randomUUID(), title: str(a.title, 40) || "Adres", name: str(a.name, 100), phone: str(a.phone, 30),
    line1: str(a.line1, 250), district: str(a.district, 80), city: str(a.city, 80), zip: str(a.zip, 10),
  }));
  saveAddresses(c, addresses);
  return NextResponse.json({ ok: true, addresses });
}
