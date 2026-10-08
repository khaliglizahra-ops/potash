import ProductList from "@/components/admin/ProductList";
import { getCategories, getProducts } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin";

export const metadata = { title: "Ürünler" };

export default async function Page() {
  await requireAdmin();
  return <ProductList products={getProducts().sort((a, b) => a.name.localeCompare(b.name, "tr"))} categories={Object.fromEntries(getCategories().map((c) => [c.slug, c.name]))} />;
}
