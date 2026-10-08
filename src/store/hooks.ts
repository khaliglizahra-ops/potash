"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useShop } from "./shop";

let rehydrated = false;

/** Rehydrates the persisted shop store once on the client (the store is created with skipHydration for SSR safety). */
export function Rehydrate() {
  useEffect(() => {
    if (rehydrated) return;
    rehydrated = true;
    useShop.persist?.rehydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nukleon-shop-v1") useShop.persist?.rehydrate();
    };
    window.addEventListener("storage", onStorage);
  }, []);
  return null;
}

const subscribe = (cb: () => void) => useShop.persist?.onFinishHydration(cb) ?? (() => {});
const hydratedNow = () => useShop.persist?.hasHydrated() ?? false;

/** Persisted value that equals `fallback` until the client store has hydrated (avoids SSR mismatches). */
export function useShopValue<T>(select: (s: ReturnType<typeof useShop.getState>) => T, fallback: T): T {
  const hydrated = useSyncExternalStore(subscribe, hydratedNow, () => false);
  const v = useShop(select);
  return hydrated ? v : fallback;
}
