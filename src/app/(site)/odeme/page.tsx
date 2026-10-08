import type { Metadata } from "next";
import CheckoutView from "@/components/shop/CheckoutView";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { iyzicoConfigured } from "@/lib/server/iyzico";

export const metadata: Metadata = { title: "Ödeme", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Sepetim", href: "/sepet" }, { name: "Ödeme", href: "/odeme" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Ödeme</h1>
      <CheckoutView cardEnabled={iyzicoConfigured} />
    </div>
  );
}
