import { queryProducts } from "@/lib/catalog";
import type { Filters, GroupKey } from "@/lib/filters";
import ListingBody from "./ListingBody";

export default function ListingView({ filters, basePath, hide = [] }: { filters: Filters; basePath: string; hide?: GroupKey[] }) {
  return <ListingBody filters={filters} basePath={basePath} hide={hide} result={queryProducts(filters)} />;
}
