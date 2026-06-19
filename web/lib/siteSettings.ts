// محتوای قابل‌کاستوم‌سازی سایت — ذخیره در جدول site_settings (key='content')
import { createServiceSupabase } from "./supabaseServer";
import { unstable_noStore as noStore } from "next/cache";

export interface HeroConfig {
  imagePath: string | null; // مسیر در باکت site-assets (خالی = بدون عکس)
  width: number;            // عرض پیشنهادی (پیکسل)
  height: number;           // ارتفاع پیشنهادی (پیکسل)
  badge: string;
  title: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface GalleryItem {
  label: string;
  emoji: string;
  imagePath: string | null;
}

export interface PricingPlan {
  name: string;
  emoji: string;
  desc: string;
  priceMonthly: string;
  priceYearly: string;
  unit: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge: string;
}

export interface CompareRow {
  label: string;
  traditional: string;
  ai: string;
}

export interface WhyItem {
  emoji: string;
  title: string;
  desc: string;
}

export interface PricingConfig {
  topImagePath: string | null;
  topImageWidth: number;
  topImageHeight: number;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  bullets: string[];
  comparison: {
    title: string;
    compareLabel: string;
    traditionalLabel: string;
    aiLabel: string;
    rows: CompareRow[];
  };
  plansTitle: string;
  monthlyLabel: string;
  yearlyLabel: string;
  plans: PricingPlan[];
  plansNote: string;
  whyTitle: string;
  whyItems: WhyItem[];
  bottomImagePath: string | null;
  bottomTitle: string;
  bottomSubtitle: string;
  bottomCta: string;
  bottomNote: string;
}

export interface DashboardBannerItem {
  emoji: string;
  title: string;
  desc: string;
}

export interface DashboardConfig {
  greeting: string;
  welcomeNote: string;
  monthlyQuota: number;
  savingsPerImageToman: number;
  newImageCta: string;
  buyCreditsCta: string;
  galleryTitle: string;
  historyTitle: string;
  planLabels: { free: string; starter: string; pro: string; business: string };
  banner: {
    title: string;
    subtitle: string;
    cta: string;
    items: DashboardBannerItem[];
  };
}

export interface PaymentPackage {
  credits: number;        // تعداد کردیت این بسته
  priceToman: number;     // قیمت به تومان (مبلغ پرداختی)
  label: string;          // عنوان بسته
  badge: string;          // برچسب (مثلاً «پرفروش‌ترین») — خالی = بدون برچسب
  highlighted: boolean;   // کارت ویژه
}

export interface PaymentConfig {
  title: string;
  subtitle: string;
  gatewayName: string;    // نام درگاه برای نمایش (مثلاً «زرین‌پال»)
  packages: PaymentPackage[];
  successNote: string;    // پیام پس از پرداخت موفق
  failNote: string;       // پیام پس از پرداخت ناموفق
}

export interface SiteContent {
  brandName: string;
  logoPath: string | null;   // لوگوی ترنسپرنت (مسیر در باکت site-assets) — خالی = نمایش نام برند
  pricePerCreditToman: number;
  hero: HeroConfig;
  stats: Stat[];
  models: GalleryItem[];
  styles: GalleryItem[];
  pricing: PricingConfig;
  dashboard: DashboardConfig;
  payment: PaymentConfig;
}

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "ژورینو",
  logoPath: null,
  pricePerCreditToman: 9900,
  hero: {
    imagePath: null,
    width: 440,
    height: 560,
    badge: "هوش مصنوعی برای عکاسی محصول",
    title: "عکس محصولت را به یک",
    titleHighlight: "ژورنالی",
    titleAfter: "حرفه‌ای تبدیل کن",
    subtitle:
      "کافیست عکس محصول را آپلود کنی، مدل دلخواه را انتخاب کنی، و در چند ثانیه عکس ژورنالی و آماده‌ی فروش بگیری.",
    ctaPrimary: "شروع رایگان",
    ctaSecondary: "مشاهده نمونه‌ها",
  },
  stats: [
    { value: "۹۸٪", label: "رضایت کاربران" },
    { value: "۱۵K+", label: "فروشنده‌ی فعال" },
    { value: "۱۲۰K+", label: "تصویر تولیدشده" },
  ],
  models: [
    { label: "دختر ایرانی", emoji: "👩‍🦱", imagePath: null },
    { label: "خانم باحجاب", emoji: "🧕", imagePath: null },
    { label: "مدل اروپایی", emoji: "👱‍♀️", imagePath: null },
    { label: "مدل عرب", emoji: "🧔", imagePath: null },
    { label: "مدل اسپرت", emoji: "🏃", imagePath: null },
    { label: "مدل لوکس", emoji: "💎", imagePath: null },
  ],
  styles: [
    { label: "مجله‌ی فشن", emoji: "📖", imagePath: null },
    { label: "لوکس و استودیو", emoji: "✨", imagePath: null },
    { label: "استریت‌ور", emoji: "🛹", imagePath: null },
    { label: "لایف‌استایل", emoji: "☕", imagePath: null },
    { label: "زیبایی و آرایشی", emoji: "💄", imagePath: null },
    { label: "جواهرات", emoji: "💍", imagePath: null },
    { label: "عطر", emoji: "🧴", imagePath: null },
    { label: "مینیمال", emoji: "◽", imagePath: null },
  ],
  pricing: {
    topImagePath: null,
    topImageWidth: 560,
    topImageHeight: 420,
    badge: "عکس ژورنالی حرفه‌ای تا ۸۰٪ ارزان‌تر از عکاسی سنتی",
    title: "قیمت‌گذاری شفاف",
    titleHighlight: "برای حرفه‌ای‌ها",
    subtitle:
      "با هزینه‌ای کمتر از عکاسی سنتی، عکس‌های ژورنالی، حرفه‌ای و آماده‌ی فروش دریافت کنید.",
    bullets: ["صرفه‌جویی در زمان و هزینه", "کیفیت استودیو، بدون محدودیت"],
    comparison: {
      title: "مقایسه هزینه‌ها",
      compareLabel: "مورد مقایسه",
      traditionalLabel: "عکاسی سنتی",
      aiLabel: "ژورنال AI",
      rows: [
        { label: "هزینه برای هر عکس", traditional: "۲٬۰۰۰٬۰۰۰ تومان", ai: "از ۱۵٬۰۰۰ تومان" },
        { label: "زمان تحویل", traditional: "۲ تا ۷ روز", ai: "چند ثانیه تا چند دقیقه" },
        { label: "نیاز به مدل", traditional: "دارد", ai: "ندارد (مدل‌های متنوع در ژورنال)" },
        { label: "محل عکاسی", traditional: "استودیو / لوکیشن", ai: "کاملاً آنلاین" },
        { label: "تعداد عکس در هر سفارش", traditional: "محدود", ai: "نامحدود" },
        { label: "امکان اصلاح و تغییر", traditional: "با هزینه اضافه", ai: "نامحدود و رایگان" },
        { label: "مناسب برای فروشگاه‌های آنلاین", traditional: "خیر", ai: "بله" },
      ],
    },
    plansTitle: "پلن‌های ما",
    monthlyLabel: "ماهانه",
    yearlyLabel: "سالانه ( ۲۰٪ تخفیف )",
    plans: [
      {
        name: "ویژه",
        emoji: "⭐",
        desc: "برای آژانس‌ها و تیم‌های بزرگ",
        priceMonthly: "تماس بگیرید",
        priceYearly: "تماس بگیرید",
        unit: "",
        features: ["عکس نامحدود", "مدل‌های اختصاصی", "سبک اختصاصی", "کیفیت اختصاصی", "پشتیبانی اختصاصی"],
        cta: "ارتباط با ما",
        highlighted: false,
        badge: "",
      },
      {
        name: "بیزینس",
        emoji: "💎",
        desc: "برای برندها و کسب‌وکارها",
        priceMonthly: "۸۹۰",
        priceYearly: "۷۱۲",
        unit: "هزار تومان / ماه",
        features: ["۵۰۰ عکس در ماه", "دسترسی به همه مدل‌ها", "همه سبک‌ها + سبک اختصاصی", "کیفیت بسیار بالا", "بدون واترمارک", "پشتیبانی VIP"],
        cta: "شروع کنید",
        highlighted: true,
        badge: "محبوب‌ترین",
      },
      {
        name: "حرفه‌ای",
        emoji: "👑",
        desc: "مناسب فروشگاه‌های درحال رشد",
        priceMonthly: "۳۹۰",
        priceYearly: "۳۱۲",
        unit: "هزار تومان / ماه",
        features: ["۱۵۰ عکس در ماه", "دسترسی به همه مدل‌ها", "همه سبک‌ها", "کیفیت بالا", "بدون واترمارک"],
        cta: "شروع کنید",
        highlighted: false,
        badge: "",
      },
      {
        name: "پایه",
        emoji: "🚀",
        desc: "برای شروع کار",
        priceMonthly: "۱۵۰",
        priceYearly: "۱۲۰",
        unit: "هزار تومان / ماه",
        features: ["۵۰ عکس در ماه", "دسترسی به ۲۰ مدل", "سبک‌های پایه", "کیفیت استاندارد"],
        cta: "شروع کنید",
        highlighted: false,
        badge: "",
      },
    ],
    plansNote: "تمام پلن‌ها شامل دسترسی به ابزار ویرایش و تغییر پس‌زمینه هستند.",
    whyTitle: "چرا ژورنال انتخاب هوشمندانه‌تری است؟",
    whyItems: [
      { emoji: "🏆", title: "کیفیت ژورنالی", desc: "عکس‌هایی در حد مجلات معتبر و کمپین‌های تبلیغاتی" },
      { emoji: "💰", title: "صرفه‌جویی واقعی", desc: "تا ۸۰٪ ارزان‌تر از عکاسی سنتی با کیفیتی برابر یا بهتر" },
      { emoji: "⚡", title: "سرعت فوق‌العاده", desc: "در چند ثانیه عکس آماده تحویل دریافت کنید" },
      { emoji: "🎨", title: "آزادی خلاقیت", desc: "مدل، سبک، پس‌زمینه و نورپردازی دقیقاً مطابق سلیقه‌ی شما" },
    ],
    bottomImagePath: null,
    bottomTitle: "آماده‌اید فروشگاه خود را یک قدم جلوتر ببرید؟",
    bottomSubtitle: "همین حالا شروع کنید و اولین عکس ژورنالی خود را بسازید.",
    bottomCta: "شروع رایگان",
    bottomNote: "بدون نیاز به کارت بانکی",
  },
  dashboard: {
    greeting: "سلام",
    welcomeNote: "خوش آمدید به پنل کاربری شما",
    monthlyQuota: 150,
    savingsPerImageToman: 150000,
    newImageCta: "تصویر جدید بساز",
    buyCreditsCta: "خرید کردیت",
    galleryTitle: "گالری تصاویر",
    historyTitle: "تاریخچه سفارش‌ها",
    planLabels: { free: "رایگان", starter: "پایه", pro: "حرفه‌ای", business: "بیزینس" },
    banner: {
      title: "عکس خلاقانه‌تری می‌خواهید؟",
      subtitle: "مدل‌های جدید، سبک‌های متنوع و امکانات حرفه‌ای‌تر منتظر شماست.",
      cta: "اکنون ارتقاء دهید",
      items: [
        { emoji: "👤", title: "دسترسی به همه مدل‌ها", desc: "بیش از ۳۰۰ مدل حرفه‌ای" },
        { emoji: "💎", title: "سبک‌های اختصاصی", desc: "سبک‌های ویژه و منحصربه‌فرد" },
        { emoji: "🖼️", title: "کیفیت بالاتر تصاویر", desc: "رزولوشن و جزئیات بیشتر" },
        { emoji: "⚡", title: "پردازش سریع‌تر", desc: "اولویت در پردازش تصاویر" },
      ],
    },
  },
  payment: {
    title: "خرید کردیت",
    subtitle: "بسته‌ی مورد نظرتان را انتخاب کنید و پرداخت امن انجام دهید.",
    gatewayName: "زرین‌پال",
    packages: [
      { credits: 10, priceToman: 200000, label: "بسته پایه", badge: "", highlighted: false },
      { credits: 30, priceToman: 510000, label: "بسته محبوب", badge: "پرفروش‌ترین", highlighted: true },
      { credits: 100, priceToman: 1500000, label: "بسته حرفه‌ای", badge: "به‌صرفه‌ترین", highlighted: false },
    ],
    successNote: "پرداخت با موفقیت انجام شد و کردیت‌ها به حساب شما افزوده شد. ✅",
    failNote: "پرداخت ناموفق بود یا لغو شد. در صورت کسر وجه، مبلغ تا ۷۲ ساعت بازمی‌گردد.",
  },
};

