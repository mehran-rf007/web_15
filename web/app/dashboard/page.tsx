import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { getSiteContent } from "@/lib/siteSettings";
import DashboardGallery, { type GalleryItem } from "@/components/DashboardGallery";
import SiteHeader from "@/components/SiteHeader";
import DashboardNav from "@/components/DashboardNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const STYLE_LABELS: Record<string, string> = {
  studio: "استودیویی",
  editorial: "مجله‌ای",
  lifestyle: "لایف‌استایل",
};

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faMoney(n: number): string {
  return fa(n.toLocaleString("en-US"));
}
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "لحظاتی پیش";
  if (m < 60) return `${fa(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${fa(h)} ساعت پیش`;
  const day = Math.floor(h / 24);
  return `${fa(day)} روز پیش`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    done: { label: "تکمیل شد", cls: "bg-green-100 text-green-700" },
    pending: { label: "در حال پردازش", cls: "bg-amber-100 text-amber-700" },
    failed: { label: "ناموفق", cls: "bg-red-100 text-red-600" },
  };
  const s = map[status] ?? map.pending;
  return <span className={"rounded-full px-3 py-1 text-xs font-bold " + s.cls}>{s.label}</span>;
}

export default async function DashboardPage() {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const content = await getSiteContent();
  const d = content.dashboard;
  const svc = createServiceSupabase();
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

  const [profileRes, walletRes, imagesRes] = await Promise.all([
    svc.from("profiles").select("display_name, plan").eq("id", user.id).single(),
    svc.from("credit_wallets").select("balance").eq("user_id", user.id).single(),
    svc
      .from("images")
      .select("id, output_path, style, quality, model_ref, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const profile = profileRes.data;
  const balance = walletRes.data?.balance ?? 0;
  const allImages = imagesRes.data ?? [];

  const displayName = profile?.display_name || user.email?.split("@")[0] || "کاربر";
  const planKey = (profile?.plan ?? "free") as keyof typeof d.planLabels;
  const planLabel = d.planLabels[planKey] ?? String(planKey);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const doneImages = allImages.filter((im) => im.status === "done");
  const monthCount = doneImages.filter((im) => im.created_at >= monthStart).length;
  const totalDone = doneImages.length;
  const savings = totalDone * d.savingsPerImageToman;
  const quotaPct = Math.min(100, Math.round((monthCount / Math.max(1, d.monthlyQuota)) * 100));

  // آدرس امضاشده برای تصاویر (باکت خصوصی)
  const withOutput = doneImages.filter((im) => im.output_path);
  const signedMap: Record<string, string> = {};
  if (withOutput.length > 0) {
    const { data: signed } = await svc.storage
      .from(bucket)
      .createSignedUrls(withOutput.map((im) => im.output_path as string), 3600);
    (signed ?? []).forEach((s) => {
      if (s.signedUrl && s.path) signedMap[s.path] = s.signedUrl;
    });
  }

  const gallery: GalleryItem[] = withOutput
    .map((im) => ({
      id: im.id as string,
      url: signedMap[im.output_path as string] ?? "",
      styleLabel: STYLE_LABELS[im.style as string] ?? (im.style as string),
    }))
    .filter((g) => g.url);

  const history = allImages.slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteHeader active="dashboard" />
      <DashboardNav />
      {/* خوشامدگویی */}
      <div className="border-b border-ink/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black">
              {d.greeting} {displayName} <span>👋</span>
            </h1>
            <p className="text-sm text-ink-muted">{d.welcomeNote}</p>
          </div>
          <Link
            href="/studio"
            className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark"
          >
            + {d.newImageCta}
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* کارت‌های آمار */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* اعتبار */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">اعتبار فعلی شما</span>
              <span className="text-lg">💳</span>
            </div>
            <div className="mt-2 text-3xl font-black">{fa(balance)}</div>
            <div className="text-xs text-ink-muted">کردیت</div>
            <Link
              href="/buy"
              className="mt-3 inline-block rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gold-dark"
            >
              {d.buyCreditsCta} ‹
            </Link>
          </div>

          {/* پلن فعلی */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">پلن فعلی</span>
              <span className="text-lg">👑</span>
            </div>
            <div className="mt-2 text-2xl font-black">{planLabel}</div>
            <Link href="/pricing" className="mt-3 inline-block text-xs font-bold text-gold-dark hover:underline">
              ارتقاء پلن ‹
            </Link>
          </div>

          {/* تصاویر این ماه */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">تصاویر این ماه</span>
              <span className="text-lg">🖼️</span>
            </div>
            <div className="mt-2 text-3xl font-black">{fa(monthCount)}</div>
            <div className="text-xs text-ink-muted">از {fa(d.monthlyQuota)} تصویر</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-clay/40">
              <div className="h-full rounded-full bg-gold" style={ { width: `${quotaPct}%` } } />
            </div>
          </div>

          {/* صرفه‌جویی */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink-muted">صرفه‌جویی شما</span>
              <span className="text-lg">📈</span>
            </div>
            <div className="mt-2 text-2xl font-black text-gold-dark">{faMoney(savings)}</div>
            <div className="text-xs text-ink-muted">تومان در مقایسه با عکاسی سنتی</div>
          </div>
        </div>

        {/* گالری + تاریخچه */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{d.galleryTitle}</h2>
              <Link href="/studio" className="text-sm font-medium text-gold-dark hover:underline">مشاهده همه ‹</Link>
            </div>
            <DashboardGallery items={gallery} />
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{d.historyTitle}</h2>
            </div>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">هنوز سفارشی ثبت نشده.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((im) => (
                  <li key={im.id} className="flex items-center justify-between gap-3 border-b border-ink/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand text-lg">📸</div>
                      <div>
                        <div className="text-sm font-bold">عکس {STYLE_LABELS[im.style as string] ?? im.style}</div>
                        <div className="text-xs text-ink-muted">
                          {im.quality === "pro" ? "کیفیت حرفه‌ای" : "کیفیت استاندارد"} · {relativeTime(im.created_at as string)}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={im.status as string} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* بنر ارتقاء */}
        <section className="overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-l from-clay/40 to-sand/40 p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1.2fr_auto_2fr]">
            <div>
              <h3 className="text-xl font-black">{d.banner.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{d.banner.subtitle}</p>
            </div>
            <Link
              href="/pricing"
              className="justify-self-start rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark md:justify-self-center"
            >
              {d.banner.cta}
            </Link>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {d.banner.items.map((it, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-xl">{it.emoji}</div>
                  <div className="text-xs font-bold">{it.title}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{it.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
