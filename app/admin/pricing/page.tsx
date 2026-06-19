"use client";

import { useEffect, useRef, useState } from "react";
import { siteAssetUrl } from "@/lib/siteAssets";
import type { SiteContent, PricingConfig, PricingPlan, CompareRow, WhyItem } from "@/lib/siteSettings";

function ImageUpload({
  value,
  slot,
  onChange,
  transparent,
}: {
  value: string | null;
  slot: string;
  onChange: (path: string) => void;
  transparent?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = siteAssetUrl(value);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", slot);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در آپلود");
      onChange(data.path);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className={"relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-ink/10 " + (transparent ? "bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:16px_16px]" : "bg-sand")}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={"h-full w-full " + (transparent ? "object-contain" : "object-cover")} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-ink-muted">🖼️</span>
        )}
      </div>
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold text-ink-soft hover:bg-clay/30 disabled:opacity-50">
        {busy ? "در حال آپلود…" : url ? "تغییر عکس" : "آپلود عکس"}
      </button>
      {url && (
        <button type="button" onClick={() => onChange("")} className="text-sm text-red-500 hover:underline">حذف</button>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
      )}
    </label>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ویرایش لیست رشته‌ای (ویژگی‌ها، bullets)
function StringList({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={it} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a); }} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 text-sm text-red-500 hover:underline">حذف</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="text-sm font-bold text-gold-dark hover:underline">+ افزودن</button>
    </div>
  );
}

