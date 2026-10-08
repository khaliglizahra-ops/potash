import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BlogList from "@/components/ui/BlogList";
import { getArticles } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Bilgi Merkezi",
  description: "Laboratuvar teknolojileri, ürün rehberleri, teknik bilgiler ve uygulama rehberleri.",
  alternates: { canonical: "/bilgi-merkezi" },
};

export default function BlogPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Bilgi Merkezi", href: "/bilgi-merkezi" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Bilgi Merkezi</h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-body">Laboratuvarınızı kurarken ve işletirken işinize yarayacak teknik rehberler.</p>
      <Suspense>
        <BlogList articles={getArticles()} />
      </Suspense>
    </div>
  );
}
