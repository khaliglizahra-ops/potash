"use client";

import { useEffect } from "react";
import { useShop } from "@/store/shop";
import { Rehydrate } from "@/store/hooks";

export default function ClearCart() {
  const clear = useShop((s) => s.clearCart);
  useEffect(() => {
    const t = setTimeout(clear, 400); // after Rehydrate has restored the stored cart
    return () => clearTimeout(t);
  }, [clear]);
  return <Rehydrate />;
}
