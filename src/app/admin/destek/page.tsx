import StatusSelect from "@/components/admin/StatusSelect";
import { list } from "@/lib/db";
import { requireAdmin } from "@/lib/server/admin";
import { formatDate } from "@/lib/text";

export const metadata = { title: "Destek talepleri" };

interface Contact { id: string; name: string; email: string; phone: string; topic: string; device: string; message: string; status: string; createdAt: string }

export default async function Page() {
  await requireAdmin();
  const items = list<Contact>("contact").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Destek talepleri <span className="font-mono text-base font-normal text-body">{items.length}</span></h1>
      <ul className="mt-8 space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="font-semibold text-ink">{c.name} <span className="ml-2 rounded-full bg-gray-50 px-2.5 py-0.5 font-mono text-[11px] text-body">{c.topic}</span></p><p className="text-[14px] text-body"><a href={`mailto:${c.email}`} className="hover:text-red">{c.email}</a>{c.phone && ` · ${c.phone}`}{c.device && ` · ${c.device}`}</p></div>
              <div className="flex items-center gap-4"><span className="font-mono text-[12px] text-body">{formatDate(c.createdAt)}</span><StatusSelect kind="contact" id={c.id} value={c.status} options={[["yeni", "Yeni"], ["inceleniyor", "İnceleniyor"], ["kapandi", "Kapandı"]]} /></div>
            </div>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-body">{c.message}</p>
          </li>
        ))}
        {items.length === 0 && <li className="rounded-[16px] border border-dashed border-gray-300 p-14 text-center text-body">Henüz destek talebi yok.</li>}
      </ul>
    </div>
  );
}
