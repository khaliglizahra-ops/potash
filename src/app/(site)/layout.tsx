import { connection } from "next/server";
import { getCategories, getProducts } from "@/lib/catalog";
import { DEMO } from "@/lib/demo";
import DemoBanner from "@/components/layout/DemoBanner";
import Splash from "@/components/layout/Splash";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileMenu from "@/components/layout/MobileMenu";
import MobileNav from "@/components/layout/MobileNav";
import CompareBar from "@/components/layout/CompareBar";
import Toaster from "@/components/layout/Toaster";
import { Rehydrate } from "@/store/hooks";
import { organizationLd, JsonLd } from "@/lib/seo";

/** Catalogue lives in SQLite and is edited from /admin, so pages render per request instead of being frozen at build time (the static demo is frozen on purpose). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if (!DEMO) await connection();
  const products = getProducts();
  const menu = getCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
    group: c.group,
    image: c.image,
    count: products.filter((p) => p.category === c.slug).length,
  }));
  return (
    <>
      <Splash />
      <Rehydrate />
      <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        İçeriğe geç
      </a>
      {DEMO && <DemoBanner />}
      <Header categories={menu} />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
      <MobileMenu categories={menu} />
      <MobileNav />
      <CompareBar />
      <Toaster />
      <JsonLd data={organizationLd()} />
    </>
  );
}
