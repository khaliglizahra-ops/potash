import type { Metadata } from "next";
import { Suspense } from "react";
import CartView from "@/components/shop/CartView";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = { title: "Sepetim", robots: { index: false, follow: true } };

export default function CartPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <Breadcrumb items={[{ name: "Sepetim", href: "/sepet" }]} />
      <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-semibold leading-none tracking-[-0.03em]">Sepetim</h1>
      <Suspense>
        <CartView />
      </Suspense>
    </div>
  );
}
