import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { list, put } from "../db";
import type { Address, Customer } from "../types";
import { hashPassword, safeEqual, sign, unsign, verifyPassword } from "./security";

const CUSTOMER_COOKIE = "nk_session";
const ADMIN_COOKIE = "nk_admin";
const DAY = 86_400;

export const getCustomers = () => list<Customer>("customer");

export function findCustomerByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return getCustomers().find((c) => c.email === e);
}

export function registerCustomer(input: { name: string; email: string; password: string; phone?: string; company?: string }): Customer | "exists" {
  if (findCustomerByEmail(input.email)) return "exists";
  const c: Customer = {
    id: randomUUID(),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    phone: input.phone ?? "",
    company: input.company ?? "",
    passwordHash: hashPassword(input.password),
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  return put("customer", c);
}

export function checkLogin(email: string, password: string): Customer | null {
  const c = findCustomerByEmail(email);
  if (!c || !verifyPassword(password, c.passwordHash)) return null;
  return c;
}

export async function startCustomerSession(c: Customer) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, sign(`${c.id}:${Date.now() + 30 * DAY * 1000}`), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * DAY,
  });
}
export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}
export async function currentCustomer(): Promise<Customer | null> {
  const raw = unsign((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!raw) return null;
  const [id, exp] = raw.split(":");
  if (Number(exp) < Date.now()) return null;
  return getCustomers().find((c) => c.id === id) ?? null;
}
export const publicCustomer = (c: Customer) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, company: c.company, addresses: c.addresses });

export function saveAddresses(c: Customer, addresses: Address[]) {
  return put("customer", { ...c, addresses });
}

// ------------------------------------------------------------------ admin
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "nukleon-admin");
}
export function checkAdminPassword(pw: string) {
  const real = adminPassword();
  return !!real && safeEqual(pw, real);
}
export async function startAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, sign(`admin:${Date.now() + 12 * 3600 * 1000}`), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600,
  });
}
export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
export async function isAdmin(): Promise<boolean> {
  const raw = unsign((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!raw) return false;
  const [who, exp] = raw.split(":");
  return who === "admin" && Number(exp) > Date.now();
}
