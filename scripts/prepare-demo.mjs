/**
 * Turns a fresh checkout into the static GitHub Pages demo. Run by CI only (it deletes server-only code),
 * never on your working copy:  node scripts/prepare-demo.mjs
 */
import { appendFileSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// 1. Server-only routes can't exist in a static export.
for (const p of ["src/app/api", "src/app/admin", "src/app/uploads", "src/app/dev", "src/app/(site)/siparis"]) rmSync(p, { recursive: true, force: true });

// 2. Account page becomes a notice (the real one needs cookies + a database).
writeFileSync(
  "src/app/(site)/hesabim/page.tsx",
  `import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false, follow: false } };

export default function AccountDemo() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Hesabım", href: "/hesabim" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Hesabım</h1>
      <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-body">Üyelik, sipariş geçmişi ve adres defteri canlı sürümde çalışır. Bu demo sürümünde kapalıdır.</p>
      <Link href="/urunler" className="btn btn-primary mt-8">Ürünlere dön</Link>
    </div>
  );
}
`,
);

// robots/sitemap are route handlers: a static export wants them explicitly marked static.
for (const p of ["src/app/robots.ts", "src/app/sitemap.ts"]) appendFileSync(p, '\nexport const dynamic = "force-static";\n');

// 3. Static hosting has no image optimizer: shrink the oversized originals once.
const MAX = 1400;
for (const dir of ["public/img/products", "public/img/site"]) {
  for (const f of readdirSync(dir)) {
    const file = join(dir, f);
    if (!statSync(file).isFile() || !/\.(jpe?g|png)$/i.test(f)) continue;
    const img = sharp(file);
    const { width = 0 } = await img.metadata();
    if (width <= MAX && statSync(file).size < 400_000) continue;
    const buf = await (/\.png$/i.test(f) ? img.resize({ width: Math.min(width, MAX) }).png({ compressionLevel: 9 }) : img.resize({ width: Math.min(width, MAX) }).jpeg({ quality: 82 })).toBuffer();
    writeFileSync(file, buf);
  }
}
mkdirSync("public/demo", { recursive: true });
console.log("demo prepared");
