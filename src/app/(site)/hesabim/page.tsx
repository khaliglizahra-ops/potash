import type { Metadata } from "next";
import AccountView from "@/components/shop/AccountView";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { list } from "@/lib/db";
import { currentCustomer, publicCustomer } from "@/lib/server/auth";
import { getOrders } from "@/lib/server/orders";
import type { QuoteRequest } from "@/lib/types";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const c = await currentCustomer();
  const orders = c ? getOrders().filter((o) => o.customerId === c.id || o.customer.email === c.email) : [];
  const quotes = c ? list<QuoteRequest>("quote").filter((q) => q.email === c.email) : [];
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Hesabım", href: "/hesabim" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Hesabım</h1>
      <AccountView customer={c ? publicCustomer(c) : null} orders={orders} quotes={quotes} />
    </div>
  );
}
