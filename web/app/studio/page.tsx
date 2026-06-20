"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import UploadDropzone from "@/components/UploadDropzone";
import ModelGallery from "@/components/ModelGallery";
import StyleSelector from "@/components/StyleSelector";
import SiteHeader from "@/components/SiteHeader";

type Style = "studio" | "editorial" | "lifestyle";
type Quality = "standard" | "pro";
type Category = "bag" | "shoe" | "clothing" | "accessory" | "generic";
type ModelMode = "preset" | "custom";
type PickedImage = { base64: string; mimeType: string; dataUrl: string };

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "shoe", label: "کفش" },
  { value: "bag", label: "کیف" },
  { value: "clothing", label: "لباس" },
  { value: "accessory", label: "اکسسوری" },
  { value: "generic", label: "سایر" },
];

const NOTE_CHIPS = [
  "نور گرم و طلایی",
  "پس‌زمینه‌ی بژ روشن",
  "حس لاکچری و مینیمال",
  "سایه‌ی نرم استودیویی",
  "فضای بیرونی شهری",
  "رنگ بندی سرد و مدرن",
];

function fileToImage(file: File): Promise<PickedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type || "image/png", dataUrl });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImagePicker({
  label,
  hint,
  picked,
  onPick,
  onClear,
}: {
  label: string;
  hint?: string;
  picked: PickedImage | null;
  onPick: (img: PickedImage) => void;
  onClear: () => void;
}) {
  if (picked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-ink/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={picked.dataUrl} alt={label} className="h-44 w-full object-cover" />
        <button
          onClick={onClear}
          className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-xs text-white backdrop-blur"
        >
          ✕ حذف
        </button>
      </div>
    );
  }
  return (
    <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/20 bg-cream/40 text-center transition hover:border-gold">
      <span className="text-2xl">➕</span>
      <span className="mt-2 text-sm font-medium text-ink-soft">{label}</span>
      {hint && <span className="mt-1 px-4 text-xs text-ink-muted">{hint}</span>}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onPick(await fileToImage(f));
        }}
      />
    </label>
  );
}

