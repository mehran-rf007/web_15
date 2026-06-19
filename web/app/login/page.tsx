"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg(
          "ثبت‌نام انجام شد. اگر تأیید ایمیل روشن است ایمیلت را چک کن؛ وگرنه الان وارد شو.",
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setMsg(err.message ?? "خطا رخ داد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">
        {mode === "signin" ? "ورود" : "ثبت‌نام"}
      </h1>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="رمز عبور (حداقل ۶ کاراکتر)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white disabled:opacity-40"
        >
          {busy ? "لطفاً صبر کن…" : mode === "signin" ? "ورود" : "ثبت‌نام"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-neutral-700">{msg}</p>}

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMsg(null);
        }}
        className="mt-6 text-sm text-neutral-500 underline"
      >
        {mode === "signin" ? "حساب نداری؟ ثبت‌نام کن" : "حساب داری؟ وارد شو"}
      </button>

      <div className="mt-8">
        <Link href="/" className="text-sm text-neutral-400 underline">
          → بازگشت به صفحه‌ی اصلی
        </Link>
      </div>
    </main>
  );
}
