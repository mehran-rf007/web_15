import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import SiteHeader from "@/components/SiteHeader";
import DashboardNav from "@/components/DashboardNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faDate(iso: string): string {
  try {
    return fa(
      new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso)),
    );
  } catch {
    return iso;
  }
}

const KIND_STYLE: Record<string, { cls: string; emoji: string }> = {
  info: { cls: "border-blue-200 bg-blue-50", emoji: "ℹ️" },
  success: { cls: "border-green-200 bg-green-50", emoji: "✅" },
  warning: { cls: "border-amber-200 bg-amber-50", emoji: "⚠️" },
  promo: { cls: "border-gold/30 bg-gold/5", emoji: "🎁" },
};

export default async function NotificationsPage() {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const svc = createServiceSupabase();
  const { data: notifications } = await svc
    .from("notifications")
    .select("id, title, body, kind, created_at")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifications ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader active="dashboard" />
      <DashboardNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 text-xl font-black">اعلان‌ها 🔔</h1>
        <p className="mb-5 text-sm text-ink-muted">آخرین اطلاعیه‌ها و خبرهای ژورینو.</p>

        {items.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-muted">
            <div className="text-3xl">🔕</div>
            <p className="mt-2">فعلاً اعلانی وجود ندارد.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => {
              const st = KIND_STYLE[n.kind as string] ?? KIND_STYLE.info;
              return (
                <li key={n.id} className={"rounded-2xl border p-4 " + st.cls}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{st.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-bold text-ink">{n.title}</h2>
                        <span className="text-[11px] text-ink-muted">{faDate(n.created_at as string)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-ink-soft">{n.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
