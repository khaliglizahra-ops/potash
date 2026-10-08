import { existsSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { NextResponse } from "next/server";

const DIR = resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "uploads");
const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", avif: "image/avif", glb: "model/gltf-binary", pdf: "application/pdf" };

/** Uploaded files live outside /public so they survive redeploys and are served on a standalone build too. */
export async function GET(_: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const file = resolve(join(DIR, path.join("/")));
  if (!file.startsWith(DIR + sep) || !existsSync(file)) return new NextResponse("Not found", { status: 404 });
  const type = TYPES[file.split(".").pop() ?? ""];
  if (!type) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(readFileSync(file)), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
