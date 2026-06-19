"use client";

import Link from "next/link";
import { useState } from "react";
import type { PricingPlan } from "@/lib/siteSettings";

export default function PricingPlans({
  plans,
  monthlyLabel,
  yearlyLabel,
}: {
  plans: PricingPlan[];
  monthlyLabel: string;
  yearlyLabel: string;
}) {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* سوئیچ ماهانه/سالانه */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1 shadow-soft">
          <button
            onClick={() => setYearly(false)}
            className={
              "rounded-full px-5 py-2 text-sm font-bold transition " +
              (!yearly ? "bg-gold text-white" : "text-ink-soft hover:text-gold-dark")
            }
          >
            {monthlyLabel}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={
              "rounded-full px-5 py-2 text-sm font-bold transition " +
              (yearly ? "bg-gold text-white" : "text-ink-soft hover:text-gold-dark")
            }
          >
            {yearlyLabel}
          </button>
        </div>
      </div>

      {/* کارت‌های پلن */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p, i) => {
          const price = yearly ? p.priceYearly : p.priceMonthly;
          const isNumeric = /[۰-۹0-9]/.test(price);
          return (
            <div
              key={i}
              className={
                "card relative flex flex-col p-6 " +
                (p.highlighted ? "ring-2 ring-gold shadow-soft" : "")
              }
            >
              {p.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-1 text-xs font-bold text-cream">
                  {p.badge}
                </span>
              ) : null}

              <div className="mb-4 text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-xl">{p.emoji}</span>
                  <h3 className="text-xl font-black">{p.name}</h3>
                </div>
                <p className="text-sm text-ink-muted">{p.desc}</p>
              </div>

              <div className="mb-5 text-center">
                <div className="text-3xl font-black text-ink">{price}</div>
                {isNumeric && p.unit ? (
                  <div className="mt-1 text-xs text-ink-muted">{p.unit}</div>
                ) : null}
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center justify-center gap-2 text-center text-sm text-ink-soft">
                    <span className="text-gold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={
                  "block rounded-xl px-4 py-2.5 text-center text-sm font-bold transition " +
                  (p.highlighted
                    ? "bg-gold text-white hover:bg-gold-dark"
                    : "border border-ink/15 text-ink-soft hover:bg-clay/30")
                }
              >
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
