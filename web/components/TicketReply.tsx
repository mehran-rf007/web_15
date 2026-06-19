"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketReply({
  ticketId,
  closed,
}: {
  ticketId: string;
  closed: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (closed) {
    return (
      <p className="rounded-xl bg-sand/60 p-3 text-center text-sm text-ink-muted">
        این تیکت بسته شده است. برای پیگیری جدید، تیکت تازه ثبت کنید.
      </p>
    );
  }

  async function send() {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "خطا در ارسال پیام");
      setBody("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "خطای غیرمنتظره");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="پاسخ شما…"
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-7 focus:border-gold focus:outline-none"
      />
      <button onClick={send} disabled={busy} className="btn-gold w-full justify-center py-2.5 disabled:opacity-50 sm:w-auto">
        {busy ? "در حال ارسال…" : "ارسال پاسخ"}
      </button>
    </div>
  );
}
