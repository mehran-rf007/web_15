import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import SiteHeader from "@/components/SiteHeader";
import DashboardNav from "@/components/DashboardNav";
import TicketReply from "@/components/TicketReply";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

export default async function TicketThreadPage({ params }: { params: { id: string } }) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const svc = createServiceSupabase();
  const { data: ticket } = await svc
    .from("tickets")
    .select("id, user_id, subject, status, created_at")
    .eq("id", params.id)
    .single();

  if (!ticket || ticket.user_id !== user.id) notFound();

  const { data: messages } = await svc
    .from("ticket_messages")
    .select("id, sender, body, created_at")
    .eq("ticket_id", params.id)
    .order("created_at", { ascending: true });

  const msgs = messages ?? [];
  const st = STATUS[ticket.status as string] ?? STATUS.open;

  return (
    <div className="min-h-screen">
      <SiteHeader active="dashboard" />
      <DashboardNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/dashboard/tickets" className="text-sm font-bold text-gold-dark hover:underline">
          › بازگشت به تیکت‌ها
        </Link>
        <div className="mt-3 mb-5 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-black">{ticket.subject}</h1>
          <span className={"rounded-full px-3 py-1 text-xs font-bold " + st.cls}>{st.label}</span>
        </div>

        <div className="space-y-3">
          {msgs.map((m) => {
            const admin = m.sender === "admin";
            return (
              <div key={m.id} className={"flex " + (admin ? "justify-start" : "justify-end")}>
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 " +
                    (admin
                      ? "border border-gold/30 bg-gold/5 text-ink"
                      : "bg-white text-ink shadow-soft")
                  }
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-ink-muted">
                    <span>{admin ? "🎧 پشتیبانی ژورینو" : "👤 شما"}</span>
                    <span>· {faDate(m.created_at as string)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <TicketReply ticketId={ticket.id as string} closed={ticket.status === "closed"} />
        </div>
      </main>
    </div>
  );
}
