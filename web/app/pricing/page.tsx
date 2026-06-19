import Link from "next/link";
import HeroImage from "../../components/HeroImage";
import PricingPlans from "../../components/PricingPlans";
import { getSiteContent } from "@/lib/siteSettings";
import { siteAssetUrl } from "@/lib/siteAssets";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PricingPage() {
  const content = await getSiteContent();
  const p = content.pricing;
  const topUrl = siteAssetUrl(p.topImagePath);
  const bottomUrl = siteAssetUrl(p.bottomImagePath);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* هدر مشترک */}
      <SiteHeader active="pricing" />

      {/* هیرو قیمت‌گذاری */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              {p.title}{" "}
              <span className="text-gold">{p.titleHighlight}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-ink-muted md:mx-0">{p.subtitle}</p>
            <ul className="mt-6 space-y-3">
              {p.bullets.map((b, i) => (
                <li key={i} className="flex items-center justify-center gap-2 text-ink-soft md:justify-start">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* جای تصویر بالا — از پنل مدیریت */}
            <div
              className="relative w-full overflow-hidden rounded-3xl border border-ink/10 bg-sand shadow-soft"
              style={ { aspectRatio: `${p.topImageWidth} / ${p.topImageHeight}` } }
            >
              {topUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={topUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-muted" />
              )}
              {/* برچسب تخفیف روی تصویر */}
              <div className="absolute bottom-4 right-4 left-4 rounded-2xl bg-gold/90 px-5 py-3 text-center text-sm font-bold text-white shadow-soft backdrop-blur">
                🏷️ {p.badge}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* مقایسه‌ی هزینه‌ها */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="card overflow-hidden p-0">
          <h2 className="py-6 text-center text-2xl font-bold">✦ {p.comparison.title}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-y border-ink/10 bg-sand/50">
                  <th className="px-4 py-3 font-bold text-ink-muted">{p.comparison.traditionalLabel}</th>
                  <th className="px-4 py-3 font-bold text-ink">{p.comparison.compareLabel}</th>
                  <th className="px-4 py-3 font-bold text-gold-dark">✦ {p.comparison.aiLabel}</th>
                </tr>
              </thead>
              <tbody>
                {p.comparison.rows.map((r, i) => (
                  <tr key={i} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 text-ink-muted">{r.traditional}</td>
                    <td className="px-4 py-3 font-medium text-ink">{r.label}</td>
                    <td className="px-4 py-3 font-bold text-ink">{r.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* پلن‌ها */}
      <section id="plans" className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-8 text-center text-3xl font-black">✦ {p.plansTitle}</h2>
        <PricingPlans plans={p.plans} monthlyLabel={p.monthlyLabel} yearlyLabel={p.yearlyLabel} />
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-ink-muted">
          <span className="text-gold">✓</span> {p.plansNote}
        </p>
      </section>

      {/* چرا ژورنال */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-10 text-center text-2xl font-bold">✦ {p.whyTitle}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {p.whyItems.map((w, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-2xl">
                {w.emoji}
              </div>
              <h4 className="mb-2 font-bold">{w.title}</h4>
              <p className="text-sm text-ink-muted">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* بنر پایین + تصویر شخص (ترنسپارنت) */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-10 text-cream md:px-12">
          <div className="grid items-center gap-6 md:grid-cols-3">
            {/* جای تصویر شخص — ترنسپارنت، از پنل مدیریت */}
            <div className="order-2 flex justify-center md:order-1 md:justify-start">
              {bottomUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bottomUrl} alt="" className="max-h-56 w-auto object-contain" />
              ) : (
                <div className="h-44 w-44" />
              )}
            </div>
            <div className="order-1 text-center md:order-2 md:col-span-1">
              <h3 className="text-2xl font-black md:text-3xl">{p.bottomTitle}</h3>
              <p className="mt-3 text-cream/70">{p.bottomSubtitle}</p>
            </div>
            <div className="order-3 flex flex-col items-center gap-2 md:items-end">
              <Link href="/login" className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark">
                {p.bottomCta} ←
              </Link>
              <span className="flex items-center gap-1 text-xs text-cream/60">🔒 {p.bottomNote}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
