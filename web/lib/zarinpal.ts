// ادغام با درگاه پرداخت زرین‌پال (Zarinpal)
// از حالت سندباکس برای تست و حالت واقعی برای پروداکشن پشتیبانی می‌کند.
// مستندات: https://docs.zarinpal.com

const SANDBOX = process.env.ZARINPAL_SANDBOX === "true";
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? "";

// در حالت سندباکس از دامنه‌ی sandbox استفاده می‌شود.
const BASE = SANDBOX
  ? "https://sandbox.zarinpal.com"
  : "https://payment.zarinpal.com";

export interface RequestPaymentArgs {
  amountToman: number;   // مبلغ به تومان
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}

export interface RequestPaymentResult {
  ok: boolean;
  authority?: string;
  startPayUrl?: string;
  error?: string;
}

// زرین‌پال مبلغ را به ریال می‌گیرد (۱ تومان = ۱۰ ریال)
function toRial(toman: number): number {
  return Math.round(toman) * 10;
}

export function isConfigured(): boolean {
  return MERCHANT_ID.length > 0;
}

export function gatewayMode(): "sandbox" | "production" {
  return SANDBOX ? "sandbox" : "production";
}

export async function requestPayment(
  args: RequestPaymentArgs,
): Promise<RequestPaymentResult> {
  if (!MERCHANT_ID) {
    return { ok: false, error: "درگاه پرداخت پیکربندی نشده است (ZARINPAL_MERCHANT_ID خالی است)." };
  }
  try {
    const res = await fetch(`${BASE}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: toRial(args.amountToman),
        description: args.description,
        callback_url: args.callbackUrl,
        metadata: {
          email: args.email ?? undefined,
          mobile: args.mobile ?? undefined,
        },
      }),
    });
    const json: any = await res.json();
    const authority: string | undefined = json?.data?.authority;
    const code: number | undefined = json?.data?.code;
    if (code === 100 && authority) {
      return {
        ok: true,
        authority,
        startPayUrl: `${BASE}/pg/StartPay/${authority}`,
      };
    }
    const errMsg =
      json?.errors?.message ??
      (Array.isArray(json?.errors) ? json.errors[0]?.message : undefined) ??
      `خطای درگاه (code=${code ?? "?"})`;
    return { ok: false, error: String(errMsg) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "خطا در ارتباط با درگاه" };
  }
}

export interface VerifyPaymentResult {
  ok: boolean;
  refId?: string;
  alreadyVerified?: boolean;
  error?: string;
}

export async function verifyPayment(
  authority: string,
  amountToman: number,
): Promise<VerifyPaymentResult> {
  if (!MERCHANT_ID) {
    return { ok: false, error: "درگاه پرداخت پیکربندی نشده است." };
  }
  try {
    const res = await fetch(`${BASE}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: toRial(amountToman),
        authority,
      }),
    });
    const json: any = await res.json();
    const code: number | undefined = json?.data?.code;
    const refId = json?.data?.ref_id;
    // 100 = موفق، 101 = قبلاً تأیید شده
    if (code === 100) {
      return { ok: true, refId: refId ? String(refId) : undefined };
    }
    if (code === 101) {
      return { ok: true, refId: refId ? String(refId) : undefined, alreadyVerified: true };
    }
    const errMsg =
      json?.errors?.message ??
      (Array.isArray(json?.errors) ? json.errors[0]?.message : undefined) ??
      `تأیید ناموفق (code=${code ?? "?"})`;
    return { ok: false, error: String(errMsg) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "خطا در تأیید پرداخت" };
  }
}
