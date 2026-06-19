"use client";

import { useEffect, useState } from "react";
import type { SiteContent, PaymentConfig, PaymentPackage } from "@/lib/siteSettings";

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
      <span className="mb-1 block text-sm font-bold text-ink-soft">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        />
      )}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink-soft">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}

export default function AdminPaymentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setContent(d.content))
      .catch(() => setMsg("خطا در بارگذاری"));
  }, []);

  function patch(p: Partial<PaymentConfig>) {
    setContent((c) => (c ? { ...c, payment: { ...c.payment, ...p } } : c));
  }
  function patchPkg(i: number, p: Partial<PaymentPackage>) {
    setContent((c) => {
      if (!c) return c;
      const packages = c.payment.packages.map((pk, idx) => (idx === i ? { ...pk, ...p } : pk));
      return { ...c, payment: { ...c.payment, packages } };
    });
  }
  function addPkg() {
    setContent((c) => {
      if (!c) return c;
      const packages = [
        ...c.payment.packages,
        { credits: 10, priceToman: 99000, label: "بسته‌ی جدید", badge: "", highlighted: false },
      ];
      return { ...c, payment: { ...c.payment, packages } };
    });
  }
  function removePkg(i: number) {
    setContent((c) => {
      if (!c) return c;
      const packages = c.payment.packages.filter((_, idx) => idx !== i);
      return { ...c, payment: { ...c.payment, packages } };
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
      setMsg("ذخیره شد ✅");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return <div className="text-ink-muted">{msg ?? "در حال بارگذاری…"}</div>;
  }

  const p = content.payment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">درگاه پرداخت و بسته‌های کردیت</h1>
          <p className="text-sm text-ink-muted">بسته‌های خرید کردیت و متن‌های صفحه‌ی پرداخت را اینجا ویرایش کنید.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gold-dark disabled:opacity-60"
        >
          {saving ? "در حال ذخیره…" : "ذخیره‌ی تغییرات"}
        </button>
      </div>

      {msg ? <div className="rounded-xl bg-clay/30 px-4 py-2 text-sm font-bold text-ink-soft">{msg}</div> : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ برای فعال‌شدن درگاه، مقدادیر <b>ZARINPAL_MERCHANT_ID</b> و (اختیاری) <b>ZARINPAL_SANDBOX</b> و <b>NEXT_PUBLIC_SITE_URL</b> را در تنظیمات محیطی (Render) تنظیم کنید.
      </div>

      {/* متن‌های صفحه */}
      <div className="card space-y-4 p-5">
        <h2 className="font-black">متن‌های صفحه‌ی خرید</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="عنوان" value={p.title} onChange={(v) => patch({ title: v })} />
          <Field label="نام درگاه (نمایشی)" value={p.gatewayName} onChange={(v) => patch({ gatewayName: v })} />
        </div>
        <Field label="زیرعنوان" value={p.subtitle} onChange={(v) => patch({ subtitle: v })} textarea />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="پیام پرداخت موفق" value={p.successNote} onChange={(v) => patch({ successNote: v })} textarea />
          <Field label="پیام پرداخت ناموفق" value={p.failNote} onChange={(v) => patch({ failNote: v })} textarea />
        </div>
      </div>

      {/* بسته‌ها */}
      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black">بسته‌های کردیت</h2>
          <button
            onClick={addPkg}
            className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm font-bold text-ink-soft hover:bg-clay/30"
          >
            + افزودن بسته
          </button>
        </div>

        <div className="space-y-4">
          {p.packages.map((pk, i) => (
            <div key={i} className="rounded-xl border border-ink/10 bg-sand/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-black text-ink-soft">بسته‌ی {i + 1}</span>
                <button
                  onClick={() => removePkg(i)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Field label="عنوان" value={pk.label} onChange={(v) => patchPkg(i, { label: v })} />
                <NumField label="تعداد کردیت" value={pk.credits} onChange={(v) => patchPkg(i, { credits: v })} />
                <NumField label="قیمت (تومان)" value={pk.priceToman} onChange={(v) => patchPkg(i, { priceToman: v })} />
                <Field label="برچسب (اختیاری)" value={pk.badge} onChange={(v) => patchPkg(i, { badge: v })} />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink-soft">
                <input
                  type="checkbox"
                  checked={pk.highlighted}
                  onChange={(e) => patchPkg(i, { highlighted: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                کارت ویژه (برجسته)
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
