import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import SiteHeader from "@/components/SiteHeader";
import DashboardNav from "@/components/DashboardNav";
import NewTicketForm from "@/components/NewTicketForm";
import Link from "next/link";

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
  open: { label: "باز / در انتظار پاسخ", cls: "bg-amber-100 text-amber-700" },
  answered: { label: "پاسخ داده شد", cls: "bg-green-100 text-green-700" },
  closed: { label: "بسته شده", cls: "bg-gray-200 text-gray-600" },
};

export default async function TicketsPage() {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const svc = createServiceSupabase();
  const { data: tickets } = await svc
    .from("tickets")
    .select("id, subject, category, status, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  const items = tickets ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader active="dashboard" />
      <DashboardNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 text-xl font-black">تیکت پشتیبانی 🎟️</h1>
        <p className="mb-5 text-sm text-ink-muted">سوال یا مشکلت را با ما در میان بگذار؛ در سریع‌ترین زمان پاسخ می‌دهیم.</p>

        <NewTicketForm />

        <h2 className="mb-3 mt-8 text-sm font-bold text-ink-soft">تیکت‌های شما</h2>
        {items.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">هنوز تیکتی ثبت نکرده‌اید.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((t) => {
              const st = STATUS[t.status as string] ?? STATUS.open;
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    className="card flex items-center justify-between gap-3 p-4 transition hover:shadow-soft"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-bold text-ink">{t.subject}</div>
                      <div className="text-xs text-ink-muted">آخرین به‌روزرسانی: {faDate(t.updated_at as string)}</div>
                    </div>
                    <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-bold " + st.cls}>{st.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
