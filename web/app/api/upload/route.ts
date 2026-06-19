// آپلود عکس محصول + حذف پس‌زمینه + ذخیره در Storage
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { removeBackground } from "@/lib/backgroundRemoval";

export const runtime = "nodejs";

// فقط تصویر مجاز است
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024; // ۱۲ مگابایت

export async function POST(req: NextRequest) {
  // احراز هویت کاربر
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "لاگین لازم است" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل ارسال نشد" }, { status: 400 });
  }

  // اعتبارسنجی حجم و نوع فایل
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۱۲ مگابایت باشد" }, { status: 413 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "فقط فایل تصویر (PNG, JPG, WEBP) مجاز است" }, { status: 415 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // حذف/پاک‌سازی پس‌زمینه و استانداردسازی
  const processed = await removeBackground(inputBuffer);
  const outBuffer = Buffer.from(processed.base64, "base64");

  // ذخیره در باکت خصوصی کاربر
  const supabase = createServiceSupabase();
  const path = `${user.id}/products/${Date.now()}.png`;
  const { error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads")
    .upload(path, outBuffer, { contentType: "image/png", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    productPath: path,
    previewBase64: processed.base64,
    mimeType: processed.mimeType,
  });
}
