import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export function GET(req: Request) {
  const slugs = (new URL(req.url).searchParams.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 12);
  const all = getProducts();
  return NextResponse.json(slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean));
}
