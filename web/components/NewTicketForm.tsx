"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "general", label: "عمومی" },
  { value: "payment", label: "پرداخت و کردیت" },
  { value: "technical", label: "فنی / خطا" },
  { value: "other", label: "سایر" },
];

export default function NewTicketForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!subject.trim() || !body.trim()) {
      setError("عنوان و متن پیام را پر کنید.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, category, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "خطا در ثبت تیکت");
      setSubject("");
      setBody("");
      setOpen(false);
      if (json.id) router.push(`/dashboard/tickets/${json.id}`);
      else router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "خطای غیرمنتظره");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-gold w-full justify-center py-3 sm:w-auto"
      >
        + ثبت تیکت جدید
      </button>
    );
  }

  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-bold text-ink">تیکت جدید</h2>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="موضوع تیکت"
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="توضیح کامل سوال یا مشکل…"
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-7 focus:border-gold focus:outline-none"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={submit} disabled={busy} className="btn-gold justify-center py-2.5 disabled:opacity-50">
          {busy ? "در حال ارسال…" : "ارسال تیکت"}
        </button>
        <button onClick={() => setOpen(false)} className="btn-outline justify-center py-2.5">
          انصراف
        </button>
      </div>
    </div>
  );
}
