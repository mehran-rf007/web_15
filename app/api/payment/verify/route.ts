// بازگشت از درگاه: تأیید پرداخت و شارژ کیف پول
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";
import { verifyPayment } from "@/lib/zarinpal";
import { addPurchasedCredits } from "@/lib/credits";

export const runtime = "nodejs";

function siteUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

function redirectTo(req: NextRequest, status: "success" | "failed", extra?: Record<string, string>) {
  const params = new URLSearchParams({ payment: status, ...(extra ?? {}) });
  return NextResponse.redirect(`${siteUrl(req)}/buy?${params.toString()}`);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("pid");
  const authority = searchParams.get("Authority");
  const zStatus = searchParams.get("Status"); // OK | NOK

  if (!pid) return redirectTo(req, "failed");

  const supabase = createServiceSupabase();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, user_id, credits, amount_toman, status")
    .eq("id", pid)
    .single();

  if (!payment) return redirectTo(req, "failed");

  // اگر قبلاً پرداخت شده (جلوگیری از شارژ دوباره)
  if (payment.status === "paid") {
    return redirectTo(req, "success", { credits: String(payment.credits) });
  }

  // کاربر پرداخت را لغو کرده
  if (zStatus !== "OK" || !authority) {
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return redirectTo(req, "failed");
  }

  // تأیید با زرین‌پال
  const result = await verifyPayment(authority, payment.amount_toman);
  if (!result.ok) {
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return redirectTo(req, "failed");
  }

  // شارژ کیف پول — فقط اگر هنوز paid نشده (اتمیک با شرط status)
  const { data: updated } = await supabase
    .from("payments")
    .update({ status: "paid", ref_id: result.refId ?? null, paid_at: new Date().toISOString() })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id")
    .single();

  // اگر این درخواست وضعیت را به paid تغییر داد، کردیت را شارژ کن (جلوگیری از دوباره‌کاری)
  if (updated) {
    try {
      await addPurchasedCredits(payment.user_id, payment.credits, payment.id);
    } catch {
      // اگر شارژ شکست خورد، پرداخت را برای پیگیری دستی علامت می‌زنیم
      await supabase.from("payments").update({ status: "paid" }).eq("id", payment.id);
    }
  }

  return redirectTo(req, "success", { credits: String(payment.credits) });
}
