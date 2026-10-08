import TaxonomyEditor from "@/components/admin/TaxonomyEditor";
import { getCategories, getProducts } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin";

export const metadata = { title: "Kategoriler" };

export default async function Page() {
  await requireAdmin();
  const ps = getProducts();
  return <TaxonomyEditor kind="category" rows={getCategories().map((c) => ({ ...c, count: ps.filter((p) => p.category === c.slug).length }))} />;
}
