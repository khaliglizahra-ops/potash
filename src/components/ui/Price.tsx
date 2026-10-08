import { formatTRY } from "@/lib/text";

export default function Price({ price, size = "md", className = "" }: { price: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "lg" ? "text-3xl" : size === "sm" ? "text-[15px]" : "text-xl";
  if (price === null)
    return (
      <span className={`font-semibold text-ink ${s} ${className}`}>
        Teklif <span className="text-red">Al</span>
      </span>
    );
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className={`font-semibold tracking-tight text-ink ${s}`}>{formatTRY(price)}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-body/70">+ KDV</span>
    </span>
  );
}
