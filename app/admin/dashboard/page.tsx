"use client";

import { useEffect, useState } from "react";
import type { SiteContent, DashboardConfig, DashboardBannerItem } from "@/lib/siteSettings";

function Field({ label, value, onChange, textarea, type }: { label: string; value: string | number; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
      ) : (
        <input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" />
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

export default function AdminDashboardPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setContent(d.content)).catch(() => setMsg("خطا در بارگذاری"));
  }, []);

  function patchD(p: Partial<DashboardConfig>) {
    setContent((c) => (c ? { ...c, dashboard: { ...c.dashboard, ...p } } : c));
  }
  function patchPlan(key: "free" | "starter" | "pro" | "business", v: string) {
    setContent((c) => (c ? { ...c, dashboard: { ...c.dashboard, planLabels: { ...c.dashboard.planLabels, [key]: v } } } : c));
  }
  function patchBanner(p: Partial<DashboardConfig["banner"]>) {
    setContent((c) => (c ? { ...c, dashboard: { ...c.dashboard, banner: { ...c.dashboard.banner, ...p } } } : c));
  }
  function patchItem(i: number, p: Partial<DashboardBannerItem>) {
    setContent((c) => {
      if (!c) return c;
      const items = [...c.dashboard.banner.items];
      items[i] = { ...items[i], ...p };
      return { ...c, dashboard: { ...c.dashboard, banner: { ...c.dashboard.banner, items } } };
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
      setMsg("✅ ذخیره شد. داشبورد را با Ctrl+Shift+R ببین.");
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!content) return <div className="text-ink-muted">{msg ?? "در حال بارگذاری…"}</div>;
  const d = content.dashboard;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black">داشبورد کاربری</h1>
        <p className="mt-1 text-sm text-ink-muted">متن‌ها، سقف ماهانه، محاسبه‌ی صرفه‌جویی، نام پلن‌ها و بنر ارتقاء را اینجا تنظیم کن.</p>
      </div>

      <Section title="خوش‌آمدگویی و دکمه‌ها">
        <div className="grid grid-cols-2 gap-4">
          <Field label="متن سلام" value={d.greeting} onChange={(v) => patchD({ greeting: v })} />
          <Field label="یادداشت خوش‌آمد" value={d.welcomeNote} onChange={(v) => patchD({ welcomeNote: v })} />
          <Field label="دکمه‌ی تصویر جدید" value={d.newImageCta} onChange={(v) => patchD({ newImageCta: v })} />
          <Field label="دکمه‌ی خرید کردیت" value={d.buyCreditsCta} onChange={(v) => patchD({ buyCreditsCta: v })} />
          <Field label="عنوان گالری" value={d.galleryTitle} onChange={(v) => patchD({ galleryTitle: v })} />
          <Field label="عنوان تاریخچه" value={d.historyTitle} onChange={(v) => patchD({ historyTitle: v })} />
        </div>
      </Section>

      <Section title="معیارها و محاسبات" desc="سقف تصاویر ماهانه و هزینه‌ی فرضی عکاسی سنتی برای محاسبه‌ی صرفه‌جویی.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="سقف تصاویر ماهانه" type="number" value={d.monthlyQuota} onChange={(v) => patchD({ monthlyQuota: Number(v) || 0 })} />
          <Field label="صرفه‌جویی به ازای هر عکس (تومان)" type="number" value={d.savingsPerImageToman} onChange={(v) => patchD({ savingsPerImageToman: Number(v) || 0 })} />
        </div>
      </Section>

      <Section title="نام پلن‌ها" desc="برچسب نمایشی پلن کاربر در داشبورد.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="رایگان (free)" value={d.planLabels.free} onChange={(v) => patchPlan("free", v)} />
          <Field label="پایه (starter)" value={d.planLabels.starter} onChange={(v) => patchPlan("starter", v)} />
          <Field label="حرفه‌ای (pro)" value={d.planLabels.pro} onChange={(v) => patchPlan("pro", v)} />
          <Field label="بیزینس (business)" value={d.planLabels.business} onChange={(v) => patchPlan("business", v)} />
        </div>
      </Section>

      <Section title="بنر ارتقاء">
        <div className="space-y-4">
          <Field label="عنوان" value={d.banner.title} onChange={(v) => patchBanner({ title: v })} />
          <Field label="زیرعنوان" value={d.banner.subtitle} onChange={(v) => patchBanner({ subtitle: v })} textarea />
          <Field label="متن دکمه" value={d.banner.cta} onChange={(v) => patchBanner({ cta: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            {d.banner.items.map((it, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-ink/10 p-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <Field label="ایموجی" value={it.emoji} onChange={(v) => patchItem(i, { emoji: v })} />
                  <Field label="عنوان" value={it.title} onChange={(v) => patchItem(i, { title: v })} />
                </div>
                <Field label="توضیح" value={it.desc} onChange={(v) => patchItem(i, { desc: v })} />
              </div>
            ))}
          </div>
        </div>
      </Section>

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
