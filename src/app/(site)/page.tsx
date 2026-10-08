import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Factory, Headset, Layers3, Rotate3d, Timer, Wrench, Ruler, Truck } from "lucide-react";
import { getArticles, getCategories, getProducts, toCard } from "@/lib/catalog";
import HeroVisual from "@/components/home/HeroVisual";
import ProductCard from "@/components/product/ProductCard";
import ArticleCard from "@/components/ui/ArticleCard";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import ProductViewer from "@/components/viewer/ProductViewer";

const HOME_CATS = ["inkubatorler", "etuvler", "ceker-ocaklar", "guvenlik-kabinleri", "santrifujler", "olcum-cihazlari"];

const WHY = [
  { icon: Factory, title: "Yerli Üretim", text: "Cihazlarımızı Ankara İvedik OSB'deki tesisimizde, kendi mühendislik ekibimizle üretiyoruz." },
  { icon: Wrench, title: "Teknik Uzmanlık", text: "Kurulumdan kullanım eğitimine kadar, cihazı tasarlayan ekip sizinle konuşur." },
  { icon: Headset, title: "Satış Sonrası Destek", text: "Yedek parça atölyemizde, servis ekibi aynı şehirde. Arızayı beklemeden çözeriz." },
  { icon: Timer, title: "Hızlı Servis", text: "Stoktaki cihazlar günler içinde yola çıkar; bakım ve onarım için yerinde servis." },
  { icon: BadgeCheck, title: "Kaliteli Ürünler", text: "Paslanmaz çelik iç haznelerde, PID kontrol ve bağımsız emniyet devrelerinde taviz yok." },
  { icon: Layers3, title: "Profesyonel Çözümler", text: "Tek cihazdan anahtar teslim laboratuvara: tezgâh, havalandırma ve cihaz bir arada projelendirilir." },
];

