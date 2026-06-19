import { getAnalytics, getApiBalance } from "@/lib/analytics";
import { getSiteContent } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

function fmt(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(n));
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-ink-muted">{title}</div>
      <div className="mt-2 text-2xl font-black text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const [content, { stats, recent }, balance] = await Promise.all([
    getSiteContent(),
    getAnalytics(),
    getApiBalance(),
  ]);

  const estRevenue = stats.credits_purchased * content.pricePerCreditToman;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">درآمد و آنالیز</h1>
        <p className="mt-1 text-sm text-ink-muted">نمای کلی از وضعیت کسب‌وکار و مصرف API.</p>
      </div>

      {/* درآمد */}
      <section>
        <h2 className="mb-3 text-lg font-bold">💰 درآمد</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="درآمد تخمینی"
            value={`${fmt(estRevenue)} تومان`}
            hint={`بر پایه‌ی ${fmt(content.pricePerCreditToman)} تومان به ازای هر کردیت`}
          />
          <Card title="کردیت فروخته‌شده" value={fmt(stats.credits_purchased)} />
          <Card title="کردیت مصرف‌شده" value={fmt(stats.credits_consumed)} />
          <Card title="کردیت باقی‌مانده‌ی کاربران" value={fmt(stats.credits_outstanding)} />
        </div>
      </section>

      {/* آمار مصرف */}
      <section>
        <h2 className="mb-3 text-lg font-bold">📈 آمار کلی</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="کاربران" value={fmt(stats.users)} />
          <Card title="کل تولیدها" value={fmt(stats.generations_total)} />
          <Card
            title="تولید موفق"
            value={fmt(stats.generations_success)}
            hint={
              stats.generations_total > 0
                ? `نرخ موفقیت ${fmt(
                    (stats.generations_success / stats.generations_total) * 100,
                  )}٪`
                : undefined
            }
          />
          <Card title="تصاویر ثبت‌شده" value={fmt(stats.images)} />
        </div>
      </section>

      {/* شارژ API */}
      <section>
        <h2 className="mb-3 text-lg font-bold">🔌 موجودی شارژ API (OpenRouter)</h2>
        {!balance.configured ? (
          <div className="card p-5 text-sm text-ink-muted">
            کلید API تنظیم نشده. برای نمایش موجودی، متغیر <code className="rounded bg-clay/40 px-1">OPENROUTER_API_KEY</code> را در تنظیمات سرویس وب اضافه کن.
          </div>
        ) : balance.error ? (
          <div className="card p-5 text-sm text-red-600">خطا در دریافت موجودی: {balance.error}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="موجودی باقی‌مانده" value={`$${(balance.balance ?? 0).toFixed(2)}`} hint="دلار — قابل مصرف برای تولید" />
            <Card title="کل شارژ‌شده" value={`$${(balance.totalCredits ?? 0).toFixed(2)}`} />
            <Card title="مصرف‌شده تاکنون" value={`$${(balance.totalUsage ?? 0).toFixed(2)}`} />
          </div>
        )}
      </section>

      {/* آخرین تولیدها */}
      <section>
        <h2 className="mb-3 text-lg font-bold">🕖 آخرین تولیدها</h2>
        <div className="card overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-5 text-sm text-ink-muted">هنوز تولیدی ثبت نشده است.</div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-clay/30 text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-bold">زمان</th>
                  <th className="px-4 py-3 font-bold">ارائه‌دهنده</th>
                  <th className="px-4 py-3 font-bold">مدل</th>
                  <th className="px-4 py-3 font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="px-4 py-3 text-ink-muted">
                      {new Date(r.created_at).toLocaleString("fa-IR")}
                    </td>
                    <td className="px-4 py-3">{r.provider ?? "—"}</td>
                    <td className="px-4 py-3">{r.model ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.success ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">موفق</span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">ناموفق</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
