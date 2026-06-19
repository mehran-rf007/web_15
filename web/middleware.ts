import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// تازه‌سازی سشن Supabase در هر درخواست؛
// بدون این، API routها کوکی سشن را نمی‌بینند و کاربر همیشه ناشناس است.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // حتماً باید صدا زده شود تا توکن تازه شود
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // همه مسیرها به جز فایل‌های استاتیک
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
