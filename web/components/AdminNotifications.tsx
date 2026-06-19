"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  kind: string;
  active: boolean;
  created_at: string;
}

function fa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function faDate(iso: string): string {
  try {
    return fa(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)));
  } catch {
    return iso;
  }
}

const KINDS = [
  { value: "info", label: "اطلاع‌رسانی ℹ️" },
  { value: "success", label: "موفقیت ✅" },
  { value: "warning", label: "هشدار ⚠️" },
  { value: "promo", label: "پیشنهاد ویژه 🎁" },
];
const KIND_LABEL: Record<string, string> = {
  info: "ℹ️", success: "✅", warning: "⚠️", promo: "🎁",
};

export default function AdminNotifications({ initial }: { initial: AdminNotification[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("info");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!title.trim() || !body.trim()) {
      setError("عنوان و متن را پر کنید.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, body, kind }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "خطا");
      setTitle("");
      setBody("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "خطای غیرمنتظره");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("این اعلان حذف شود؟")) return;
    await fetch("/api/admin/notifications", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-5">
        <h2 className="font-bold text-ink">اعلان جدید</h2>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان اعلان"
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="متن اعلان…"
          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-7 focus:border-gold focus:outline-none"
        />
        <button onClick={create} disabled={busy} className="btn-gold w-full justify-center py-2.5 disabled:opacity-50 sm:w-auto">
          {busy ? "در حال ثبت…" : "انتشار اعلان"}
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-ink-soft">اعلان‌های منتشرشده</h2>
        {initial.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-muted">هنوز اعلانی ثبت نشده.</div>
        ) : (
          <ul className="space-y-2">
            {initial.map((n) => (
              <li key={n.id} className={"card p-4 " + (n.active ? "" : "opacity-60")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-ink">{KIND_LABEL[n.kind] ?? "ℹ️"} {n.title}</div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{n.body}</p>
                    <div className="mt-1 text-[11px] text-ink-muted">{faDate(n.created_at)} · {n.active ? "فعال" : "غیرفعال"}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => toggle(n.id, n.active)}
                      className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink-soft transition hover:bg-clay/30"
                    >
                      {n.active ? "غیرفعال" : "فعال"}
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
