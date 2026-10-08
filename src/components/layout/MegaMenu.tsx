"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MenuCategory } from "./types";

const DEVICE_SLUGS = ["inkubatorler", "etuvler", "firinlar", "ceker-ocaklar", "guvenlik-kabinleri", "su-banyolari", "santrifujler", "sterilizasyon-cihazlari"];
const MEASURE_SLUGS = ["olcum-cihazlari", "analiz-cihazlari", "sicaklik", "nem", "ph", "terazi"];
const SUPPLY_SLUGS = ["cam-malzemeler", "plastik-malzemeler", "porselen", "sarf-malzemeleri"];
const FEATURED = ["inkubatorler", "ceker-ocaklar", "guvenlik-kabinleri"];

export default function MegaMenu({ categories, onNavigate }: { categories: MenuCategory[]; onNavigate: () => void }) {
  const by = (slug: string) => categories.find((c) => c.slug === slug);
  const col = (title: string, slugs: string[]) => (
    <div>
      <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red">{title}</h3>
      <ul className="space-y-0.5">
        {slugs.map((s) => {
          const c = by(s);
          if (!c) return null;
          return (
            <li key={s}>
              <Link
                href={`/kategori/${c.slug}`}
                onClick={onNavigate}
                className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-[7px] text-[14.5px] font-medium text-ink transition hover:bg-gray-50 hover:text-red"
              >
                <span className="transition-transform duration-300 group-hover:translate-x-1">{c.name}</span>
                <span className="font-mono text-[11px] text-body/50 group-hover:text-red">{c.count || ""}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="container-x grid grid-cols-[1.05fr_1fr_0.9fr_1.9fr] gap-10 py-10 xl:gap-14">
      {col("Laboratuvar Cihazları", DEVICE_SLUGS)}
      <div className="space-y-8">
        {col("Ölçüm ve Analiz", MEASURE_SLUGS)}
      </div>
      <div className="space-y-8">
        {col("Laboratuvar Gereçleri", SUPPLY_SLUGS)}
        <div>
          <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red">Kimyasal Ürünler</h3>
          <Link href="/kategori/kimyasal-urunler" onClick={onNavigate} className="text-[14.5px] font-medium text-ink hover:text-red">Merck ve analitik kimyasallar</Link>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-red">Laboratuvar Kurulumu</h3>
          <Link href="/kategori/laboratuvar-kurulumu" onClick={onNavigate} className="text-[14.5px] font-medium text-ink hover:text-red">Tezgâh sistemleri, anahtar teslim</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {FEATURED.map((s) => {
          const c = by(s);
          if (!c) return null;
          return (
            <Link key={s} href={`/kategori/${c.slug}`} onClick={onNavigate} className="group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-gray-50 transition duration-500 hover:-translate-y-1 hover:border-red/50 hover:shadow-[var(--shadow-lift)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                {c.image && <Image src={c.image} alt="" fill sizes="180px" className="packshot object-contain p-4 transition-transform duration-700 group-hover:scale-110" />}
              </div>
              <div className="flex items-end justify-between bg-white p-3.5">
                <div>
                  <p className="text-[14px] font-semibold leading-tight text-ink">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-body">{c.count} ürün</p>
                </div>
                <ArrowUpRight size={18} className="text-body transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-red" />
              </div>
            </Link>
          );
        })}
        <Link
          href="/urunler"
          onClick={onNavigate}
          className="col-span-3 flex items-center justify-between rounded-[14px] bg-ink px-5 py-3.5 text-[13px] font-semibold uppercase tracking-wider text-white transition hover:bg-red"
        >
          Tüm cihazları keşfet <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
