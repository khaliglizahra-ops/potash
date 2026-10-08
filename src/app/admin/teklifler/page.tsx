import StatusSelect from "@/components/admin/StatusSelect";
import { list } from "@/lib/db";
import { requireAdmin } from "@/lib/server/admin";
import { formatDate } from "@/lib/text";
import type { QuoteRequest } from "@/lib/types";

export const metadata = { title: "Teklif talepleri" };

export default async function Page() {
  await requireAdmin();
  const quotes = list<QuoteRequest>("quote").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Teklif talepleri <span className="font-mono text-base font-normal text-body">{quotes.length}</span></h1>
      <ul className="mt-8 space-y-3">
        {quotes.map((q) => (
          <li key={q.id} className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-ink">{q.company}</p>
                <p className="text-[14px] text-body">{q.name} · <a className="hover:text-red" href={`tel:${q.phone}`}>{q.phone}</a> · <a className="hover:text-red" href={`mailto:${q.email}`}>{q.email}</a>{q.taxNo && ` · VN ${q.taxNo}`}</p>
              </div>
              <div className="flex items-center gap-4"><span className="font-mono text-[12px] text-body">{formatDate(q.createdAt)}</span><StatusSelect kind="quote" id={q.id} value={q.status} options={[["yeni", "Yeni"], ["inceleniyor", "İnceleniyor"], ["teklif-gonderildi", "Teklif gönderildi"], ["kapandi", "Kapandı"]]} /></div>
            </div>
            <p className="mt-4 text-[15px] text-ink"><b>{q.product}</b> × {q.qty}</p>
            {q.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-gray-50 p-3.5 text-[14px] leading-relaxed text-body">{q.message}</p>}
          </li>
        ))}
        {quotes.length === 0 && <li className="rounded-[16px] border border-dashed border-gray-300 p-14 text-center text-body">Henüz teklif talebi yok.</li>}
      </ul>
    </div>
  );
}
