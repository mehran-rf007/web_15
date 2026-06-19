import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { getSiteContent } from "@/lib/siteSettings";
import SiteHeader from "@/components/SiteHeader";
import DashboardNav from "@/components/DashboardNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faMoney(n: number): string {
  return fa(n.toLocaleString("en-US"));
}
function faDate(iso: string): string {
  try {
    return fa(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)));
  } catch {
    return iso;
  }
}

const TX_LABEL: Record<string, string> = {
  purchase: "خرید کردیت",
  generation: "ساخت تصویر",
  bonus: "هدیه",
  refund: "بازگرداندن کردیت",
};

export default async function PlanPage() {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const content = await getSiteContent();
  const d = content.dashboard;
  const svc = createServiceSupabase();

  const [profileRes, walletRes, txRes] = await Promise.all([
    svc.from("profiles").select("plan").eq("id", user.id).single(),
    svc.from("credit_wallets").select("balance").eq("user_id", user.id).single(),
    svc
      .from("credit_transactions")
      .select("id, amount, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const planKey = (profileRes.data?.plan ?? "free") as keyof typeof d.planLabels;
  const planLabel = d.planLabels[planKey] ?? String(planKey);
  const balance = walletRes.data?.balance ?? 0;
  const txs = txRes.data ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader active="dashboard" />
      <DashboardNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 text-xl font-black">پلن و اشتراک 👑</h1>
        <p className="mb-5 text-sm text-ink-muted">وضعیت پلن و کیف پول کردیت شما.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">پلن فعلی</span>
              <span className="text-lg">👑</span>
            </div>
            <div className="mt-2 text-2xl font-black">{planLabel}</div>
            <Link href="/pricing" className="mt-3 inline-block rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gold-dark">
              ارتقاء پلن ›
            </Link>
          </div>
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">اعتبار فعلی</span>
              <span className="text-lg">💳</span>
            </div>
            <div className="mt-2 text-3xl font-black">{fa(balance)}</div>
            <div className="text-xs text-ink-muted">کردیت</div>
            <Link href="/buy" className="mt-3 inline-block rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gold-dark">
              خرید توکن ›
            </Link>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-sm font-bold text-ink-soft">تاریخچه‌ی کردیت</h2>
        {txs.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">تراکنشی ثبت نشده است.</div>
        ) : (
          <ul className="card divide-y divide-ink/5">
            {txs.map((t) => {
              const amount = t.amount as number;
              const positive = amount > 0;
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-sm font-bold text-ink">{TX_LABEL[t.reason as string] ?? t.reason}</div>
                    <div className="text-xs text-ink-muted">{faDate(t.created_at as string)}</div>
                  </div>
                  <span className={"text-sm font-black " + (positive ? "text-green-600" : "text-red-500")}>
                    {positive ? "+" : "−"}{fa(Math.abs(amount))} کردیت
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
