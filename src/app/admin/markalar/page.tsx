import TaxonomyEditor from "@/components/admin/TaxonomyEditor";
import { getBrands, getProducts } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin";

export const metadata = { title: "Markalar" };

export default async function Page() {
  await requireAdmin();
  const ps = getProducts();
  return <TaxonomyEditor kind="brand" rows={getBrands().map((b) => ({ ...b, count: ps.filter((p) => p.brand === b.slug).length }))} />;
}
