// کمک‌توابع سمت سرور برای مدیریت کردیت (روی توابع RPC دیتابیس)
import { createServiceSupabase } from "./supabaseServer";

export function creditCost(quality: "standard" | "pro"): number {
  return quality === "pro" ? 3 : 1;
}

export async function getBalance(userId: string): Promise<number> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("credit_wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data?.balance ?? 0;
}

// کسر اتمیک کردیت؛ اگر موجودی کافی نباشد false برمی‌گرداند
export async function deductCredits(
  userId: string,
  amount: number,
  reason = "generation",
  refId?: string,
): Promise<boolean> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_id: refId ?? null,
  });
  if (error) throw error;
  return data === true;
}

// بازگرداندن کردیت در صورت شکست تولید (refund)
export async function refundCredits(
  userId: string,
  amount: number,
  refId?: string,
): Promise<void> {
  const supabase = createServiceSupabase();
  const { error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: "refund",
    p_ref_id: refId ?? null,
  });
  if (error) throw error;
}

// شارژ کردیت پس از پرداخت موفق (purchase)
export async function addPurchasedCredits(
  userId: string,
  amount: number,
  refId?: string,
): Promise<void> {
  const supabase = createServiceSupabase();
  const { error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: "purchase",
    p_ref_id: refId ?? null,
  });
  if (error) throw error;
}