export default function StudioPage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setAuthReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  const [productPath, setProductPath] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);

  const [modelMode, setModelMode] = useState<ModelMode>("preset");
  const [modelId, setModelId] = useState<string>();
  const [customModel, setCustomModel] = useState<PickedImage | null>(null);
  const [modelHijab, setModelHijab] = useState(false);

  const [background, setBackground] = useState<PickedImage | null>(null);

  const [style, setStyle] = useState<Style>("studio");
  const [quality, setQuality] = useState<Quality>("standard");
  const [category, setCategory] = useState<Category>("shoe");
  const [notes, setNotes] = useState("");

  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addChip(text: string) {
    setNotes((n) => (n.trim() ? `${n.trim()}، ${text}` : text));
  }

  async function generate() {
    if (!productPath) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productPath,
          category,
          style,
          quality,
          presetModelId: modelMode === "preset" ? modelId : undefined,
          modelImageBase64: modelMode === "custom" ? customModel?.base64 : undefined,
          modelMimeType: modelMode === "custom" ? customModel?.mimeType : undefined,
          modelHijab,
          backgroundImageBase64: background?.base64,
          backgroundMimeType: background?.mimeType,
          userNotes: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          [data.error, data.detail].filter(Boolean).join(" — ") || "خطا در تولید",
        );
      setResult(`data:image/png;base64,${data.imageBase64}`);
    } catch (e: any) {
      const isNetwork =
        e?.message === "Failed to fetch" || e?.name === "TypeError";
      setError(
        isNetwork
          ? "ارتباط با سرور قطع شد. پردازش (به‌خصوص نسخه‌ی پرو) ممکن است زمان‌بر باشد یا سرور در حال بیدار شدن باشد. چند لحظه صبر کن و دوباره تلاش کن."
          : e?.message || "خطا در تولید",
      );
    } finally {
      setBusy(false);
    }
  }

  const cost = quality === "pro" ? 3 : 1;

  return (
    <>
    <SiteHeader active="studio" />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* عنوان */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-ink">استودیوی ساخت عکس</h1>
        <p className="mt-1 text-sm text-ink-muted">
          عکس محصولت را به یک تصویر ژورنالی حرفه‌ای تبدیل کن.
        </p>
      </div>

      {authReady && !userEmail && (
        <p className="mb-6 rounded-xl bg-gold/10 p-3 text-sm text-ink-soft">
          برای ساخت عکس باید وارد شوی.{" "}
          <Link href="/login" className="font-semibold text-gold underline">ورود / ثبت‌نام</Link>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===== ستون چپ: ورودی‌ها ===== */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">۱</span>
              آپلود عکس محصول
            </h2>
            {productPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-cream/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productPreview} alt="محصول" className="mx-auto h-56 object-contain" />
                <button
                  onClick={() => {
                    setProductPath(null);
                    setProductPreview(null);
                  }}
                  className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-xs text-white backdrop-blur"
                >
                  ✕ تغییر تصویر
                </button>
              </div>
            ) : (
              <UploadDropzone
                onUploaded={({ productPath, previewBase64 }) => {
                  setProductPath(productPath);
                  setProductPreview(`data:image/png;base64,${previewBase64}`);
                }}
              />
            )}
            <p className="mt-2 text-xs text-ink-muted">پس‌زمینه‌ی عکس محصول خودکار حذف می‌شود.</p>
          </section>

          <section className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">۲</span>
              انتخاب مدل
            </h2>
            <div className="mb-4 inline-flex rounded-xl bg-sand p-1 text-sm">
              <button
                onClick={() => setModelMode("preset")}
                className={`rounded-lg px-4 py-1.5 transition ${modelMode === "preset" ? "bg-white font-semibold text-ink shadow-sm" : "text-ink-muted"}`}
              >
                مدل آماده
              </button>
              <button
                onClick={() => setModelMode("custom")}
                className={`rounded-lg px-4 py-1.5 transition ${modelMode === "custom" ? "bg-white font-semibold text-ink shadow-sm" : "text-ink-muted"}`}
              >
                مدل دلخواه خودم
              </button>
            </div>

            {modelMode === "preset" ? (
              <ModelGallery selectedId={modelId} onSelect={setModelId} />
            ) : (
              <div className="space-y-3">
                <ImagePicker
                  label="آپلود عکس مدل خودت"
                  hint="عکس واضح از مدل یا خودت؛ برند شخصی تو"
                  picked={customModel}
                  onPick={setCustomModel}
                  onClear={() => setCustomModel(null)}
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={modelHijab}
                    onChange={(e) => setModelHijab(e.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  مدل با حجاب / پوشش محجوب باشد
                </label>
              </div>
            )}
          </section>

          <section className="card p-6">
            <h2 className="mb-1 flex items-center gap-2 font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">۳</span>
              پس‌زمینه‌ی دلخواه
              <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-normal text-ink-muted">اختیاری</span>
            </h2>
            <p className="mb-3 text-xs text-ink-muted">اگر صحنه‌ی خاصی مد نظرت است آپلود کن؛ وگرنه هوش مصنوعی صحنه‌ی مناسب می‌سازد.</p>
            <ImagePicker
              label="آپلود پس‌زمینه"
              hint="مثلاً بافت مرمر، کافه، خیابان شهری"
              picked={background}
              onPick={setBackground}
              onClear={() => setBackground(null)}
            />
          </section>
        </div>

        {/* ===== ستون راست: توصیف + تنظیمات + خروجی ===== */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-1 flex items-center gap-2 font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">۴</span>
              توضیح و توصیف تصویر
            </h2>
            <p className="mb-3 text-xs text-ink-muted">هرچه دقیق‌تر بگویی، خروجی به خواسته‌ی تو نزدیک‌تر می‌شود.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: کیف روی میز چوبی کنار پنجره، نور طبیعی صبح، حس مینیمال و لاکچری"
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm leading-7 focus:border-gold focus:outline-none"
              rows={4}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {NOTE_CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => addChip(c)}
                  className="rounded-full border border-ink/15 bg-cream/60 px-3 py-1 text-xs text-ink-soft transition hover:border-gold hover:text-gold"
                >
                  + {c}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-3 font-bold text-ink">سبک، دسته و کیفیت</h2>
            <div className="space-y-4">
              <div>
                <span className="mb-1 block text-sm text-ink-muted">سبک عکاسی</span>
                <StyleSelector value={style} onChange={setStyle} />
              </div>
              <div>
                <span className="mb-1 block text-sm text-ink-muted">دسته‌ی محصول</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${category === c.value ? "bg-gold text-white shadow-sm" : "bg-sand text-ink-soft hover:bg-clay"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-sm text-ink-muted">کیفیت خروجی</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuality("standard")}
                    className={`rounded-xl border p-3 text-right transition ${quality === "standard" ? "border-gold bg-gold/5" : "border-ink/15 hover:border-clay"}`}
                  >
                    <span className="block text-sm font-semibold text-ink">درافت</span>
                    <span className="text-xs text-ink-muted">۱ کردیت · سریع</span>
                  </button>
                  <button
                    onClick={() => setQuality("pro")}
                    className={`rounded-xl border p-3 text-right transition ${quality === "pro" ? "border-gold bg-gold/5" : "border-ink/15 hover:border-clay"}`}
                  >
                    <span className="block text-sm font-semibold text-ink">HD نهایی</span>
                    <span className="text-xs text-ink-muted">۳ کردیت · بالاترین جزئیات</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!productPath || busy}
              className="btn-gold mt-5 w-full justify-center py-3 text-base disabled:opacity-40"
            >
              {busy ? "در حال ساخت…" : `✨ ساخت تصویر (${cost} کردیت)`}
            </button>
            {!productPath && (
              <p className="mt-2 text-center text-xs text-ink-muted">ابتدا عکس محصول را آپلود کن.</p>
            )}
            {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          </section>

          <section className="card p-6">
            <h2 className="mb-3 font-bold text-ink">خروجی</h2>
            {result ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result} alt="خروجی" className="w-full rounded-xl border border-ink/10" />
                <a href={result} download="jorino.png" className="btn-outline inline-flex w-full justify-center">
                  ⬇ دانلود تصویر
                </a>
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-ink/15 bg-cream/30 text-center text-sm text-ink-muted">
                <span className="text-3xl">🖼️</span>
                <span className="mt-2">تصویر ساخته‌شده اینجا نمایش داده می‌شود</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
    </>
  );
}
