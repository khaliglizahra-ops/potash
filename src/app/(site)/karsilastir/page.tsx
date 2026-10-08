import type { Metadata } from "next";
import CompareView from "@/components/product/CompareView";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Ürün Karşılaştırma",
  description: "En fazla 4 laboratuvar cihazını teknik özelliklerine göre yan yana karşılaştırın.",
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Karşılaştırma", href: "/karsilastir" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Ürün Karşılaştırma</h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-body">En fazla 4 ürünü yan yana inceleyin. Farklı değerler kırmızıyla vurgulanır.</p>
      <CompareView />
    </div>
  );
}
