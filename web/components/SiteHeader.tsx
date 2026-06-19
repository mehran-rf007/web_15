"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { siteAssetUrl } from "@/lib/siteAssets";

type NavKey = "home" | "studio" | "pricing" | "blog" | "dashboard";

const NAV: { key: NavKey; label: string; href: string; authOnly?: boolean }[] = [
  { key: "home", label: "خانه", href: "/" },
  { key: "studio", label: "استودیو", href: "/studio" },
  { key: "pricing", label: "قیمت‌ها", href: "/pricing" },
  { key: "blog", label: "بلاگ", href: "/blog" },
  { key: "dashboard", label: "داشبورد", href: "/dashboard", authOnly: true },
];

export default function SiteHeader({ active }: { active?: NavKey }) {
  const router = useRouter();
  const [brandName, setBrandName] = useState("ژورینو");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.content) return;
        setBrandName(d.content.brandName ?? "ژورینو");
        setLogoPath(d.content.logoPath ?? null);
      })
      .catch(() => {});
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setLoggedIn(Boolean(data.user));
    });
    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const logoUrl = siteAssetUrl(logoPath);
  const visibleNav = NAV.filter((n) => !n.authOnly || loggedIn);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* لوگو / نام برند */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain sm:h-9" />
          ) : (
            <>
              <span className="text-2xl text-gold">✨</span>
              <span className="text-lg font-extrabold tracking-tight sm:text-xl">{brandName}</span>
            </>
          )}
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="hidden items-center gap-6 md:flex">
          {visibleNav.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={
                "text-sm font-bold transition " +
                (active === n.key ? "text-gold-dark" : "text-ink-soft hover:text-gold")
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* اقدامات دسکتاپ */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-ink/15 px-3 py-2 text-sm font-bold text-ink-soft transition hover:bg-clay/30"
              >
                داشبورد
              </Link>
              <button
                onClick={logout}
                className="rounded-xl bg-sand px-3 py-2 text-sm font-bold text-ink-soft transition hover:bg-clay"
              >
                خروج
              </button>
            </>
          ) : loggedIn === false ? (
            <>
              <Link href="/login" className="text-sm font-bold text-ink-soft hover:text-gold">
                ورود
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark"
              >
                ثبت‌نام رایگان
              </Link>
            </>
          ) : null}
        </div>

        {/* دکمه‌ی منوی موبایل */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="منو"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/15 text-ink-soft transition hover:bg-clay/30 md:hidden"
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* منوی کشویی موبایل */}
      {menuOpen && (
        <div className="border-t border-ink/5 bg-cream/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {visibleNav.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className={
                  "rounded-xl px-3 py-2.5 text-sm font-bold transition " +
                  (active === n.key
                    ? "bg-gold/10 text-gold-dark"
                    : "text-ink-soft hover:bg-clay/30")
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink/5 pt-3">
            {loggedIn ? (
              <button
                onClick={logout}
                className="rounded-xl bg-sand px-3 py-2.5 text-center text-sm font-bold text-ink-soft transition hover:bg-clay"
              >
                خروج از حساب
              </button>
            ) : loggedIn === false ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-ink/15 px-3 py-2.5 text-center text-sm font-bold text-ink-soft transition hover:bg-clay/30"
                >
                  ورود
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-gold px-4 py-2.5 text-center text-sm font-bold text-white shadow-soft transition hover:bg-gold-dark"
                >
                  ثبت‌نام رایگان
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
