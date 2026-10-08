import type { Metadata } from "next";
import { FileText, Mail, Phone, Wrench } from "lucide-react";
import SupportForm from "@/components/shop/SupportForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Faq from "@/components/ui/Faq";

export const metadata: Metadata = {
  title: "Teknik Destek ve Servis",
  description: "Potash cihazları için arıza, bakım, kalibrasyon ve yedek parça desteği. Servis talebi oluşturun veya teknik ekibimizi arayın.",
  alternates: { canonical: "/teknik-destek" },
};

const FAQ = [
  { q: "Cihazım arızalandı, ne yapmalıyım?", a: "Cihazı kapatıp fişini çekin, model ve seri numarasını not edin ve aşağıdaki formu doldurun veya bizi arayın. Çoğu durumda telefonda yönlendirme ile çözüm bulunur; gerekirse servis ekibimiz yerinde müdahale eder." },
  { q: "Garanti süresi ne kadar?", a: "Potash markalı cihazlarda standart garanti süresi ürün sayfasında belirtilir. Garanti, üretim ve işçilik hatalarını kapsar; yanlış kullanımdan doğan hasarlar kapsam dışıdır." },
  { q: "Periyodik bakım yapıyor musunuz?", a: "Evet. İnkübatör, etüv, fırın, çeker ocak ve güvenlik kabinleri için yıllık bakım ve performans doğrulama hizmeti veriyoruz." },
  { q: "Yedek parçaya ne kadar sürede ulaşırım?", a: "Üretici olduğumuz için sık kullanılan parçalar atölyemizde bulunur. Stoktaki parçalar aynı gün kargolanır." },
  { q: "Başka marka cihazlara servis veriyor musunuz?", a: "Temsil ettiğimiz markalarda evet. Diğer markalar için cihazın modelini iletirseniz yapabilecek durumda olup olmadığımızı bildiririz." },
];

export default function SupportPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Teknik Destek", href: "/teknik-destek" }]} />
      <p className="eyebrow mt-8">Satış sonrası</p>
      <h1 className="mt-3 max-w-3xl text-[clamp(34px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.03em]">Cihazınızı çalıştıran ekip, arkasında da durur.</h1>
      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">Servis, bakım, kalibrasyon ve yedek parça için doğrudan üreticiyle konuşun.</p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          [Phone, "Telefon", "+90 312 395 66 13", "tel:+903123956613", "Hafta içi 08:30 – 18:00"],
          [Wrench, "Sipariş ve servis hattı", "0 533 130 99 12", "tel:+905331309912", "Sipariş ve servis talepleri"],
          [Mail, "E-posta", "info@nukleonlab.com.tr", "mailto:info@nukleonlab.com.tr", "Ekler ve fotoğraflar için"],
        ].map(([I, t, v, h, n]) => {
          const Icon = I as typeof Phone;
          return (
            <a key={t as string} href={h as string} className="card group p-7 hover:-translate-y-1 hover:border-red hover:shadow-[var(--shadow-lift)]">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gray-50 text-red transition group-hover:bg-red group-hover:text-white"><Icon size={22} /></span>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-body">{t as string}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{v as string}</p>
              <p className="mt-2 text-[13px] text-body">{n as string}</p>
            </a>
          );
        })}
      </div>

      <div className="mt-20 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <section>
          <h2 className="section-title !text-[clamp(26px,3vw,40px)]">Servis talebi oluşturun</h2>
          <div className="mt-8"><SupportForm /></div>
        </section>
        <aside>
          <h2 className="text-2xl font-semibold tracking-tight">Dokümanlar</h2>
          <a href="http://katalog.nukleonlab.com.tr" target="_blank" rel="noopener" className="card group mt-6 flex items-center gap-4 p-5 hover:border-red">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gray-50 text-red"><FileText size={22} /></span>
            <span><span className="block font-semibold text-ink">Genel ürün kataloğu</span><span className="text-[13px] text-body">Tüm cihaz aileleri</span></span>
          </a>
          <p className="mt-4 text-[14px] leading-relaxed text-body">Cihazınıza özel kullanım kılavuzu için model numarasıyla bize yazın.</p>
        </aside>
      </div>

      <section className="mt-24">
        <h2 className="section-title !text-[clamp(26px,3vw,40px)]">Sık sorulanlar</h2>
        <div className="mx-auto mt-8 max-w-3xl"><Faq items={FAQ} /></div>
      </section>
    </div>
  );
}
