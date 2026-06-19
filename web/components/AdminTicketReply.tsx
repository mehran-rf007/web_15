"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTicketReply({
  ticketId,
  status,
}: {
  ticketId: string;
  status: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "خطا");
      setBody("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "خطای غیرمنتظره");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(next: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="پاسخ پشتیبانی…"
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-7 focus:border-gold focus:outline-none"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button onClick={send} disabled={busy} className="btn-gold justify-center py-2.5 disabled:opacity-50">
          {busy ? "در حال ارسال…" : "ارسال پاسخ"}
        </button>
        {status !== "closed" ? (
          <button onClick={() => setStatus("closed")} disabled={busy} className="btn-outline justify-center py-2.5">
            بستن تیکت
          </button>
        ) : (
          <button onClick={() => setStatus("open")} disabled={busy} className="btn-outline justify-center py-2.5">
            بازگشایی مجدد
          </button>
        )}
      </div>
    </div>
  );
}
