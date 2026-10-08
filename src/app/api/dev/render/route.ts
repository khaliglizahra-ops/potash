import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const name = new URL(req.url).searchParams.get("name") ?? "";
  if (!/^[a-z0-9-]+$/.test(name)) return new NextResponse("bad name", { status: 400 });
  writeFileSync(join(/* turbopackIgnore: true */ process.cwd(), "public", "img", "renders", `${name}.png`), Buffer.from(await req.arrayBuffer()));
  return NextResponse.json({ ok: true });
}
