import Link from "next/link";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faDate(iso: string): string {
  try {
    return fa(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)));
  } catch {
    return iso;
  }
}

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "در انتظار پاسخ", cls: "bg-amber-100 text-amber-700" },
  answered: { label: "پاسخ داده شد", cls: "bg-green-100 text-green-700" },
  closed: { label: "بسته شده", cls: "bg-gray-200 text-gray-600" },
};
const CAT: Record<string, string> = {
  general: "عمومی", payment: "پرداخت", technical: "فنی", other: "سایر",
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const svc = createServiceSupabase();
  const filter = searchParams.status;

  let q = svc
    .from("tickets")
    .select("id, subject, category, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (filter && ["open", "answered", "closed"].includes(filter)) {
    q = q.eq("status", filter);
  }
  const { data } = await q;
  const items = data ?? [];

  const TABS = [
    { key: "", label: "همه" },
    { key: "open", label: "در انتظار" },
    { key: "answered", label: "پاسخ‌داده" },
    { key: "closed", label: "بسته" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">تیکت‌های پشتیبانی 🎟️</h1>
      <p className="mb-5 text-sm text-ink-muted">به سوالات و مشکلات کاربران پاسخ دهید.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/tickets?status=${t.key}` : "/admin/tickets"}
            className={
              "rounded-xl px-3 py-1.5 text-sm font-bold transition " +
              ((filter ?? "") === t.key ? "bg-gold text-white" : "border border-ink/15 text-ink-soft hover:bg-clay/30")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink-muted">تیکتی یافت نشد.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => {
            const st = STATUS[t.status as string] ?? STATUS.open;
            return (
              <li key={t.id}>
                <Link href={`/admin/tickets/${t.id}`} className="card flex items-center justify-between gap-3 p-4 transition hover:shadow-soft">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink">{t.subject}</div>
                    <div className="text-xs text-ink-muted">{CAT[t.category as string] ?? t.category} · {faDate(t.updated_at as string)}</div>
                  </div>
                  <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-bold " + st.cls}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
