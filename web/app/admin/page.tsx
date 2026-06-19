"use client";

import { useEffect, useRef, useState } from "react";
import { siteAssetUrl } from "@/lib/siteAssets";
import type { SiteContent, GalleryItem } from "@/lib/siteSettings";

// دکمه‌ی آپلود تصویر که مسیر را برمی‌گرداند
function ImageUpload({
  value,
  slot,
  onChange,
  onClear,
  aspect = "4 / 5",
  transparent = false,
}: {
  value: string | null;
  slot: string;
  onChange: (path: string) => void;
  onClear?: () => void;
  aspect?: string;
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
      <div
        className={
          "relative w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 " +
          (transparent
            ? "bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:16px_16px]"
            : "bg-sand")
        }
        style={ { aspectRatio: aspect } }
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={"h-full w-full " + (transparent ? "object-contain" : "object-cover")} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-ink-muted">🖼️</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold text-ink-soft hover:bg-clay/30 disabled:opacity-50"
      >
        {busy ? "در حال آپلود…" : url ? "تغییر عکس" : "آپلود عکس"}
      </button>
      {url && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(""))}
          className="text-sm text-red-500 hover:underline"
        >
          حذف
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {desc && <p className="mt-1 mb-4 text-sm text-ink-muted">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setContent(d.content))
      .catch(() => setMsg("خطا در بارگذاری محتوا"));
  }, []);

  function patch(p: Partial<SiteContent>) {
    setContent((c) => (c ? { ...c, ...p } : c));
  }
  function patchHero(p: Partial<SiteContent["hero"]>) {
    setContent((c) => (c ? { ...c, hero: { ...c.hero, ...p } } : c));
  }
  function patchGallery(key: "models" | "styles", i: number, p: Partial<GalleryItem>) {
    setContent((c) => {
      if (!c) return c;
      const arr = [...c[key]];
      arr[i] = { ...arr[i], ...p };
      return { ...c, [key]: arr };
    });
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره");
      setContent(data.content);
      setMsg("✅ تغییرات ذخیره شد. صفحه‌ی اصلی را با Ctrl+Shift+R ببین.");
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return <div className="text-ink-muted">{msg ?? "در حال بارگذاری…"}</div>;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">کاستوم سایت</h1>
          <p className="mt-1 text-sm text-ink-muted">عکس‌ها و محتوای صفحه‌ی اصلی را اینجا تغییر بده.</p>
        </div>
      </div>

      {/* برند */}
      <Section title="برند و لوگو" desc="نام برند و لوگوی ترن��پرنت (PNG) که در هدر همه‌ی صفحات نمایش داده می‌شود. با کلیک روی آن، کاربر به صفحه‌ی خانه می‌رود.">
        <Field label="نام برند" value={content.brandName} onChange={(v) => patch({ brandName: v })} />
        <div className="mt-4">
          <span className="mb-2 block text-sm font-bold text-ink-soft">لوگوی سایت (ترنسپرنت)</span>
          <ImageUpload
            value={content.logoPath}
            slot="logo"
            aspect="5 / 2"
            transparent
            onChange={(path) => patch({ logoPath: path })}
            onClear={() => patch({ logoPath: null })}
          />
          <p className="mt-2 text-xs text-ink-muted">اگر لوگویی آپلود نکنید، نام برند به‌صورت متنی نمایش داده می‌شود.</p>
        </div>
      </Section>

      {/* هیرو + عکس اصلی */}
      <Section
        title="بخش اصلی (هیرو)"
        desc="عکس بزرگِ بالای صفحه را اینجا آپلود کن و ابعادش را مشخص کن. اگر خالی باشد، روی سایت یک کادر خالی نشان داده می‌شود."
      >
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-ink-soft">عکس هیرو</span>
            <ImageUpload
              value={content.hero.imagePath}
              slot="hero"
              aspect={`${content.hero.width} / ${content.hero.height}`}
              onChange={(p) => patchHero({ imagePath: p || null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-soft">عرض (پیکسل)</span>
              <input
                type="number"
                value={content.hero.width}
                onChange={(e) => patchHero({ width: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-soft">ارتفاع (پیکسل)</span>
              <input
                type="number"
                value={content.hero.height}
                onChange={(e) => patchHero({ height: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <Field label="برچسب بالا" value={content.hero.badge} onChange={(v) => patchHero({ badge: v })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="عنوان (بخش اول)" value={content.hero.title} onChange={(v) => patchHero({ title: v })} />
            <Field label="عنوان (بخش طلایی)" value={content.hero.titleHighlight} onChange={(v) => patchHero({ titleHighlight: v })} />
            <Field label="عنوان (بخش آخر)" value={content.hero.titleAfter} onChange={(v) => patchHero({ titleAfter: v })} />
          </div>
          <Field label="زیرعنوان" value={content.hero.subtitle} onChange={(v) => patchHero({ subtitle: v })} textarea />
          <div className="grid grid-cols-2 gap-4">
            <Field label="دکمه‌ی اصلی" value={content.hero.ctaPrimary} onChange={(v) => patchHero({ ctaPrimary: v })} />
            <Field label="دکمه‌ی دوم" value={content.hero.ctaSecondary} onChange={(v) => patchHero({ ctaSecondary: v })} />
          </div>
        </div>
      </Section>

      {/* آمار */}
      <Section title="آمار (نوار اعداد)">
        <div className="grid gap-4 sm:grid-cols-3">
          {content.stats.map((s, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-ink/10 p-3">
              <Field
                label="عدد"
                value={s.value}
                onChange={(v) => {
                  const arr = [...content.stats];
                  arr[i] = { ...arr[i], value: v };
                  patch({ stats: arr });
                }}
              />
              <Field
                label="برچسب"
                value={s.label}
                onChange={(v) => {
                  const arr = [...content.stats];
                  arr[i] = { ...arr[i], label: v };
                  patch({ stats: arr });
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* گالری مدل‌ها */}
      <Section title="گالری مدل‌ها" desc="برای هر مدل عکس و عنوان تعیین کن.">
        <div className="grid gap-4 sm:grid-cols-2">
          {content.models.map((m, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-ink/10 p-3">
              <Field label="عنوان" value={m.label} onChange={(v) => patchGallery("models", i, { label: v })} />
              <ImageUpload
                value={m.imagePath}
                slot={`model-${i}`}
                onChange={(p) => patchGallery("models", i, { imagePath: p || null })}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* گالری سبک‌ها */}
      <Section title="گالری سبک‌ها" desc="برای هر سبک عکس و عنوان تعیین کن.">
        <div className="grid gap-4 sm:grid-cols-2">
          {content.styles.map((m, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-ink/10 p-3">
              <Field label="عنوان" value={m.label} onChange={(v) => patchGallery("styles", i, { label: v })} />
              <ImageUpload
                value={m.imagePath}
                slot={`style-${i}`}
                aspect="1 / 1"
                onChange={(p) => patchGallery("styles", i, { imagePath: p || null })}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* قیمت کردیت (برای محاسبه‌ی درآمد) */}
      <Section title="تنظیمات درآمد">
        <label className="block max-w-xs">
          <span className="mb-1 block text-sm font-medium text-ink-soft">قیمت هر کردیت (تومان)</span>
          <input
            type="number"
            value={content.pricePerCreditToman}
            onChange={(e) => patch({ pricePerCreditToman: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-ink-muted">برای محاسبه‌ی درآمد تخمینی در بخش آنالیز.</span>
        </label>
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
