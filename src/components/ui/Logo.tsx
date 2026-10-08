/** Potash wordmark: a red crystal cube + "Potash". Pure markup, works in server and client components. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon points="16,1.5 29,9 29,23 16,30.5 3,23 3,9" fill="#c8102e" />
      <polygon points="16,1.5 29,9 16,16.5 3,9" fill="#e31b3b" />
      <path d="M16 16.5V30.5M16 16.5L3 9M16 16.5L29 9" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function LogoWordmark({ tone = "dark", size = "md" }: { tone?: "dark" | "light"; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const text = size === "lg" ? "text-[28px]" : size === "sm" ? "text-[19px]" : "text-[23px]";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={`${box} shrink-0`} />
      <span className={`${text} font-semibold leading-none tracking-[-0.04em] ${tone === "light" ? "text-white" : "text-ink"}`}>Potash</span>
    </span>
  );
}
