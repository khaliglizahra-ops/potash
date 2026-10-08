"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusSelect({ kind, id, value, options }: { kind: "order" | "orderPayment" | "quote" | "contact"; id: string; value: string; options: [string, string][] }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  return (
    <select
      value={v}
      aria-label="Durum"
      onChange={async (e) => {
        const prev = v;
        setV(e.target.value);
        const r = await fetch("/api/admin/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, value: e.target.value }) });
        if (!r.ok) setV(prev);
        else router.refresh();
      }}
      className="field !h-10 !w-auto min-w-[150px] text-[13px]"
    >
      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  );
}
