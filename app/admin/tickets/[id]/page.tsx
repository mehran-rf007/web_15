import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabaseServer";
import AdminTicketReply from "@/components/AdminTicketReply";

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

export default async function AdminTicketThread({ params }: { params: { id: string } }) {
  const svc = createServiceSupabase();
  const { data: ticket } = await svc
    .from("tickets")
    .select("id, user_id, subject, status, category, created_at")
    .eq("id", params.id)
    .single();
  if (!ticket) notFound();

  const [{ data: messages }, { data: profile }] = await Promise.all([
    svc
      .from("ticket_messages")
      .select("id, sender, body, created_at")
      .eq("ticket_id", params.id)
      .order("created_at", { ascending: true }),
    svc.from("profiles").select("display_name").eq("id", ticket.user_id).single(),
  ]);

  const msgs = messages ?? [];
  const st = STATUS[ticket.status as string] ?? STATUS.open;

  return (
    <div>
      <Link href="/admin/tickets" className="text-sm font-bold text-gold-dark hover:underline">
        › بازگشت به لیست تیکت‌ها
      </Link>
      <div className="mt-3 mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">{ticket.subject}</h1>
        <span className={"rounded-full px-3 py-1 text-xs font-bold " + st.cls}>{st.label}</span>
      </div>
      <p className="mb-5 text-sm text-ink-muted">کاربر: {profile?.display_name ?? "—"}</p>

      <div className="max-w-3xl space-y-3">
        {msgs.map((m) => {
          const admin = m.sender === "admin";
          return (
            <div key={m.id} className={"flex " + (admin ? "justify-end" : "justify-start")}>
              <div
                className={
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 " +
                  (admin ? "border border-gold/30 bg-gold/5 text-ink" : "bg-white text-ink shadow-soft")
                }
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-ink-muted">
                  <span>{admin ? "🎧 پشتیبانی" : "👤 کاربر"}</span>
                  <span>· {faDate(m.created_at as string)}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 max-w-3xl">
        <AdminTicketReply ticketId={ticket.id as string} status={ticket.status as string} />
      </div>
    </div>
  );
}
