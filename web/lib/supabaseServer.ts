// کلاینت‌های Supabase برای سمت سرور
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// کلاینت متصل به سشن کاربر (برای خواندن هویت)
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: any }[]) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // در Server Component قابل تنظیم نیست؛ نادیده می‌گیریم
          }
        },
      },
    },
  );
}

// کلاینت با کلید service role — دور زدن RLS برای عملیات امن سرور
// فقط در API route‌ها استفاده شود، هرگز در کامپوننت کلاینت.
export function createServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
