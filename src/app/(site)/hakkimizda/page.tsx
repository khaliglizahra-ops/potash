import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Nükleon, Ankara İvedik OSB'de laboratuvar cihazları üretir; kurulum, eğitim ve servisi kendi ekibiyle yapar.",
  alternates: { canonical: "/hakkimizda" },
};

const STEPS = [
  ["Keşif", "Laboratuvarınızı yerinde görür, yapacağınız analizleri ve çalışma düzeninizi dinleriz."],
  ["Proje", "Cihaz listesi, tezgâh yerleşimi, tesisat ve havalandırma tek bir planda toplanır."],
  ["Üretim", "Cihazlar İvedik OSB'deki atölyemizde, kendi mühendislerimizin çizimleriyle üretilir."],
  ["Kurulum", "Nakliye, montaj, bağlantılar ve devreye alma ekibimizce yapılır."],
  ["Eğitim", "Kullanıcılar cihazı bizzat üretenlerden öğrenir."],
  ["Servis", "Bakım, kalibrasyon ve yedek parça aynı şehirden gelir."],
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-[linear-gradient(180deg,#fff,#f5f6f7)]">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumb items={[{ name: "Hakkımızda", href: "/hakkimizda" }]} />
          <p className="eyebrow mt-10">Nükleon Lab</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(38px,6vw,84px)] font-semibold leading-[1] tracking-[-0.035em]">Laboratuvar cihazını <span className="text-red">tasarlayan</span>, üreten ve servis eden ekip.</h1>
          <p className="mt-8 max-w-2xl text-[19px] leading-relaxed text-body">
            Ankara İvedik Organize Sanayi Bölgesi’ndeki tesisimizde inkübatör, etüv, kül fırını, çeker ocak, güvenlik kabini ve su banyosu üretiyoruz. Ürün gamımızı, kendi markamız dışında seçtiğimiz markalarla tamamlıyoruz.
          </p>
        </div>
      </section>

      <section className="container-x pt-12">
        <Reveal className="overflow-hidden rounded-[22px] border border-line">
          <Image src="/img/site/lab-hero.jpg" alt="Nükleon cihazlarıyla donatılmış modern laboratuvar" width={1280} height={720} priority sizes="(min-width:1440px) 1344px, 100vw" className="h-[320px] w-full object-cover object-[35%_50%] sm:h-[480px] lg:h-[560px]" />
        </Reveal>
      </section>

      <section className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="section-title">Cihazdan öte: bütün laboratuvar.</h2>
          <p className="mt-6 text-[17px] leading-[1.8] text-body">Bir laboratuvar kurmak, cihaz listesi çıkarmaktan fazlasıdır. Tezgâhın yüksekliği, çeker ocağın egzoz hattı, elektrik panosunun yeri ve saf su ihtiyacı birbirine bağlıdır. Bu yüzden keşiften eğitime kadar tüm adımları tek ekip olarak yürütüyoruz.</p>
          <p className="mt-5 text-[17px] leading-[1.8] text-body">Üretici olmanın pratik sonucu şu: özel ölçü gerektiğinde çizimi değiştirir, parça gerektiğinde atölyeden alır, arıza olduğunda cihazı yapan kişiye ulaşırsınız.</p>
          <Link href="/teklif-al?konu=kurulum" className="btn btn-primary mt-9">Projenizi konuşalım <ArrowRight size={16} /></Link>
        </Reveal>
        <Reveal delay={0.1} className="overflow-hidden rounded-[22px] border border-line">
          <Image src="/img/site/gidalaboratuvari-resimJS-24.jpg" alt="Nükleon çeker ocak, etüv ve tezgâh sistemiyle donatılmış laboratuvar" width={1920} height={510} sizes="(min-width:1024px) 640px, 100vw" className="h-full min-h-[280px] w-full object-cover" />
        </Reveal>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container-x">
          <Reveal><p className="eyebrow">Çalışma biçimimiz</p><h2 className="section-title mt-4 max-w-2xl">Keşiften servise, altı adım.</h2></Reveal>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 0.06} className="bg-white p-8">
                <span className="font-mono text-[12px] text-red">0{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-10 rounded-[22px] bg-ink p-8 text-white sm:p-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-red-cta">İletişim</p>
            <h2 className="mt-4 text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight text-white">Tesisimizi ziyaret edin.</h2>
            <p className="mt-5 flex gap-3 text-[16px] leading-relaxed text-white/75"><MapPin className="mt-1 shrink-0 text-red-cta" size={20} /> İvedik OSB, Öz Ankara San. Sit. 1464 (675). Sokak No: 37, İvedik, Yenimahalle / Ankara</p>
          </div>
          <div className="flex flex-col justify-end gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <a href="https://www.openstreetmap.org/search?query=%C4%B0vedik%20OSB%20Ankara" target="_blank" rel="noopener" className="btn btn-primary">Haritada aç</a>
            <Link href="/teknik-destek" className="btn border border-white/25 text-white hover:bg-white hover:text-ink">Bize ulaşın</Link>
          </div>
        </div>
      </section>
    </>
  );
}
