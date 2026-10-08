/** Writes public/demo/catalog.json (the whole catalogue) for the static demo build. */
import { mkdirSync, writeFileSync } from "node:fs";
import { ARTICLES } from "../src/lib/data/articles";
import { PRODUCTS } from "../src/lib/data/products";
import { BRANDS, CATEGORIES } from "../src/lib/data/taxonomy";

mkdirSync("public/demo", { recursive: true });
writeFileSync("public/demo/catalog.json", JSON.stringify({ products: PRODUCTS, categories: CATEGORIES, brands: BRANDS, articles: ARTICLES }));
console.log(`demo catalog: ${PRODUCTS.length} products, ${CATEGORIES.length} categories, ${ARTICLES.length} articles`);