export default function HomePage() {
  const products = getProducts();
  const cats = getCategories();
  const featured = products
    .filter((p) => p.featured)
    .sort((a, b) => Number(!!b.model3d) - Number(!!a.model3d) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map(toCard);
  const model3dCount = products.filter((p) => p.model3d).length;
  const articles = getArticles().slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f5f6f7_100%)]">
        <div aria-hidden className="hairline-grid absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_70%_at_70%_40%,#000_0%,transparent_75%)]" />
        <div className="container-x relative grid items-center gap-10 py-12 sm:py-16 lg:min-h-[calc(100dvh-112px)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:py-14">
          <div>
            <Reveal y={14}>
              <p className="eyebrow inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-red" /> Yerli üretim · Ankara
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-[clamp(38px,6.4vw,92px)] font-semibold leading-[0.98] tracking-[-0.035em]">
                Laboratuvar Teknolojisinde <span className="text-red">Yeni Nesil</span> Çözümler
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-lg text-[clamp(16px,1.5vw,19px)] leading-relaxed text-body">
                Profesyonel laboratuvar cihazları, güvenilir teknoloji ve teknik uzmanlık.
              </p>
            </Reveal>
            <Reveal delay={0.24} className="mt-9 flex flex-wrap gap-3">
              <Link href="/urunler" className="btn btn-primary h-14 px-8">
                Cihazları Keşfet <ArrowRight size={17} />
              </Link>
              <Link href="/teklif-al" className="btn btn-ghost h-14 px-8">
                Çözüm Danışmanlığı
              </Link>
            </Reveal>
            <Reveal delay={0.32}>
              <ul className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6 text-[13px] text-ink">
                {[
                  [Factory, "Ankara'da üretim"],
                  [Rotate3d, "360° 3D inceleme"],
                  [Truck, "Yerinde kurulum"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof Factory;
                  return (
                    <li key={label as string} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <I size={20} className="shrink-0 text-red" />
                      <span className="font-medium leading-tight">{label as string}</span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ------------------------------------------------------ CATEGORIES */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal>
          <SectionHead eyebrow="Kategoriler" title="Laboratuvarınızı Donatın" intro="Her cihaz ailesi için yerli üretim ve seçilmiş ithal çözümler." href="/kategoriler" cta="Tüm kategoriler" />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {HOME_CATS.map((slug, i) => {
            const c = cats.find((x) => x.slug === slug);
            if (!c) return null;
            const n = products.filter((p) => p.category === slug).length;
            return (
              <Reveal key={slug} delay={(i % 3) * 0.07}>
                <Link href={`/kategori/${slug}`} className="card group relative block aspect-[4/5] overflow-hidden bg-gray-50 hover:-translate-y-1.5 hover:border-red hover:shadow-[var(--shadow-lift)] sm:aspect-[5/6]">
                  {c.image && (
                    <Image src={c.image} alt={c.name} fill sizes="(min-width:1024px) 30vw, 50vw" className="packshot object-contain p-[7%] pb-[30%] transition-transform duration-[1100ms] ease-[var(--ease)] group-hover:scale-110" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent p-4 pt-14 sm:p-6 sm:pt-16">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-body">{n} ürün</p>
                    <h3 className="mt-1 text-[19px] font-semibold tracking-tight text-ink sm:text-2xl">{c.name}</h3>
                    <span className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-red px-4 text-[12px] font-semibold uppercase tracking-wider text-white transition duration-500 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                      Ürünleri İncele <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------- FEATURED */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal>
          <SectionHead eyebrow="Öne çıkanlar" title="Öne Çıkan Ürünler" href="/urunler" cta="Tüm ürünler" />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.06}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- 3D BAND */}
      <section className="mt-24 bg-gray-50 py-20 sm:mt-32 sm:py-28">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">3D ürün inceleme</p>
            <h2 className="section-title mt-4">Satın almadan önce her açıdan inceleyin.</h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-body">
              Cihazı döndürün, yakınlaştırın, kapağını ve kontrol panelini gözünüzle görün. Telefonda parmağınızla, bilgisayarda fareyle.
            </p>
            <ul className="mt-8 space-y-3 text-[15px] text-ink">
              {["360° serbest döndürme ve yakınlaştırma", "Mobilde tek parmak döndür, iki parmak yakınlaştır", "Tam ekran inceleme", `${model3dCount} üründe 3D model hazır`].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />{t}</li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/urunler?model3d=1" className="btn btn-primary">3D modelli ürünler <ArrowRight size={16} /></Link>
              <Link href="/urunler/ngk-120#3d" className="btn btn-ghost">Güvenlik kabinini incele</Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ProductViewer modelUrl="/models/ngk-120.glb" poster="/img/products/Biyolojik-Guvenlik-Kabini-resim-633.jpg" alt="NGK-120 biyolojik güvenlik kabini 3D model" className="h-[420px] sm:h-[560px]" />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- WHY */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal>
          <SectionHead eyebrow="Fark" title="Neden Nükleon Lab?" intro="Üreticisiyiz. Cihazı tasarlayan, üreten ve servis eden aynı ekip." />
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 0.06} className="group bg-white p-8 transition-colors duration-500 hover:bg-gray-50 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-line text-red transition duration-500 group-hover:border-red group-hover:bg-red group-hover:text-white">
                  <w.icon size={22} strokeWidth={1.7} />
                </span>
                <span className="font-mono text-[12px] text-gray-300">0{i + 1}</span>
              </div>
              <h3 className="mt-8 text-[22px] font-semibold tracking-tight">{w.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-body">{w.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------- TURNKEY LAB BAND */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal className="relative overflow-hidden rounded-[22px] border border-line bg-gray-50">
          <Image src="/img/site/laboratuvarsonkurulum-resimJS-21.jpg" alt="Anahtar teslim laboratuvar kurulumu: çeker ocaklar, etüvler ve tezgâh sistemi" width={1920} height={510} sizes="(min-width:1440px) 1344px, 100vw" className="h-[340px] w-full object-cover object-right sm:h-[460px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent max-sm:bg-gradient-to-t max-sm:from-white max-sm:via-white/70" />
          <div className="absolute inset-0 flex items-end p-6 sm:items-center sm:p-14">
            <div className="max-w-md">
              <p className="eyebrow">Laboratuvar kurulumu</p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.05] sm:text-5xl">Anahtar teslim laboratuvar.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-body sm:text-base">Keşif, proje, tezgâh, havalandırma ve cihazlar: tek ekip, tek sözleşme.</p>
              <Link href="/teklif-al?konu=kurulum" className="btn btn-primary mt-6">Çözüm danışmanlığı <ArrowRight size={16} /></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- REFERENCES */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal>
          <SectionHead eyebrow="Referanslar" title="Türkiye'nin Laboratuvarlarında Nükleon Lab" />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Reveal key={i} delay={i * 0.04} className="grid aspect-[3/2] place-items-center rounded-[14px] border border-dashed border-gray-300 bg-white text-center">
              <span className="px-3 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-gray-300">Kurumsal<br />müşteri logosu</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- BLOG */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal>
          <SectionHead eyebrow="Bilgi Merkezi" title="Laboratuvarınız için teknik rehberler" href="/bilgi-merkezi" cta="Tüm yazılar" />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.07}>
              <ArticleCard a={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="container-x pt-24 sm:pt-32">
        <Reveal className="relative overflow-hidden rounded-[22px] bg-ink px-6 py-14 text-white sm:px-14 sm:py-20">
          <div aria-hidden className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(227,27,59,0.55),transparent_70%)]" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-red-cta">Kurumsal teklif</p>
              <h2 className="mt-4 text-[clamp(30px,4.4vw,58px)] font-semibold leading-[1.04] tracking-tight text-white">İhtiyacınızı anlatın, teklifi 1 iş günü içinde gönderelim.</h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/teklif-al" className="btn btn-primary h-14 px-8">Teklif iste</Link>
              <a href="tel:+903123956613" className="btn h-14 border border-white/25 px-8 text-white hover:border-white hover:bg-white hover:text-ink">+90 312 395 66 13</a>
            </div>
          </div>
        </Reveal>
        <p className="mt-6 flex items-center gap-2 text-[13px] text-body"><Ruler size={15} className="text-red" /> Özel ölçülü üretim ve laboratuvar planınıza uygun yerleşim için mühendislerimizle görüşebilirsiniz.</p>
      </section>
    </>
  );
}
