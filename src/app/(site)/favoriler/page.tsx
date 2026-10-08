import type { Metadata } from "next";
import FavoritesView from "@/components/product/FavoritesView";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = { title: "Favorilerim", robots: { index: false, follow: true } };

export default function FavoritesPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Favorilerim", href: "/favoriler" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Favorilerim</h1>
      <FavoritesView />
    </div>
  );
}