export default function AdminPricingPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setContent(d.content)).catch(() => setMsg("خطا در بارگذاری"));
  }, []);

  function patchP(p: Partial<PricingConfig>) {
    setContent((c) => (c ? { ...c, pricing: { ...c.pricing, ...p } } : c));
  }
  function patchPlan(i: number, p: Partial<PricingPlan>) {
    setContent((c) => {
      if (!c) return c;
      const plans = [...c.pricing.plans];
      plans[i] = { ...plans[i], ...p };
      return { ...c, pricing: { ...c.pricing, plans } };
    });
  }
  function patchRow(i: number, p: Partial<CompareRow>) {
    setContent((c) => {
      if (!c) return c;
      const rows = [...c.pricing.comparison.rows];
      rows[i] = { ...rows[i], ...p };
      return { ...c, pricing: { ...c.pricing, comparison: { ...c.pricing.comparison, rows } } };
    });
  }
  function patchWhy(i: number, p: Partial<WhyItem>) {
    setContent((c) => {
      if (!c) return c;
      const whyItems = [...c.pricing.whyItems];
      whyItems[i] = { ...whyItems[i], ...p };
      return { ...c, pricing: { ...c.pricing, whyItems } };
    });
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره");
      setContent(data.content);
      setMsg("✅ ذخیره شد. صفحه‌ی قیمت‌گذاری را با Ctrl+Shift+R ببین.");
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!content) return <div className="text-ink-muted">{msg ?? "در حال بارگذاری…"}</div>;
  const p = content.pricing;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black">قیمت‌گذاری</h1>
        <p className="mt-1 text-sm text-ink-muted">پلن‌ها، قیمت‌ها، جدول مقایسه و تصاویر صفحه‌ی قیمت‌گذاری را اینجا تغییر بده.</p>
      </div>

      {/* سربرگ + تصویر بالا */}
      <Section title="بخش بالا" desc="جای تصویر بالا پیش‌فرض خالی است؛ عکس خودت را آپلود کن و ابعادش را تعیین کن.">
        <div className="space-y-4">
          <ImageUpload value={p.topImagePath} slot="pricing-top" onChange={(v) => patchP({ topImagePath: v || null })} />
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-soft">عرض (پیکسل)</span>
              <input type="number" value={p.topImageWidth} onChange={(e) => patchP({ topImageWidth: Number(e.target.value) || 1 })} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-soft">ارتفاع (پیکسل)</span>
              <input type="number" value={p.topImageHeight} onChange={(e) => patchP({ topImageHeight: Number(e.target.value) || 1 })} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
            </label>
          </div>
          <Field label="برچسب روی تصویر" value={p.badge} onChange={(v) => patchP({ badge: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="عنوان" value={p.title} onChange={(v) => patchP({ title: v })} />
            <Field label="عنوان (بخش طلایی)" value={p.titleHighlight} onChange={(v) => patchP({ titleHighlight: v })} />
          </div>
          <Field label="زیرعنوان" value={p.subtitle} onChange={(v) => patchP({ subtitle: v })} textarea />
          <div>
            <span className="mb-1 block text-sm font-medium text-ink-soft">نکات کلیدی</span>
            <StringList items={p.bullets} onChange={(v) => patchP({ bullets: v })} />
          </div>
        </div>
      </Section>

      {/* جدول مقایسه */}
      <Section title="جدول مقایسه‌ی هزینه‌ها">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="عنوان جدول" value={p.comparison.title} onChange={(v) => patchP({ comparison: { ...p.comparison, title: v } })} />
            <Field label="ستون سنتی" value={p.comparison.traditionalLabel} onChange={(v) => patchP({ comparison: { ...p.comparison, traditionalLabel: v } })} />
            <Field label="ستون میانی" value={p.comparison.compareLabel} onChange={(v) => patchP({ comparison: { ...p.comparison, compareLabel: v } })} />
            <Field label="ستون AI" value={p.comparison.aiLabel} onChange={(v) => patchP({ comparison: { ...p.comparison, aiLabel: v } })} />
          </div>
          <div className="space-y-3">
            {p.comparison.rows.map((r, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-ink/10 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <Field label="مورد" value={r.label} onChange={(v) => patchRow(i, { label: v })} />
                <Field label="عکاسی سنتی" value={r.traditional} onChange={(v) => patchRow(i, { traditional: v })} />
                <Field label="ژورنال AI" value={r.ai} onChange={(v) => patchRow(i, { ai: v })} />
                <button type="button" onClick={() => patchP({ comparison: { ...p.comparison, rows: p.comparison.rows.filter((_, j) => j !== i) } })} className="self-end pb-2 text-sm text-red-500 hover:underline">حذف</button>
              </div>
            ))}
            <button type="button" onClick={() => patchP({ comparison: { ...p.comparison, rows: [...p.comparison.rows, { label: "", traditional: "", ai: "" }] } })} className="text-sm font-bold text-gold-dark hover:underline">+ افزودن ردیف</button>
          </div>
        </div>
      </Section>

      {/* پلن‌ها */}
      <Section title="پلن‌ها و قیمت‌ها">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="برچسب ماهانه" value={p.monthlyLabel} onChange={(v) => patchP({ monthlyLabel: v })} />
            <Field label="برچسب سالانه" value={p.yearlyLabel} onChange={(v) => patchP({ yearlyLabel: v })} />
          </div>
          {p.plans.map((pl, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-ink/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-soft">پلن {i + 1}</span>
                <button type="button" onClick={() => patchP({ plans: p.plans.filter((_, j) => j !== i) })} className="text-sm text-red-500 hover:underline">حذف پلن</button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="نام" value={pl.name} onChange={(v) => patchPlan(i, { name: v })} />
                <Field label="ایموجی" value={pl.emoji} onChange={(v) => patchPlan(i, { emoji: v })} />
                <Field label="توضیح کوتاه" value={pl.desc} onChange={(v) => patchPlan(i, { desc: v })} />
                <Field label="قیمت ماهانه" value={pl.priceMonthly} onChange={(v) => patchPlan(i, { priceMonthly: v })} />
                <Field label="قیمت سالانه" value={pl.priceYearly} onChange={(v) => patchPlan(i, { priceYearly: v })} />
                <Field label="واحد (مثلاً هزار تومان / ماه)" value={pl.unit} onChange={(v) => patchPlan(i, { unit: v })} />
                <Field label="متن دکمه" value={pl.cta} onChange={(v) => patchPlan(i, { cta: v })} />
                <Field label="برچسب (مثلاً محبوب‌ترین)" value={pl.badge} onChange={(v) => patchPlan(i, { badge: v })} />
                <label className="flex items-center gap-2 pt-6 text-sm font-medium text-ink-soft">
                  <input type="checkbox" checked={pl.highlighted} onChange={(e) => patchPlan(i, { highlighted: e.target.checked })} />
                  پلن برجسته
                </label>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-ink-soft">ویژگی‌ها</span>
                <StringList items={pl.features} onChange={(v) => patchPlan(i, { features: v })} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => patchP({ plans: [...p.plans, { name: "پلن جدید", emoji: "✨", desc: "", priceMonthly: "0", priceYearly: "0", unit: "هزار تومان / ماه", features: [], cta: "شروع کنید", highlighted: false, badge: "" }] })} className="text-sm font-bold text-gold-dark hover:underline">+ افزودن پلن</button>
          <Field label="یادداشت زیر پلن‌ها" value={p.plansNote} onChange={(v) => patchP({ plansNote: v })} />
        </div>
      </Section>

      {/* چرا ژورنال */}
      <Section title="بخش «چرا ژورنال؟»">
        <div className="space-y-4">
          <Field label="عنوان بخش" value={p.whyTitle} onChange={(v) => patchP({ whyTitle: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            {p.whyItems.map((w, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-ink/10 p-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <Field label="ایموجی" value={w.emoji} onChange={(v) => patchWhy(i, { emoji: v })} />
                  <Field label="عنوان" value={w.title} onChange={(v) => patchWhy(i, { title: v })} />
                </div>
                <Field label="توضیح" value={w.desc} onChange={(v) => patchWhy(i, { desc: v })} textarea />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* بنر پایین */}
      <Section title="بنر پایین (دعوت به اقدام)" desc="جای تصویر شخص ترنسپارنت (PNG بدون پس‌زمینه) است؛ پیش‌فرض خالی.">
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-ink-soft">تصویر شخص (ترنسپارنت)</span>
            <ImageUpload value={p.bottomImagePath} slot="pricing-bottom" transparent onChange={(v) => patchP({ bottomImagePath: v || null })} />
          </div>
          <Field label="عنوان" value={p.bottomTitle} onChange={(v) => patchP({ bottomTitle: v })} />
          <Field label="زیرعنوان" value={p.bottomSubtitle} onChange={(v) => patchP({ bottomSubtitle: v })} textarea />
          <div className="grid grid-cols-2 gap-4">
            <Field label="متن دکمه" value={p.bottomCta} onChange={(v) => patchP({ bottomCta: v })} />
            <Field label="یادداشت کنار دکمه" value={p.bottomNote} onChange={(v) => patchP({ bottomNote: v })} />
          </div>
        </div>
      </Section>

      {/* نوار ذخیره */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <span className="text-sm text-ink-muted">{msg}</span>
          <button onClick={save} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? "در حال ذخیره…" : "ذخیره‌ی تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
