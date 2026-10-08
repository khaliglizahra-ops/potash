"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { queryProducts, type Ctx } from "@/lib/catalog-core";
import { loadCatalog } from "@/lib/demo";
import { parseFilters, type Filters, type GroupKey } from "@/lib/filters";
import ListingBody from "./ListingBody";

/** Static-demo listing: filters/sorts/paginates in the browser from catalog.json (no server round-trips). */
export default function DemoListing({ basePath, fixed, hide = [] }: { basePath: string; fixed?: Partial<Filters>; hide?: GroupKey[] }) {
  const sp = useSearchParams();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  useEffect(() => {
    loadCatalog().then(setCtx);
  }, []);
  const key = sp.toString();
  const filters = useMemo(() => parseFilters(Object.fromEntries(new URLSearchParams(key)), fixed), [key, fixed]);
  const result = useMemo(() => (ctx ? queryProducts(filters, ctx) : null), [ctx, filters]);
  if (!result) return <div className="h-[60vh] animate-pulse rounded-[18px] bg-gray-50" />;
  return <ListingBody filters={filters} basePath={basePath} hide={hide} result={result} />;
}
