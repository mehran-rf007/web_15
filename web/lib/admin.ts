// بررسی دسترسی مدیر (سمت سرور)
import type { User } from "@supabase/supabase-js";
import { createServerSupabase, createServiceSupabase } from "./supabaseServer";

// اگر کاربرِ واردشده مدیر باشد، آبجکت user را برمی‌گرداند؛ وگرنه null.
export async function getAdminUser(): Promise<User | null> {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return null;

  try {
    const svc = createServiceSupabase();
    const { data } = await svc
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    return data?.is_admin ? user : null;
  } catch {
    return null;
  }
}
