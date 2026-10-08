"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BookOpen, CornerDownLeft, Layers, Rotate3d, Search, Tag, X } from "lucide-react";
import { search as coreSearch, type SearchResult } from "@/lib/catalog-core";
import { DEMO, loadCatalog } from "@/lib/demo";
import { formatTRY } from "@/lib/text";
import { useUi } from "@/store/shop";

type Result = Omit<SearchResult, "articles"> & { articles: { slug: string; title: string; categoryName: string; excerpt: string }[] };
const SUGGESTIONS = ["İnkübatör", "Çeker ocak", "Etüv", "Su banyosu", "Güvenlik kabini", "Spektrofotometre"];

export default function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearch);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(-1);

  useEffect(() => {
    if (open) {
      document.body.classList.add("lock-scroll");
      setTimeout(() => input.current?.focus(), 60);
    } else {
      document.body.classList.remove("lock-scroll");
    }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        if (DEMO) setRes(coreSearch(term, await loadCatalog()));
        else {
          const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal });
          setRes(await r.json());
        }
        setCursor(-1);
      } catch {
        /* aborted */
      } finally {
        setBusy(false);
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const shown = q.trim().length >= 2 ? res : null;
  const flat = useMemo(() => (shown ? shown.products.map((p) => `/urunler/${p.slug}`) : []), [shown]);
  const close = () => setOpen(false);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(flat.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(-1, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      close();
      router.push(cursor >= 0 ? flat[cursor] : `/urunler?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const empty = shown && shown.products.length + shown.categories.length + shown.brands.length + shown.articles.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search"
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Site içi arama"
        >
          <button aria-label="Aramayı kapat" className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto flex max-h-[100dvh] w-full max-w-[920px] flex-col bg-white shadow-[var(--shadow-lift)] sm:mt-[8vh] sm:max-h-[84dvh] sm:rounded-[20px]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 sm:px-6">
              <Search size={20} className="shrink-0 text-red" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="İnkübatör, çeker ocak, NIN-110, Rayto…"
                aria-label="Ara"
                className="h-16 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-body/50"
                autoComplete="off"
                enterKeyHint="search"
              />
              {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red" />}
              <button onClick={close} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full text-body hover:bg-gray-50 hover:text-red">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {!shown && !busy && (
                <div>
                  <p className="eyebrow mb-3">Sık aranan</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-4 py-2 text-[14px] font-medium text-ink transition hover:border-red hover:text-red">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 text-[13px] text-body">
                    İpucu: ürün kodu (<span className="font-mono text-ink">NIN-110</span>), marka veya teknik terim yazabilirsiniz. Türkçe karakter gerekmez.
                  </p>
                </div>
              )}

              {empty && (
                <div className="py-10 text-center">
                  <p className="text-lg font-semibold text-ink">“{q}” için sonuç bulunamadı</p>
                  <p className="mt-2 text-body">Farklı bir terim deneyin ya da ihtiyacınızı bize iletin.</p>
                  <Link href="/teklif-al" onClick={close} className="btn btn-primary mt-6">Teklif iste</Link>
                </div>
              )}

              {shown && !empty && (
                <div className="grid gap-8 md:grid-cols-[1.7fr_1fr]">
                  <section>
                    <h3 className="eyebrow mb-3">Ürünler{shown.totalProducts > shown.products.length ? ` · ${shown.totalProducts}` : ""}</h3>
                    <ul className="space-y-1.5">
                      {shown.products.map((p, i) => (
                        <li key={p.slug}>
                          <Link
                            href={`/urunler/${p.slug}`}
                            onClick={close}
                            onMouseEnter={() => setCursor(i)}
                            className={`flex items-center gap-4 rounded-xl border p-2.5 transition ${cursor === i ? "border-red/50 bg-red/[0.03]" : "border-transparent hover:bg-gray-50"}`}
                          >
                            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                              <Image src={p.image} alt="" fill sizes="64px" className="packshot object-contain p-1.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-semibold text-ink">{p.name}</span>
                              <span className="mt-0.5 flex items-center gap-2 font-mono text-[11.5px] text-red">
                                {p.sku}
                                {p.model3d && (
                                  <span className="inline-flex items-center gap-1 rounded bg-red px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white">
                                    <Rotate3d size={10} /> 3D
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="shrink-0 text-right text-[13.5px] font-semibold text-ink">
                              {p.price === null ? <span>Teklif <span className="text-red">Al</span></span> : formatTRY(p.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/urunler?q=${encodeURIComponent(q.trim())}`}
                      onClick={close}
                      className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-red hover:underline"
                    >
                      Tüm sonuçları gör ({shown.totalProducts}) <ArrowRight size={14} />
                    </Link>
                  </section>

                  <aside className="space-y-7">
                    {shown.categories.length > 0 && (
                      <section>
                        <h3 className="eyebrow mb-3 flex items-center gap-2"><Layers size={13} /> Kategoriler</h3>
                        <ul className="space-y-1">
                          {shown.categories.map((c) => (
                            <li key={c.slug}>
                              <Link href={`/kategori/${c.slug}`} onClick={close} className="flex items-center justify-between rounded-lg px-3 py-2 text-[14px] font-medium text-ink hover:bg-gray-50 hover:text-red">
                                {c.name}
                                <span className="font-mono text-[11px] text-body">{c.productCount}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {shown.brands.length > 0 && (
                      <section>
                        <h3 className="eyebrow mb-3 flex items-center gap-2"><Tag size={13} /> Markalar</h3>
                        <ul className="flex flex-wrap gap-2">
                          {shown.brands.map((b) => (
                            <li key={b.slug}>
                              <Link href={`/urunler?marka=${b.slug}`} onClick={close} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-ink hover:border-red hover:text-red">
                                {b.name} <span className="font-mono text-[11px] text-body">{b.productCount}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {shown.articles.length > 0 && (
                      <section>
                        <h3 className="eyebrow mb-3 flex items-center gap-2"><BookOpen size={13} /> Teknik içerikler</h3>
                        <ul className="space-y-1">
                          {shown.articles.map((a) => (
                            <li key={a.slug}>
                              <Link href={`/bilgi-merkezi/${a.slug}`} onClick={close} className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                                <span className="block text-[14px] font-medium leading-snug text-ink">{a.title}</span>
                                <span className="font-mono text-[10.5px] uppercase tracking-wider text-body">{a.categoryName}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </aside>
                </div>
              )}
            </div>

            <div className="hidden items-center justify-between border-t border-line px-6 py-3 font-mono text-[11px] text-body sm:flex">
              <span className="flex items-center gap-4">
                <span><kbd className="rounded border border-gray-300 px-1.5">↑</kbd> <kbd className="rounded border border-gray-300 px-1.5">↓</kbd> gez</span>
                <span className="inline-flex items-center gap-1"><CornerDownLeft size={11} /> aç</span>
                <span><kbd className="rounded border border-gray-300 px-1.5">esc</kbd> kapat</span>
              </span>
              <span>Nükleon Lab arama</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