function mergeContent(v: any): SiteContent {
  const c = v ?? {};
  return {
    brandName: typeof c.brandName === "string" ? c.brandName : DEFAULT_CONTENT.brandName,
    logoPath: typeof c.logoPath === "string" ? c.logoPath : null,
    pricePerCreditToman:
      typeof c.pricePerCreditToman === "number"
        ? c.pricePerCreditToman
        : DEFAULT_CONTENT.pricePerCreditToman,
    hero: { ...DEFAULT_CONTENT.hero, ...(c.hero ?? {}) },
    stats: Array.isArray(c.stats) ? c.stats : DEFAULT_CONTENT.stats,
    models: Array.isArray(c.models) ? c.models : DEFAULT_CONTENT.models,
    styles: Array.isArray(c.styles) ? c.styles : DEFAULT_CONTENT.styles,
    pricing: {
      ...DEFAULT_CONTENT.pricing,
      ...(c.pricing ?? {}),
      bullets: Array.isArray(c.pricing?.bullets) ? c.pricing.bullets : DEFAULT_CONTENT.pricing.bullets,
      comparison: {
        ...DEFAULT_CONTENT.pricing.comparison,
        ...((c.pricing?.comparison) ?? {}),
        rows: Array.isArray(c.pricing?.comparison?.rows)
          ? c.pricing.comparison.rows
          : DEFAULT_CONTENT.pricing.comparison.rows,
      },
      plans: Array.isArray(c.pricing?.plans) ? c.pricing.plans : DEFAULT_CONTENT.pricing.plans,
      whyItems: Array.isArray(c.pricing?.whyItems) ? c.pricing.whyItems : DEFAULT_CONTENT.pricing.whyItems,
    },
    dashboard: {
      ...DEFAULT_CONTENT.dashboard,
      ...(c.dashboard ?? {}),
      planLabels: { ...DEFAULT_CONTENT.dashboard.planLabels, ...((c.dashboard?.planLabels) ?? {}) },
      banner: {
        ...DEFAULT_CONTENT.dashboard.banner,
        ...((c.dashboard?.banner) ?? {}),
        items: Array.isArray(c.dashboard?.banner?.items)
          ? c.dashboard.banner.items
          : DEFAULT_CONTENT.dashboard.banner.items,
      },
    },
    payment: {
      ...DEFAULT_CONTENT.payment,
      ...(c.payment ?? {}),
      packages: Array.isArray(c.payment?.packages) && c.payment.packages.length > 0
        ? c.payment.packages
        : DEFAULT_CONTENT.payment.packages,
    },
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  try {
    const svc = createServiceSupabase();
    const { data } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "content")
      .single();
    return mergeContent(data?.value);
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveSiteContent(input: Partial<SiteContent>): Promise<SiteContent> {
  const merged = mergeContent(input);
  const svc = createServiceSupabase();
  const { error } = await svc.from("site_settings").upsert({
    key: "content",
    value: merged,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return merged;
}
