import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Laboratuvar Çözümleri",
  description: "Gıda, inşaat malzemesi, Ar-Ge ve eğitim laboratuvarları için anahtar teslim kurulum: tezgâh, çeker ocak, cihaz ve havalandırma tek ekipte.",
  alternates: { canonical: "/cozumler" },
};

const SOLUTIONS = [
  { t: "Gıda laboratuvarı", d: "Kül, yağ, protein, nem ve gluten analizleri için cihaz seti, çeker ocak ve tezgâh yerleşimi.", img: "/img/site/gidalaboratuvari-resimJS-24.jpg", items: ["Kül fırını, etüv, Soxhlet", "Kjeldahl azot tayini", "Çeker ocak ve tezgâh"] },
  { t: "İnşaat ve beton laboratuvarı", d: "Numune hazırlama, kürleme ve ölçüm için dayanıklı ekipman ve ölçüm cihazları.", img: "/img/site/betonlaboratuvari-resimJS-22.jpg", items: ["Etüv ve ısıtıcı tablalar", "Elek seti ve sarsıcı", "Ölçüm cihazları"] },
  { t: "Anahtar teslim kurulum", d: "Boş bir alandan çalışır bir laboratuvara: proje, imalat, montaj ve eğitim.", img: "/img/site/laboratuvarsonkurulum-resimJS-21.jpg", items: ["Keşif ve 3B yerleşim", "Tezgâh ve havalandırma", "Devreye alma ve eğitim"] },
  { t: "Mikrobiyoloji ve güvenli çalışma", d: "Biyolojik güvenlik ve laminar flow kabinleri, inkübatörler ve sterilizasyon.", img: "/img/site/cekerocak-goruntusu-resimJS-19.jpg", items: ["Sınıf II güvenlik kabini", "Soğutmalı inkübatör", "UV-C sterilizasyon"] },
];

export default function SolutionsPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Laboratuvar Çözümleri", href: "/cozumler" }]} />
      <p className="eyebrow mt-8">Çözümler</p>
      <h1 className="mt-3 max-w-3xl text-[clamp(34px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.03em]">Laboratuvarınız, ihtiyacınıza göre.</h1>
      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-body">Sektörünüze uygun cihaz setleri ve anahtar teslim kurulum.</p>
      <div className="mt-14 space-y-6">
        {SOLUTIONS.map((s, i) => (
          <Reveal key={s.t} className="card grid overflow-hidden md:grid-cols-2">
            <div className={`relative min-h-[240px] ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={s.img} alt={s.t} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.t}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-body">{s.d}</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-ink">{s.items.map((it) => <li key={it} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />{it}</li>)}</ul>
              <Link href={`/teklif-al?konu=kurulum&urun=${encodeURIComponent(s.t)}`} className="btn btn-primary mt-8 self-start">Teklif iste <ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
