"use client";

import { useSearchParams } from "next/navigation";
import QuoteForm from "./QuoteForm";

const TOPICS: Record<string, string> = {
  kurulum: "Anahtar teslim laboratuvar kurulumu hakkında teklif istiyorum.",
  dokuman: "Bu ürün için kullanım kılavuzu ve teknik şartname talep ediyorum.",
  sertifika: "Bu ürün için uygunluk belgelerini talep ediyorum.",
  video: "Bu cihazın tanıtım videosunu / canlı demosunu talep ediyorum.",
};

/** Reads ?urun= / ?konu= in the browser so the quote page can be static. */
export default function QuoteClient({ products }: { products: Record<string, string> }) {
  const sp = useSearchParams();
  const urun = sp.get("urun") ?? "";
  const konu = sp.get("konu") ?? "";
  const initialProduct = products[urun] ?? (urun && !/^[a-z0-9-]+$/.test(urun) ? urun.slice(0, 120) : "");
  return <QuoteForm key={`${urun}|${konu}`} initialProduct={initialProduct} initialMessage={TOPICS[konu] ?? ""} />;
}
