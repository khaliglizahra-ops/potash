import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join, resolve } from "node:path";
import { NextResponse } from "next/server";
import { guard } from "@/lib/server/admin";

export const UPLOAD_DIR = resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "uploads");

const KINDS = {
  image: { max: 8 * 1024 * 1024 },
  model: { max: 30 * 1024 * 1024 },
  pdf: { max: 20 * 1024 * 1024 },
} as const;

/** Decide the real type from magic bytes, not from the client-supplied name or MIME. */
function sniff(b: Buffer): { kind: keyof typeof KINDS; ext: string } | null {
  if (b.length < 12) return null;
  if (b.subarray(0, 4).toString("latin1") === "glTF") return { kind: "model", ext: "glb" };
  if (b.subarray(0, 4).toString("latin1") === "%PDF") return { kind: "pdf", ext: "pdf" };
  if (b[0] === 0x89 && b.subarray(1, 4).toString("latin1") === "PNG") return { kind: "image", ext: "png" };
  if (b[0] === 0xff && b[1] === 0xd8) return { kind: "image", ext: "jpg" };
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return { kind: "image", ext: "webp" };
  if (b.subarray(4, 12).toString("latin1").startsWith("ftypavif")) return { kind: "image", ext: "avif" };
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("file") ?? []).filter((f): f is File => f instanceof File).slice(0, 12);
  if (!files.length) return NextResponse.json({ error: "Dosya yok." }, { status: 400 });

  mkdirSync(UPLOAD_DIR, { recursive: true });
  const out: { url: string; kind: string; name: string }[] = [];
  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer());
    const t = sniff(buf);
    if (!t) return NextResponse.json({ error: `${f.name}: desteklenmeyen dosya türü (PNG, JPG, WebP, AVIF, GLB, PDF).` }, { status: 415 });
    if (buf.length > KINDS[t.kind].max) return NextResponse.json({ error: `${f.name}: dosya çok büyük.` }, { status: 413 });
    const name = `${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.${t.ext}`;
    writeFileSync(join(UPLOAD_DIR, name), buf);
    out.push({ url: `/uploads/${name}`, kind: t.kind, name: f.name });
  }
  return NextResponse.json({ files: out });
}
