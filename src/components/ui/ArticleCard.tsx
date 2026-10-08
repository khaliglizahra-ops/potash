import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ARTICLE_CATEGORIES } from "@/lib/data/article-categories";
import { formatDate } from "@/lib/text";
import type { Article } from "@/lib/types";

export default function ArticleCard({ a, featured = false }: { a: Article; featured?: boolean }) {
  const cat = ARTICLE_CATEGORIES.find((c) => c.slug === a.category)?.name ?? "";
  return (
    <Link href={`/bilgi-merkezi/${a.slug}`} className={`card group flex overflow-hidden hover:-translate-y-1 hover:border-red/40 hover:shadow-[var(--shadow-lift)] ${featured ? "flex-col md:flex-row" : "flex-col"}`}>
      <div className={`relative overflow-hidden bg-gray-50 ${featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]"}`}>
        {a.image && <Image src={a.image} alt="" fill sizes={featured ? "(min-width:768px) 40vw, 100vw" : "(min-width:1024px) 30vw, 100vw"} className="packshot object-contain p-8 transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-105" />}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:justify-center md:p-10" : ""}`}>
        <p className="eyebrow">{cat}</p>
        <h3 className={`mt-3 font-semibold leading-snug tracking-tight text-ink ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>{a.title}</h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-body">{a.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5 font-mono text-[12px] text-body">
          <span>{formatDate(a.publishedAt)} · {a.readingMinutes} dk okuma</span>
          <ArrowUpRight size={18} className="text-ink transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-red" />
        </div>
      </div>
    </Link>
  );
}
