import { LogoWordmark } from "@/components/ui/Logo";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const col = "space-y-3 text-[14px]";
  const a = "text-white/65 transition hover:text-white";
  return (
    <footer className="mt-24 bg-ink pb-24 text-white lg:pb-0">
      <div className="container-x">
        <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LogoWordmark tone="light" size="lg" />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/65">
              Laboratuvar cihazlarını Ankara’da kendi mühendisliğimizle üretiyor, kurulumdan servise kadar yanınızda oluyoruz.
            </p>
            <ul className="mt-7 space-y-3 text-[14px] text-white/80">
              <li className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-red-cta" />İvedik OSB, Öz Ankara San. Sit. 1464 (675). Sk. No: 37, Yenimahalle / Ankara</li>
              <li className="flex gap-3"><Phone size={17} className="shrink-0 text-red-cta" /><a href="tel:+903123956613" className="hover:text-white">+90 312 395 66 13</a></li>
              <li className="flex gap-3"><Mail size={17} className="shrink-0 text-red-cta" /><a href="mailto:info@nukleonlab.com.tr" className="hover:text-white">info@nukleonlab.com.tr</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Ürünler</h3>
            <ul className={col}>
              {[["İnkübatörler", "inkubatorler"], ["Etüvler", "etuvler"], ["Çeker Ocaklar", "ceker-ocaklar"], ["Güvenlik Kabinleri", "guvenlik-kabinleri"], ["Su Banyoları", "su-banyolari"], ["Analiz Cihazları", "analiz-cihazlari"]].map(([l, s]) => (
                <li key={s}><Link href={`/kategori/${s}`} className={a}>{l}</Link></li>
              ))}
              <li><Link href="/urunler" className="inline-flex items-center gap-1 font-semibold text-white hover:text-red-cta">Tüm ürünler <ArrowUpRight size={14} /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Kurumsal</h3>
            <ul className={col}>
              {[["Hakkımızda", "/hakkimizda"], ["Laboratuvar Çözümleri", "/cozumler"], ["Bilgi Merkezi", "/bilgi-merkezi"], ["Markalar", "/markalar"], ["Teklif Al", "/teklif-al"]].map(([l, h]) => (
                <li key={h}><Link href={h} className={a}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Destek</h3>
            <ul className={col}>
              {[["Teknik Destek", "/teknik-destek"], ["Sipariş Takibi", "/hesabim"], ["Karşılaştırma", "/karsilastir"], ["Favorilerim", "/favoriler"], ["Sepetim", "/sepet"]].map(([l, h]) => (
                <li key={h}><Link href={h} className={a}>{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 py-7 text-[12.5px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Potash. Tüm hakları saklıdır. Fiyatlara KDV dahil değildir.</p>
          <p className="font-mono uppercase tracking-[0.16em]">Yerli Üretim · Ankara</p>
        </div>
      </div>
    </footer>
  );
}
