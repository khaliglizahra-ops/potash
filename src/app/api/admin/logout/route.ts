import { NextResponse } from "next/server";
import { endAdminSession } from "@/lib/server/auth";

export async function POST() {
  await endAdminSession();
  return NextResponse.json({ ok: true });
}
