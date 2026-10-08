/** Turkish-aware text helpers (safe on server and client). */

const MAP: Record<string, string> = { ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g", ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c" };

/** Lower-case, strip Turkish diacritics: "İnkübatör" → "inkubator". */
export function fold(s: string): string {
  return s
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (c) => MAP[c])
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function slugify(s: string): string {
  return fold(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TRY = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export const formatTRY = (n: number) => TRY.format(n).replace(/\s/g, " ");

const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (iso: string) => DATE.format(new Date(iso));
