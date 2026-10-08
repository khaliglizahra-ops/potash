"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, Check, ChevronDown, FileText, Play, Rotate3d, Download } from "lucide-react";
import type { Product } from "@/lib/types";
import { specRows } from "@/lib/product-utils";

const TABS = [
  { id: "genel", label: "Genel Bakış" },
  { id: "teknik", label: "Teknik Özellikler" },
  { id: "3d", label: "3D Model" },
  { id: "dokuman", label: "Dokümanlar" },
  { id: "sertifika", label: "Sertifikalar" },
  { id: "video", label: "Video" },
  { id: "sss", label: "SSS" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Empty({ icon: Icon, title, text, product, topic }: { icon: typeof Award; title: string; text: string; product: Product; topic: string }) {
  return (
    <div className="grid place-items-center rounded-[16px] border border-dashed border-gray-300 px-6 py-16 text-center">
      <div>
        <Icon size={34} className="mx-auto text-gray-300" />
        <p className="mt-4 text-lg font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-body">{text}</p>
        <Link href={`/teklif-al?urun=${product.slug}&konu=${topic}`} className="btn btn-ghost btn-sm mt-5">Bize iletin</Link>
      </div>
    </div>
  );
}

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabId>("genel");
  const [faq, setFaq] = useState<number | null>(0);
  const bar = useRef<HTMLDivElement>(null);
  const rows = specRows(product);
  const groups = [...new Set(rows.map((r) => r.group))];

  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (bar.current && el) bar.current.scrollTo({ left: el.offsetLeft - bar.current.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [tab]);

  return (
    <section aria-label="Ürün bilgileri" className="mt-20">
      <div ref={bar} role="tablist" className="no-scrollbar sticky top-[68px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-white/95 px-4 backdrop-blur lg:top-[76px] lg:mx-0 lg:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-tab={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-colors sm:px-5 ${tab === t.id ? "text-red" : "text-ink hover:text-red"}`}
          >
            {t.label}
            {tab === t.id && <motion.span layoutId="tab-underline" className="absolute inset-x-3 bottom-0 h-[2px] bg-red" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>

      <div className="py-10" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            {tab === "genel" && (
              <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h2>
                  <p className="mt-5 text-[17px] leading-[1.75] text-body">{product.description}</p>
                  <p className="mt-4 text-[17px] leading-[1.75] text-body">Cihaz Ankara’daki tesisimizde üretilir; kurulum, devreye alma ve kullanıcı eğitimi Nükleon mühendislerince yapılır. Özel ölçü veya farklı kontrol ihtiyacınız varsa teklif formunda belirtmeniz yeterlidir.</p>
                </div>
                <div className="rounded-[18px] bg-gray-50 p-7">
                  <h3 className="eyebrow">Öne çıkanlar</h3>
                  <ul className="mt-5 space-y-4">
                    {product.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-[15px] text-ink">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red text-white"><Check size={12} strokeWidth={3} /></span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "teknik" && (
              <div className="grid gap-8 lg:grid-cols-2">
                {groups.map((g) => (
                  <div key={g}>
                    <h3 className="eyebrow mb-3">{g}</h3>
                    <dl className="overflow-hidden rounded-[14px] border border-line">
                      {rows.filter((r) => r.group === g).map((r, i) => (
                        <div key={r.label} className={`grid grid-cols-[42%_1fr] gap-3 px-5 py-3.5 text-[14.5px] ${i % 2 ? "bg-white" : "bg-gray-50"}`}>
                          <dt className="text-body">{r.label}</dt>
                          <dd className="font-mono text-[13.5px] font-medium text-ink">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                {product.specsDraft && <p className="text-[13px] text-body lg:col-span-2">Bu değerler bilgilendirme amaçlıdır. Onaylı teknik föy, teklifle birlikte iletilir.</p>}
              </div>
            )}

            {tab === "3d" && (
              <div className="grid items-center gap-8 rounded-[18px] bg-gray-50 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red text-white"><Rotate3d size={26} /></span>
                  {product.model3d ? (
                    <>
                      <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Bu cihazın 3D modeli hazır</h2>
                      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-body">Fare ile sürükleyerek döndürün, tekerlekle yakınlaştırın. Mobilde tek parmakla döndürüp iki parmakla yakınlaştırabilir, tam ekranda detaylara bakabilirsiniz. Model, ürünün temsili geometrisidir; kesin ölçüler teknik föyde yer alır.</p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Bu ürün için 3D model henüz yok</h2>
                      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-body">Ürün fotoğraflarını galeriden inceleyebilirsiniz. 3D model eklendiğinde burada görünecek; yönetim panelinden GLB dosyası yüklemek yeterli.</p>
                    </>
                  )}
                </div>
                {product.model3d && (
                  <button
                    className="btn btn-primary h-14 px-8"
                    onClick={() => {
                      window.dispatchEvent(new Event("open-3d"));
                    }}
                  >
                    3D görüntüleyiciyi aç
                  </button>
                )}
              </div>
            )}

            {tab === "dokuman" &&
              (product.documents.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.documents.map((d) => (
                    <li key={d.url}>
                      <a href={d.url} target="_blank" rel="noopener" className="card group flex items-center gap-4 p-5 hover:border-red hover:shadow-[var(--shadow-soft)]">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gray-50 text-red"><FileText size={22} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{d.title}</span>
                          <span className="font-mono text-[11.5px] uppercase tracking-wider text-body">{d.kind.replace("-", " ")}{d.sizeKb ? ` · ${d.sizeKb} KB` : ""}</span>
                        </span>
                        <Download size={18} className="text-body transition group-hover:text-red" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty icon={FileText} title="Doküman bulunmuyor" text="Kullanım kılavuzu ve teknik şartname talep edebilirsiniz." product={product} topic="dokuman" />
              ))}

            {tab === "sertifika" &&
              (product.certificates.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.certificates.map((c) => (
                    <li key={c.title} className="card flex items-center gap-4 p-5">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gray-50 text-red"><Award size={22} /></span>
                      <span>
                        <span className="block font-semibold text-ink">{c.title}</span>
                        {c.issuer && <span className="text-[13px] text-body">{c.issuer}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty icon={Award} title="Sertifika belgeleri talep üzerine" text="Uygunluk beyanı ve ilgili belgeler siparişle birlikte veya talebinizle iletilir." product={product} topic="sertifika" />
              ))}

            {tab === "video" &&
              (product.videos.length ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {product.videos.map((v) => (
                    <div key={v.youtubeId} className="overflow-hidden rounded-[16px] border border-line">
                      <div className="aspect-video bg-ink">
                        <iframe className="h-full w-full" loading="lazy" src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`} title={v.title} allowFullScreen />
                      </div>
                      <p className="p-4 font-semibold text-ink">{v.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty icon={Play} title="Tanıtım videosu hazırlanıyor" text="Cihazın çalışırken görüntüsünü veya canlı demo talep edebilirsiniz." product={product} topic="video" />
              ))}

            {tab === "sss" && (
              <ul className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
                {product.faq.map((f, i) => (
                  <li key={f.q}>
                    <button className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-ink" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>
                      {f.q}
                      <ChevronDown size={20} className={`shrink-0 transition ${faq === i ? "rotate-180 text-red" : "text-body"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {faq === i && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pr-10 text-[16px] leading-relaxed text-body">
                          <span className="block pb-6">{f.a}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
