"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "نمای کلی", emoji: "📊" },
  { href: "/dashboard/notifications", label: "اعلان‌ها", emoji: "🔔" },
  { href: "/dashboard/tickets", label: "تیکت پشتیبانی", emoji: "🎟️" },
  { href: "/dashboard/plan", label: "پلن و اشتراک", emoji: "👑" },
  { href: "/buy", label: "خرید توکن", emoji: "💳" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-ink/5 bg-white/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active =
              t.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition " +
                  (active
                    ? "bg-gold text-white shadow-soft"
                    : "text-ink-soft hover:bg-clay/30")
                }
              >
                <span>{t.emoji}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
