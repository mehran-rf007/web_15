import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "کاستوم سایت", emoji: "🎨" },
  { href: "/admin/dashboard", label: "داشبورد کاربری", emoji: "📋" },
  { href: "/admin/pricing", label: "قیمت‌گذاری", emoji: "💳" },
  { href: "/admin/payment", label: "درگاه و بسته‌ها", emoji: "🛒" },
  { href: "/admin/tickets", label: "تیکت‌ها", emoji: "🎟️" },
  { href: "/admin/notifications", label: "اعلان‌ها", emoji: "🔔" },
  { href: "/admin/blog", label: "بلاگ", emoji: "✍️" },
  { href: "/admin/analytics", label: "درآمد و آنالیز", emoji: "📊" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-gold text-2xl">✨</span>
            <span className="text-xl font-extrabold">پنل مدیریت ژورینو</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-ink-muted hover:text-gold">
              → مشاهده‌ی سایت
            </Link>
            <span className="hidden text-sm text-ink-muted sm:block">{admin.email}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row">
        <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto pb-1 md:w-56 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-bold text-ink-soft transition hover:bg-white hover:text-gold-dark"
            >
              <span>{n.emoji}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
