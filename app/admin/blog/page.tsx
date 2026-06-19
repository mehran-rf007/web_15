"use client";

import { useEffect, useRef, useState } from "react";
import { siteAssetUrl } from "@/lib/siteAssets";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

type Draft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_path: string | null;
  published: boolean;
};

const EMPTY: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_path: null,
  published: false,
};

function CoverUpload({ value, onChange }: { value: string | null; onChange: (p: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = siteAssetUrl(value);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", "blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در آپلود");
      onChange(data.path);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-ink-muted">🖼️</span>
        )}
      </div>
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-bold text-ink-soft hover:bg-clay/30 disabled:opacity-50">
        {busy ? "در حال آپلود…" : url ? "تغییر کاور" : "آپلود کاور"}
      </button>
      {url ? (
        <button type="button" onClick={() => onChange(null)} className="text-sm text-red-500 hover:underline">حذف</button>
      ) : null}
      <input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در بارگذاری");
      setPosts(data.posts ?? []);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function patch(p: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setMsg("عنوان الزامی است");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره");
      setDraft(null);
      setMsg("ذخیره شد ✅");
      load();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("این پست حذف شود؟")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در حذف");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  // حالت ویرایش/ایجاد
  if (draft) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">{draft.id ? "ویرایش پست" : "پست جدید"}</h1>
          <div className="flex gap-2">
            <button onClick={() => setDraft(null)} className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink-soft hover:bg-clay/30">انصراف</button>
            <button onClick={save} disabled={saving} className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-white hover:bg-gold-dark disabled:opacity-60">
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </button>
          </div>
        </div>
        {msg ? <div className="rounded-xl bg-clay/30 px-4 py-2 text-sm font-bold text-ink-soft">{msg}</div> : null}

        <div className="card space-y-4 p-5">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">عنوان</span>
            <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">اسلاگ (آدرس صفحه) — خالی = خودکار از عنوان</span>
            <input value={draft.slug} onChange={(e) => patch({ slug: e.target.value })} placeholder="مثلاً product-photo-tips" className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" dir="ltr" />
          </label>
          <div>
            <span className="mb-1 block text-sm font-bold text-ink-soft">عکس کاور</span>
            <CoverUpload value={draft.cover_path} onChange={(p) => patch({ cover_path: p })} />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">خلاصه (برای سئو و پیش‌نمایش)</span>
            <textarea value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} rows={2} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">متن کامل</span>
            <textarea value={draft.content} onChange={(e) => patch({ content: e.target.value })} rows={14} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm leading-7 outline-none focus:border-gold" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
            <input type="checkbox" checked={draft.published} onChange={(e) => patch({ published: e.target.checked })} className="h-4 w-4 accent-gold" />
            منتشر شود (برای عموم قابل مشاهده باشد)
          </label>
        </div>
      </div>
    );
  }

  // لیست
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">بلاگ</h1>
          <p className="text-sm text-ink-muted">مقاله‌ها را برای سئو و جذب مخاطب مدیریت کنید.</p>
        </div>
        <button onClick={() => setDraft({ ...EMPTY })} className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-white hover:bg-gold-dark">+ پست جدید</button>
      </div>
      {msg ? <div className="rounded-xl bg-clay/30 px-4 py-2 text-sm font-bold text-ink-soft">{msg}</div> : null}

      {loading ? (
        <div className="text-ink-muted">در حال بارگذاری…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-cream/40 py-12 text-center text-ink-muted">هنوز پستی ندارید.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold text-ink">{post.title}</span>
                  {post.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">منتشرشده</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">پیش‌نویس</span>
                  )}
                </div>
                <div className="mt-1 truncate text-xs text-ink-muted" dir="ltr">/blog/{post.slug}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setDraft({ id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, content: post.content, cover_path: post.cover_path, published: post.published })} className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm font-bold text-ink-soft hover:bg-clay/30">ویرایش</button>
                <button onClick={() => remove(post.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-500 hover:bg-red-50">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
