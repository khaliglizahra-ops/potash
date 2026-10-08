import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ARTICLES } from "./data/articles";
import { PRODUCTS } from "./data/products";
import { BRANDS, CATEGORIES } from "./data/taxonomy";

/**
 * Tiny document store on top of Node's built-in SQLite (no native add-ons, so it
 * installs the same on a laptop and on a Hostinger Node.js plan).
 *
 *   docs(kind, id, slug, data JSON, ts)
 *
 * Catalogue data is small (a few hundred rows), so reads load a whole `kind`
 * into memory and are cached until the next write.
 */

type Kind = "product" | "category" | "brand" | "article" | "quote" | "order" | "customer" | "contact";

const g = globalThis as unknown as { __nkDb?: DatabaseSync; __nkCache?: Map<string, unknown[]> };

function open(): DatabaseSync {
  if (g.__nkDb) return g.__nkDb;
  const file = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? "data/nukleon.db");
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS docs (
      kind TEXT NOT NULL,
      id   TEXT NOT NULL,
      slug TEXT,
      data TEXT NOT NULL,
      ts   TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (kind, id)
    );
    CREATE INDEX IF NOT EXISTS docs_slug ON docs(kind, slug);
  `);
  g.__nkDb = db;
  g.__nkCache = new Map();
  seed(db);
  return db;
}

function seed(db: DatabaseSync) {
  const count = (k: Kind) => (db.prepare("SELECT COUNT(*) AS n FROM docs WHERE kind = ?").get(k) as { n: number }).n;
  const ins = db.prepare("INSERT OR IGNORE INTO docs(kind,id,slug,data) VALUES (?,?,?,?)");
  const load = (kind: Kind, rows: { id: string; slug?: string }[]) => {
    if (count(kind) > 0) return;
    db.exec("BEGIN");
    for (const r of rows) ins.run(kind, r.id, r.slug ?? null, JSON.stringify(r));
    db.exec("COMMIT");
  };
  load("category", CATEGORIES);
  load("brand", BRANDS);
  load("product", PRODUCTS);
  load("article", ARTICLES);
}

export function list<T>(kind: Kind): T[] {
  const db = open();
  const cache = g.__nkCache!;
  const hit = cache.get(kind);
  if (hit) return hit as T[];
  const rows = db.prepare("SELECT data FROM docs WHERE kind = ? ORDER BY ts DESC, rowid DESC").all(kind) as { data: string }[];
  const out = rows.map((r) => JSON.parse(r.data) as T);
  cache.set(kind, out);
  return out;
}

export function put<T extends { id: string; slug?: string }>(kind: Kind, doc: T): T {
  const db = open();
  db.prepare(
    `INSERT INTO docs(kind,id,slug,data,ts) VALUES (?,?,?,?,datetime('now'))
     ON CONFLICT(kind,id) DO UPDATE SET slug=excluded.slug, data=excluded.data, ts=excluded.ts`,
  ).run(kind, doc.id, doc.slug ?? null, JSON.stringify(doc));
  g.__nkCache!.delete(kind);
  return doc;
}

export function remove(kind: Kind, id: string) {
  const db = open();
  db.prepare("DELETE FROM docs WHERE kind = ? AND id = ?").run(kind, id);
  g.__nkCache!.delete(kind);
}

export function nextSeq(name: string): number {
  const db = open();
  db.exec("CREATE TABLE IF NOT EXISTS seq (name TEXT PRIMARY KEY, n INTEGER NOT NULL)");
  db.prepare("INSERT INTO seq(name,n) VALUES (?,1) ON CONFLICT(name) DO UPDATE SET n = n + 1").run(name);
  return (db.prepare("SELECT n FROM seq WHERE name = ?").get(name) as { n: number }).n;
}
