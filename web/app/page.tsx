import Link from "next/link";
import HeroImage from "../components/HeroImage";
import { getSiteContent } from "@/lib/siteSettings";
import { siteAssetUrl } from "@/lib/siteAssets";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NAV = [
  { label: "خانه", href: "#" },
  { label: "قیمت‌ها", href: "/pricing" },
  { label: "نمونه‌کارها", href: "#samples" },
  { label: "راهنما", href: "#how" },
  { label: "درباره ما", href: "#about" },
];

const STEPS = [
  { n: "۱", title: "آپلود محصول", desc: "عکس محصول خود را بارگذاری کن", emoji: "⬆️" },
  { n: "۲", title: "انتخاب مدل و سبک", desc: "مدل و سبک مورد نظر خود را انتخاب کن", emoji: "👤" },
  { n: "۳", title: "دریافت عکس ژورنالی", desc: "عکس حرفه‌ای و آماده‌ی فروش دریافت کن", emoji: "🖼️" },
];

export default async function HomePage() {
  const content = await getSiteContent();
  const hero = content.hero;
  const heroUrl = siteAssetUrl(hero.imagePath);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* هدر */}
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            {siteAssetUrl(content.logoPath) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siteAssetUrl(content.logoPath)!} alt={content.brandName} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <span className="text-gold text-2xl">✨</span>
                <span className="text-2xl font-extrabold tracking-tight">{content.brandName}</span>
              </>
            )}
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-sm font-medium text-ink-soft transition hover:text-gold">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-gold">
              ورود
            </Link>
            <Link href="/login" className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark">
              ثبت‌نام رایگان
            </Link>
          </div>
        </div>
      </header>

      {/* هیرو */}
      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-right">
            <span className="mb-5 inline-block rounded-full border border-gold/40 bg-white/60 px-4 py-1.5 text-sm font-medium text-gold-dark">
              {hero.badge}
            </span>
            <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              {hero.title}{" "}
              <span className="text-gold">{hero.titleHighlight}</span> {hero.titleAfter}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-ink-muted md:mx-0">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Link href="/studio" className="btn-gold">{hero.ctaPrimary} ←</Link>
              <a href="#samples" className="btn-outline">{hero.ctaSecondary}</a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 md:justify-start">
              <div className="flex -space-x-2 -space-x-reverse">
                {["🗿", "👜", "👠", "🧥"].map((e, i) => (
                  <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream bg-clay text-sm">
                    {e}
                  </span>
                ))}
              </div>
              <p className="text-sm text-ink-muted">
                بیش از <b className="text-ink">۱۵٬۰۰۰</b> فروشنده پیوسته‌اند · ⭐ ۴٫۹ از ۵
              </p>
            </div>
          </div>

          <HeroImage imageUrl={heroUrl} width={hero.width} height={hero.height} />
        </div>
      </section>

      {/* قبل/بعد + گالری مدل */}
      <section id="samples" className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="mb-5 text-center text-xl font-bold">
              قبل و بعد <span className="text-gold">جادویی</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
                <span className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-bold">قبل</span>
                <span className="flex h-full w-full items-center justify-center text-5xl">👜</span>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-clay to-gold/40">
                <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">بعد</span>
                <span className="flex h-full w-full items-center justify-center text-5xl">✨</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-5 text-center text-xl font-bold">
              <span className="text-gold">مدل</span> دلخواهت را انتخاب کن
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {content.models.map((m, i) => {
                const url = siteAssetUrl(m.imagePath);
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-sand text-3xl">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={m.label} className="h-full w-full object-cover" />
                      ) : (
                        m.emoji
                      )}
                    </div>
                    <span className="text-center text-xs font-medium text-ink-soft">{m.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Link href="/studio" className="text-sm font-bold text-gold-dark hover:underline">مشاهده همه‌ی مدل‌ها ←</Link>
            </div>
          </div>
        </div>
      </section>

      {/* انتخاب سبک */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="mb-6 text-center text-2xl font-bold">
          <span className="text-gold">سبک</span> مورد نظرت را انتخاب کن
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {content.styles.map((s, i) => {
            const url = siteAssetUrl(s.imagePath);
            return (
              <div key={i} className="group flex flex-col items-center gap-2">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-sand text-4xl transition group-hover:bg-clay">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={s.label} className="h-full w-full object-cover" />
                  ) : (
                    s.emoji
                  )}
                </div>
                <span className="text-center text-xs font-medium text-ink-soft">{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 text-center">
          <Link href="/studio" className="text-sm font-bold text-gold-dark hover:underline">مشاهده همه‌ی سبک‌ها ←</Link>
        </div>
      </section>

      {/* آمار */}
      <section className="relative my-12 bg-clay/40 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
          {content.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black text-ink">{s.value}</div>
              <div className="mt-2 text-sm font-medium text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* فرآیند سه قدم */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-12">
        <h3 className="mb-10 text-center text-2xl font-bold">
          فرآیند <span className="text-gold">ساده</span> در سه قدم
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card relative p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">
                {s.n}
              </div>
              <div className="mb-2 text-3xl">{s.emoji}</div>
              <h4 className="mb-2 text-lg font-bold">{s.title}</h4>
              <p className="text-sm text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/studio" className="btn-gold">همین حالا شروع کن ←</Link>
        </div>
      </section>

      {/* فوتر */}
      <footer id="about" className="mt-12 bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-gold text-2xl">✨</span>
              <span className="text-2xl font-extrabold">{content.brandName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              اولین پلتفرم هوش مصنوعی عکاسی محصول برای فروشندگان آنلاین و اینستاگرامی. عکس‌های ژورنالی، حرفه‌ای و آماده‌ی فروش در چند ثانیه.
            </p>
          </div>
          <div>
            <h5 className="mb-4 font-bold">لینک‌های مفید</h5>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#pricing" className="hover:text-gold">قیمت‌ها</a></li>
              <li><a href="#samples" className="hover:text-gold">نمونه‌کارها</a></li>
              <li><a href="#how" className="hover:text-gold">راهنما</a></li>
              <li><a href="#" className="hover:text-gold">سوالات متداول</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-bold">منابع</h5>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-gold">وبلاگ</a></li>
              <li><a href="#" className="hover:text-gold">آموزش‌ها</a></li>
              <li><a href="#" className="hover:text-gold">شرایط استفاده</a></li>
              <li><a href="#" className="hover:text-gold">حریم خصوصی</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-bold">خبرنامه‌ی {content.brandName}</h5>
            <p className="mb-3 text-sm text-cream/70">جدیدترین آموزش‌ها و امکانات را دریافت کن.</p>
            <div className="flex overflow-hidden rounded-xl bg-cream/10">
              <input className="w-full bg-transparent px-4 py-2 text-sm placeholder:text-cream/40 focus:outline-none" placeholder="ایمیل خود را وارد کن" />
              <button className="bg-gold px-4 text-white">➜</button>
            </div>
          </div>
        </div>
        <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
          تمامی حقوق این سایت متعلق به {content.brandName} (Jorino.ir) می‌باشد.
        </div>
      </footer>
    </div>
  );
}
