import "server-only";
import { randomUUID } from "node:crypto";
import { list, nextSeq, put } from "../db";
import { getProduct } from "../catalog";
import { FREE_SHIPPING_FROM, SHIPPING_FLAT, VAT_RATE } from "../product-utils";
import type { Order, OrderLine } from "../types";

export const getOrders = () => list<Order>("order").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getOrder = (id: string) => getOrders().find((o) => o.id === id);

const kurus = (n: number) => Math.round(n * 100);
const tl = (k: number) => k / 100;

export interface PricedCart {
  lines: OrderLine[];
  subtotalK: number;
  vatK: number;
  shippingK: number;
  totalK: number;
  /** per-line gross (VAT included) in kuruş; sums exactly to subtotal+vat */
  grossK: number[];
}

/** Re-prices a client cart from the database. Never trusts client prices. */
export function priceCart(input: { slug: string; qty: number }[]): PricedCart | { error: string } {
  const lines: OrderLine[] = [];
  for (const it of input.slice(0, 50)) {
    const p = getProduct(it.slug);
    const qty = Math.floor(Number(it.qty));
    if (!p || !Number.isFinite(qty) || qty < 1 || qty > 99) return { error: "Sepetinizde geçersiz bir ürün var." };
    if (p.price === null) return { error: `${p.name} teklif ile satılır; sepete eklenemez.` };
    lines.push({ slug: p.slug, name: p.name, sku: p.sku, qty, unitPrice: p.price });
  }
  if (!lines.length) return { error: "Sepetiniz boş." };

  const subtotalK = lines.reduce((s, l) => s + kurus(l.unitPrice) * l.qty, 0);
  const grossK = lines.map((l) => Math.round(kurus(l.unitPrice) * l.qty * (1 + VAT_RATE)));
  const goodsGross = grossK.reduce((a, b) => a + b, 0);
  const vatK = goodsGross - subtotalK;
  const shippingK = subtotalK / 100 >= FREE_SHIPPING_FROM ? 0 : kurus(SHIPPING_FLAT);
  return { lines, subtotalK, vatK, shippingK, totalK: goodsGross + shippingK, grossK };
}

export async function createOrder(args: {
  priced: PricedCart;
  customer: Order["customer"];
  shipping: Order["shipping"];
  payment: Order["payment"];
  note: string;
  customerId?: string;
}): Promise<Order> {
  const { priced } = args;
  const order: Order = {
    id: randomUUID(),
    number: `NK-${new Date().getFullYear()}-${String(nextSeq("order")).padStart(4, "0")}`,
    customerId: args.customerId,
    customer: args.customer,
    shipping: args.shipping,
    billingSame: true,
    lines: priced.lines,
    subtotal: tl(priced.subtotalK),
    vat: tl(priced.vatK),
    shippingCost: tl(priced.shippingK),
    total: tl(priced.totalK),
    payment: args.payment,
    paymentStatus: "bekliyor",
    status: "alindi",
    note: args.note,
    createdAt: new Date().toISOString(),
  };
  return put("order", order);
}

export function updateOrder(id: string, patch: Partial<Order>) {
  const o = getOrder(id);
  if (!o) return null;
  return put("order", { ...o, ...patch });
}
