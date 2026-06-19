import { createServiceSupabase } from "@/lib/supabaseServer";
import AdminNotifications, { type AdminNotification } from "@/components/AdminNotifications";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const svc = createServiceSupabase();
  const { data } = await svc
    .from("notifications")
    .select("id, title, body, kind, active, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">اعلان‌ها 🔔</h1>
      <p className="mb-6 text-sm text-ink-muted">اعلامیه برای همه‌ی کاربران منتشر کنید.</p>
      <AdminNotifications initial={(data ?? []) as AdminNotification[]} />
    </div>
  );
}
