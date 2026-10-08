import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHead({ eyebrow, title, intro, href, cta }: { eyebrow: string; title: string; intro?: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-4">{title}</h2>
        {intro && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">{intro}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-ink hover:text-red">
          {cta ?? "Tümünü gör"} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
