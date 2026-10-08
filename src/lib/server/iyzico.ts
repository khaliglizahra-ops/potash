import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import type { Order } from "../types";
import type { PricedCart } from "./orders";

/**
 * iyzico Checkout Form (hosted). Card data is typed on iyzico's page, never here.
 * The browser callback is attacker-reachable, so success is only ever concluded
 * from a server-to-server "retrieve" call plus an order/amount cross-check.
 */
const API_KEY = process.env.IYZICO_API_KEY ?? "";
const SECRET_KEY = process.env.IYZICO_SECRET_KEY ?? "";
const BASE_URL = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
const INIT = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const RETRIEVE = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export const iyzicoConfigured = Boolean(API_KEY && SECRET_KEY && API_KEY !== "your-api-key");

function headers(path: string, body: string) {
  const rnd = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const sig = createHmac("sha256", SECRET_KEY).update(rnd + path + body).digest("hex");
  return {
    "Content-Type": "application/json",
    Authorization: `IYZWSv2 ${Buffer.from(`apiKey:${API_KEY}&randomKey:${rnd}&signature:${sig}`).toString("base64")}`,
    "x-iyzi-rnd": rnd,
  };
}
const dec = (k: number) => (k / 100).toFixed(2);

export type Start = { kind: "redirect"; url: string; reference: string } | { kind: "error"; message: string };

export async function startIyzico(order: Order, priced: PricedCart, callbackUrl: string, ip: string): Promise<Start> {
  if (!iyzicoConfigured) return { kind: "error", message: "not_configured" };
  const goodsGross = priced.grossK.reduce((a, b) => a + b, 0);
  const parts = order.customer.name.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts.pop()! : "-";
  const addr = `${order.shipping.line1}, ${order.shipping.district}`;
  const payload = {
    locale: "tr",
    conversationId: order.number,
    price: dec(goodsGross),
    paidPrice: dec(priced.totalK),
    currency: "TRY",
    basketId: order.number,
    paymentGroup: "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6],
    buyer: {
      id: order.id,
      name: parts.join(" ") || order.customer.name,
      surname,
      gsmNumber: order.customer.phone,
      email: order.customer.email,
      identityNumber: "11111111111",
      registrationAddress: addr,
      ip,
      city: order.shipping.city,
      country: "Turkey",
      zipCode: order.shipping.zip || undefined,
    },
    shippingAddress: { contactName: order.customer.name, city: order.shipping.city, country: "Turkey", address: addr, zipCode: order.shipping.zip || undefined },
    billingAddress: { contactName: order.customer.company || order.customer.name, city: order.shipping.city, country: "Turkey", address: addr, zipCode: order.shipping.zip || undefined },
    basketItems: order.lines.map((l, i) => ({
      id: l.sku,
      name: l.name.slice(0, 100),
      category1: "Laboratuvar Cihazı",
      itemType: "PHYSICAL",
      price: dec(priced.grossK[i]),
    })),
  };
  const body = JSON.stringify(payload);
  try {
    const res = await fetch(`${BASE_URL}${INIT}`, { method: "POST", headers: headers(INIT, body), body, signal: AbortSignal.timeout(20_000) });
    const d = (await res.json()) as { status?: string; errorMessage?: string; errorCode?: string; token?: string; paymentPageUrl?: string };
    if (d.status !== "success" || !d.paymentPageUrl) return { kind: "error", message: `${d.errorCode ?? "unknown"}: ${d.errorMessage ?? "failed"}` };
    return { kind: "redirect", url: d.paymentPageUrl, reference: d.token ?? order.number };
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : "network" };
  }
}

export interface Verification {
  reached: boolean;
  paid: boolean;
  paymentId?: string;
  basketId?: string;
  paidPriceK?: number;
}
export async function verifyIyzico(token: string): Promise<Verification> {
  if (!iyzicoConfigured) return { reached: false, paid: false };
  const body = JSON.stringify({ locale: "tr", token });
  try {
    const res = await fetch(`${BASE_URL}${RETRIEVE}`, { method: "POST", headers: headers(RETRIEVE, body), body, signal: AbortSignal.timeout(20_000) });
    const d = (await res.json()) as { status?: string; paymentStatus?: string; fraudStatus?: number; paymentId?: string; basketId?: string; paidPrice?: string | number };
    const paid = d.status === "success" && d.paymentStatus === "SUCCESS" && (d.fraudStatus === undefined || d.fraudStatus >= 0);
    const pp = Number(d.paidPrice);
    return { reached: true, paid, paymentId: d.paymentId ? String(d.paymentId) : undefined, basketId: d.basketId ? String(d.basketId) : undefined, paidPriceK: Number.isFinite(pp) ? Math.round(pp * 100) : undefined };
  } catch {
    return { reached: false, paid: false };
  }
}
