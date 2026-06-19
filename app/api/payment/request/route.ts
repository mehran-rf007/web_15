// شروع پرداخت: ساخت رکورد payment + درخواست به زرین‌پال + بازگرداندن لینک درگاه
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { getSiteContent } from "@/lib/siteSettings";
import { requestPayment, isConfigured } from "@/lib/zarinpal";

export const runtime = "nodejs";

interface Body {
  packageIndex: number;
}

function siteUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  // fallback از هدرهای درخواست
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "برای خرید ابتدا وارد شوید" }, { status: 401 });

  if (!isConfigured()) {
    return NextResponse.json(
      { error: "درگاه پرداخت هنوز پیکربندی نشده است. (ZARINPAL_MERCHANT_ID)" },
      { status: 503 },
    );
  }

  const body = (await req.json()) as Body;
  const content = await getSiteContent();
  const pkg = content.payment.packages[body.packageIndex];
  if (!pkg) {
    return NextResponse.json({ error: "بسته‌ی انتخابی معتبر نیست" }, { status: 400 });
  }

  const supabase = createServiceSupabase();

  // ۱) ساخت رکورد پرداخت در حالت pending
  const { data: payment, error: insErr } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      credits: pkg.credits,
      amount_toman: pkg.priceToman,
      status: "pending",
      package_label: pkg.label,
    })
    .select("id")
    .single();
  if (insErr || !payment) {
    return NextResponse.json({ error: "خطا در ثبت پرداخت" }, { status: 500 });
  }

  // ۲) درخواست به زرین‌پال — callback شامل شناسه‌ی پرداخت
  const callbackUrl = `${siteUrl(req)}/api/payment/verify?pid=${payment.id}`;
  const result = await requestPayment({
    amountToman: pkg.priceToman,
    description: `خرید ${pkg.credits} کردیت — ${pkg.label} (${content.brandName})`,
    callbackUrl,
    email: user.email ?? undefined,
  });

  if (!result.ok || !result.authority || !result.startPayUrl) {
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return NextResponse.json({ error: result.error ?? "خطای درگاه" }, { status: 502 });
  }

  // ۳) ذخیره‌ی Authority
  await supabase.from("payments").update({ authority: result.authority }).eq("id", payment.id);

  return NextResponse.json({ url: result.startPayUrl });
}
