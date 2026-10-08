import type { Ctx } from "./catalog-core";

/** Static demo build (GitHub Pages): no server, no database. Enabled with NEXT_PUBLIC_DEMO=1. */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix for URLs that bypass next/link and next/image (fetch, GLB loader, …). */
export const withBase = (path: string) => (path.startsWith("/") ? BASE_PATH + path : path);

export const DEMO_NOTICE = "Bu bir demo sürümüdür: formlar ve ödeme kapalıdır, hiçbir bilgi gönderilmez. Canlı sürümde talebiniz satış ekibine iletilir.";

let cached: Promise<Ctx> | null = null;
/** Whole catalogue as one JSON (generated at build time by scripts/build-demo-data.ts). */
export function loadCatalog(): Promise<Ctx> {
  cached ??= fetch(withBase("/demo/catalog.json")).then((r) => r.json() as Promise<Ctx>);
  return cached;
}
