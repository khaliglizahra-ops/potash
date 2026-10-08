import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export default function Breadcrumb({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: "Ana Sayfa", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Sayfa yolu" className="font-mono text-[12px] text-body">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((it, i) => (
            <li key={it.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
              {i === all.length - 1 ? <span aria-current="page" className="text-ink">{it.name}</span> : <Link href={it.href} className="transition hover:text-red">{it.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}
