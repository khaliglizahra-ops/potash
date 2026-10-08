"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useShopValue } from "@/store/hooks";
import ProductCard from "./ProductCard";

export default function FavoritesView() {
  const favs = useShopValue((s) => s.favorites, []);
  if (favs.length === 0)
    return (
      <div className="mt-12 grid place-items-center rounded-[18px] border border-dashed border-gray-300 px-6 py-24 text-center">
        <div>
          <Heart size={40} className="mx-auto text-gray-300" />
          <p className="mt-5 text-xl font-semibold text-ink">Henüz favori ürününüz yok</p>
          <p className="mx-auto mt-2 max-w-md text-body">Beğendiğiniz cihazların kalp simgesine dokunun; burada saklansın.</p>
          <Link href="/urunler" className="btn btn-primary mt-6">Ürünleri keşfet</Link>
        </div>
      </div>
    );
  return (
    <>
      <p className="mt-4 text-body">{favs.length} ürün kayıtlı</p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {favs.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
