import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { getBrands, getCategories, getProducts } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/admin";

export const metadata = { title: "Ürün düzenle" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = getProducts().find((x) => x.id === id);
  if (!p) notFound();
  return <ProductEditor product={p} categories={getCategories().map((c) => ({ slug: c.slug, name: c.name }))} brands={getBrands().map((b) => ({ slug: b.slug, name: b.name }))} />;
}
