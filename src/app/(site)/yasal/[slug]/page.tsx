import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { LEGAL, legalBySlug } from "@/lib/data/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = legalBySlug((await params).slug);
  return d ? { title: d.title, alternates: { canonical: `/yasal/${d.slug}` } } : {};
}

export default async function LegalPage({ params }: Props) {
  const d = legalBySlug((await params).slug);
  if (!d) notFound();
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: d.title, href: `/yasal/${d.slug}` }]} />
      <article className="mx-auto mt-8 max-w-3xl">
        <h1 className="text-[clamp(30px,4vw,48px)] font-semibold leading-tight tracking-tight">{d.title}</h1>
        <p className="mt-5 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-amber-900">
          Taslak metin: yayına almadan önce firmanın hukuk danışmanı tarafından gözden geçirilmelidir.
        </p>
        {d.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
            {s.p.map((t) => <p key={t} className="mt-3 text-[16px] leading-[1.8] text-body">{t}</p>)}
          </section>
        ))}
      </article>
    </div>
  );
}
