import "server-only";
import { list } from "./db";
import * as core from "./catalog-core";
import { hasActiveFilters, type Filters } from "./filters";
import type { Article, Brand, Category, Product } from "./types";

export type { CardProduct, Facet, Listing, SearchResult } from "./catalog-core";
export { PAGE_SIZE } from "./catalog-core";

// ------------------------------------------------------------------ basics
export const getProducts = () => list<Product>("product");
export const getCategories = () => list<Category>("category").sort((a, b) => a.order - b.order);
export const getBrands = () => list<Brand>("brand");
export const getArticles = () => list<Article>("article").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const getProduct = (slug: string) => getProducts().find((p) => p.slug === slug);
export const getCategory = (slug: string) => getCategories().find((c) => c.slug === slug);
export const getBrand = (slug: string) => getBrands().find((b) => b.slug === slug);
export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug);

const ctx = (): core.Ctx => ({ products: getProducts(), categories: getCategories(), brands: getBrands(), articles: getArticles() });

export const toCard = (p: Product) => core.toCard(p, { categories: getCategories(), brands: getBrands() });
export const queryProducts = (f: Filters) => core.queryProducts(f, ctx());
export const search = (q: string, limit = 6) => core.search(q, ctx(), limit);
export const isFiltered = hasActiveFilters;
