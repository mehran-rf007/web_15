"use client";
import { useState } from "react";

interface Props {
  onUploaded: (result: { productPath: string; previewBase64: string }) => void;
}

export default function UploadDropzone({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در آپلود");
      onUploaded({ productPath: data.productPath, previewBase64: data.previewBase64 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-cream/40 p-8 text-center transition hover:border-gold">
      <label className="cursor-pointer">
        <span className="mb-2 block text-ink-muted">
          {loading ? "در حال پردازش و حذف پس‌زمینه…" : "عکس محصول را انتخاب کنید"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <span className="btn-gold inline-block text-sm">
          آپلود
        </span>
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
