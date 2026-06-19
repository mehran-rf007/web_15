// آمار درآمد/آنالیز و موجودی API (سمت سرور)
import { createServiceSupabase } from "./supabaseServer";

export interface AdminStats {
  users: number;
  images: number;
  generations_total: number;
  generations_success: number;
  credits_purchased: number;
  credits_consumed: number;
  credits_outstanding: number;
}

export interface RecentLog {
  created_at: string;
  provider: string | null;
  model: string | null;
  success: boolean;
}

export async function getAnalytics(): Promise<{ stats: AdminStats; recent: RecentLog[] }> {
  const svc = createServiceSupabase();
  const empty: AdminStats = {
    users: 0,
    images: 0,
    generations_total: 0,
    generations_success: 0,
    credits_purchased: 0,
    credits_consumed: 0,
    credits_outstanding: 0,
  };
  try {
    const { data: agg } = await svc.rpc("admin_stats");
    const { data: recent } = await svc
      .from("generation_logs")
      .select("created_at, provider, model, success")
      .order("created_at", { ascending: false })
      .limit(10);
    return {
      stats: { ...empty, ...(agg ?? {}) },
      recent: (recent ?? []) as RecentLog[],
    };
  } catch {
    return { stats: empty, recent: [] };
  }
}

export interface ApiBalance {
  configured: boolean;
  totalCredits?: number;
  totalUsage?: number;
  balance?: number;
  error?: string;
}

// موجودی شارژ OpenRouter (دلار) — از کلید OPENROUTER_API_KEY یا WRAPPER_API_KEY
export async function getApiBalance(): Promise<ApiBalance> {
  const key = process.env.OPENROUTER_API_KEY || process.env.WRAPPER_API_KEY;
  if (!key) return { configured: false };
  try {
    const r = await fetch("https://openrouter.ai/api/v1/credits", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!r.ok) return { configured: true, error: `HTTP ${r.status}` };
    const j: any = await r.json();
    const totalCredits = Number(j?.data?.total_credits ?? 0);
    const totalUsage = Number(j?.data?.total_usage ?? 0);
    return {
      configured: true,
      totalCredits,
      totalUsage,
      balance: totalCredits - totalUsage,
    };
  } catch (e: any) {
    return { configured: true, error: e?.message ?? "خطا در دریافت موجودی" };
  }
}
