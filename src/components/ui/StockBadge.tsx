import { stockInfo } from "@/lib/product-utils";

export default function StockBadge({ stock, leadTimeDays, price, className = "" }: { stock: number; leadTimeDays: number; price: number | null; className?: string }) {
  const s = stockInfo({ stock, leadTimeDays, price });
  const dot = s.tone === "ok" ? "bg-emerald-500" : s.tone === "warn" ? "bg-amber-500" : "bg-gray-300";
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-medium text-ink ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {s.label}
    </span>
  );
}
