"use client";

import { useState } from "react";
import type { PaymentPackage } from "@/lib/siteSettings";

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faMoney(n: number): string {
  return fa(n.toLocaleString("en-US"));
}

export default function BuyPackages({
  packages,
  gatewayName,
}: {
  packages: PaymentPackage[];
  gatewayName: string;
}) {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(index: number) {
    setError(null);
    setLoadingIdx(index);
    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIndex: index }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? "خطا در اتصال به درگاه پرداخت");
        setLoadingIdx(null);
        return;
      }
      // انتقال به درگاه
      window.location.href = json.url as string;
    } catch (e: any) {
      setError(e?.message ?? "خطای غیرمنتظره");
      setLoadingIdx(null);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((p, i) => {
          const perCredit = Math.round(p.priceToman / Math.max(1, p.credits));
          const busy = loadingIdx === i;
          return (
            <div
              key={i}
              className={
                "card relative flex flex-col p-6 text-center " +
                (p.highlighted ? "ring-2 ring-gold shadow-soft" : "")
              }
            >
              {p.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-1 text-xs font-bold text-cream">
                  {p.badge}
                </span>
              ) : null}

              <div className="mb-1 text-sm font-bold text-ink-soft">{p.label}</div>
              <div className="mb-1 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-ink">{fa(p.credits)}</span>
                <span className="text-sm text-ink-muted">کردیت</span>
              </div>
              <div className="mb-4 text-xs text-ink-muted">
                هر کردیت حدود {faMoney(perCredit)} تومان
              </div>

              <div className="mb-5 rounded-xl bg-sand/60 py-3">
                <div className="text-2xl font-black text-gold-dark">{faMoney(p.priceToman)}</div>
                <div className="text-xs text-ink-muted">تومان</div>
              </div>

              <button
                onClick={() => buy(i)}
                disabled={busy || loadingIdx !== null}
                className={
                  "mt-auto block w-full rounded-xl px-4 py-2.5 text-center text-sm font-bold transition disabled:opacity-60 " +
                  (p.highlighted
                    ? "bg-gold text-white hover:bg-gold-dark"
                    : "border border-ink/15 text-ink-soft hover:bg-clay/30")
                }
              >
                {busy ? "در حال انتقال به درگاه…" : "خرید و پرداخت"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-ink-muted">
        پرداخت امن از طریق درگاه {gatewayName}. پس از پرداخت موفق، کردیت‌ها بلافاصله به کیف پول شما اضافه می‌شود.
      </p>
    </div>
  );
}
