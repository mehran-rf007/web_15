import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { getSiteContent } from "@/lib/siteSettings";
import BuyPackages from "@/components/BuyPackages";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export default async function BuyPage({
  searchParams,
}: {
  searchParams: { payment?: string; credits?: string };
}) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const content = await getSiteContent();
  const p = content.payment;

  const svc = createServiceSupabase();
  const { data: wallet } = await svc
    .from("credit_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();
  const balance = wallet?.balance ?? 0;

  const paymentStatus = searchParams.payment;
  const boughtCredits = searchParams.credits;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      {/* نوار موجودی */}
      <div className="border-b border-ink/5">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-6 py-3">
          <div className="flex items-center gap-2 rounded-full bg-clay/40 px-4 py-1.5 text-sm font-bold">
            <span>💳</span>
            <span>موجودی: {fa(balance)} کردیت</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* بنر وضعیت پرداخت */}
        {paymentStatus === "success" ? (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center">
            <div className="text-2xl">✅</div>
            <p className="mt-1 font-black text-green-700">{p.successNote}</p>
            {boughtCredits ? (
              <p className="mt-1 text-sm text-green-700">
                {fa(boughtCredits)} کردیت به حساب شما افزوده شد.
              </p>
            ) : null}
            <Link
              href="/studio"
              className="mt-4 inline-block rounded-xl bg-gold px-5 py-2 text-sm font-bold text-white transition hover:bg-gold-dark"
            >
              برو به استودیو و بساز ‹
            </Link>
          </div>
        ) : null}
        {paymentStatus === "failed" ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">
            <div className="text-2xl">⚠️</div>
            <p className="mt-1 font-black text-red-600">{p.failNote}</p>
          </div>
        ) : null}

        {/* سرتیتر */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black md:text-4xl">{p.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">{p.subtitle}</p>
        </div>

        <BuyPackages packages={p.packages} gatewayName={p.gatewayName} />
      </main>
    </div>
  );
}
