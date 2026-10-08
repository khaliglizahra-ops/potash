import Image from "next/image";

/** Nükleon wordmark (the client's own logo file) + "LAB". On dark backgrounds it sits on a white chip. */
export function LogoWordmark({ tone = "dark", size = "md" }: { tone?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-7" : size === "sm" ? "h-5" : "h-6 sm:h-7";
  const logo = <Image src="/img/site/nukleon-logo.jpg" alt="Nükleon" width={1621} height={314} priority={size === "md"} className={`${h} w-auto max-w-none`} />;
  if (tone === "light") return <span className="inline-block rounded-lg bg-white px-3.5 py-2.5">{logo}</span>;
  return (
    <span className="inline-flex items-center gap-2.5">
      {logo}
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ink max-[400px]:hidden">Lab</span>
    </span>
  );
}
