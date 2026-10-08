import ProductEditor from "@/components/admin/ProductEditor";
import { getBrands, getCategories } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin";

export const metadata = { title: "Yeni ürün" };

export default async function Page() {
  await requireAdmin();
  return <ProductEditor product={null} categories={getCategories().map((c) => ({ slug: c.slug, name: c.name }))} brands={getBrands().map((b) => ({ slug: b.slug, name: b.name }))} />;
}
