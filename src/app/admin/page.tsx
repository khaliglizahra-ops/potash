import Link from "next/link";
import { AlertTriangle, FileText, Package, ShoppingCart } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { list } from "@/lib/db";
import { requireAdmin } from "@/lib/server/admin";
import { getOrders } from "@/lib/server/orders";
import { formatDate, formatTRY } from "@/lib/text";
import type { QuoteRequest } from "@/lib/types";

export default async function AdminHome() {
  await requireAdmin();
  const products = getProducts();
  const orders = getOrders();
  const quotes = list<QuoteRequest>("quote").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const newQuotes = quotes.filter((q) => q.status === "yeni").length;
  const open = orders.filter((o) => ["alindi", "hazirlaniyor"].includes(o.status)).length;
  const low = products.filter((p) => p.price !== null && p.stock <= 2);
  const draft = products.filter((p) => p.specsDraft).length;
  const card = "rounded-[16px] border border-line bg-white p-6";
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Panel</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Package, "Ürün", products.length, `${products.filter((p) => p.model3d).length} tanesinde 3D model`, "/admin/urunler"],
          [FileText, "Yeni teklif talebi", newQuotes, `${quotes.length} toplam`, "/admin/teklifler"],
          [ShoppingCart, "Açık sipariş", open, `${orders.length} toplam`, "/admin/siparisler"],
          [AlertTriangle, "Taslak teknik veri", draft, "Fabrika verisiyle güncellenmeli", "/admin/urunler"],
        ].map(([I, t, n, s, h]) => {
          const Icon = I as typeof Package;
          return (
            <Link key={t as string} href={h as string} className={`${card} transition hover:border-red`}>
              <Icon size={20} className="text-red" />
              <p className="mt-5 text-4xl font-semibold tracking-tight text-ink">{n as number}</p>
              <p className="mt-1 text-[14px] font-medium text-ink">{t as string}</p>
              <p className="mt-1 text-[12.5px] text-body">{s as string}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-semibold">Son teklif talepleri</h2>
          <ul className="mt-4 divide-y divide-line text-[14px]">
            {quotes.slice(0, 5).map((q) => <li key={q.id} className="flex justify-between gap-4 py-3"><span><b className="text-ink">{q.company}</b><br /><span className="text-body">{q.product}</span></span><span className="shrink-0 font-mono text-[12px] text-body">{formatDate(q.createdAt)}</span></li>)}
            {quotes.length === 0 && <li className="py-6 text-body">Henüz talep yok.</li>}
          </ul>
        </section>
        <section className={card}>
          <h2 className="font-semibold">Son siparişler</h2>
          <ul className="mt-4 divide-y divide-line text-[14px]">
            {orders.slice(0, 5).map((o) => <li key={o.id} className="flex justify-between gap-4 py-3"><span><b className="font-mono text-ink">{o.number}</b><br /><span className="text-body">{o.customer.company || o.customer.name}</span></span><span className="shrink-0 font-semibold text-ink">{formatTRY(o.total)}</span></li>)}
            {orders.length === 0 && <li className="py-6 text-body">Henüz sipariş yok.</li>}
          </ul>
        </section>
        {low.length > 0 && (
          <section className={`${card} lg:col-span-2`}>
            <h2 className="font-semibold">Stoğu azalan satış ürünleri</h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-[13px]">{low.map((p) => <li key={p.id}><Link href={`/admin/urunler/${p.id}`} className="rounded-full border border-line px-3.5 py-1.5 hover:border-red hover:text-red">{p.name} · <b>{p.stock}</b> adet</Link></li>)}</ul>
          </section>
        )}
      </div>
    </div>
  );
}
