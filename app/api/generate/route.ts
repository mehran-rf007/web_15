// مسیر تولید تصویر: کسر کردیت → ساخت پرامپت → فراخوانی Worker → ذخیره
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";
import { callWorker } from "@/lib/callWorker";
import { buildPrompt, type Style, type Quality, type ProductCategory } from "@/lib/promptEngine";
import { creditCost, deductCredits, refundCredits } from "@/lib/credits";
import { fetchPresetModelImage } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  productPath: string;
  category: ProductCategory;
  style: Style;
  quality: Quality;
  presetModelId?: string;     // مدل آماده از گالری
  modelImageBase64?: string;  // یا مدل دلخواه آپلودی
  modelMimeType?: string;
  modelHijab?: boolean;
  backgroundImageBase64?: string;  // پس‌زمینه‌ی دلخواه آپلودی
  backgroundMimeType?: string;
  userNotes?: string;
}

export async function POST(req: NextRequest) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "لاگین لازم است" }, { status: 401 });

  const body = (await req.json()) as Body;
  const supabase = createServiceSupabase();
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

  // ۱) دریافت عکس محصول از Storage
  const { data: productFile, error: dlErr } = await supabase.storage
    .from(bucket)
    .download(body.productPath);
  if (dlErr || !productFile) {
    return NextResponse.json({ error: "عکس محصول یافت نشد" }, { status: 400 });
  }
  const productBase64 = Buffer.from(await productFile.arrayBuffer()).toString("base64");

  // ۲) تعیین مدل (آماده یا دلخواه)
  let modelImageBase64 = body.modelImageBase64;
  let modelMimeType = body.modelMimeType;
  if (!modelImageBase64 && body.presetModelId) {
    const preset = await fetchPresetModelImage(body.presetModelId);
    if (preset) {
      modelImageBase64 = preset.base64;
      modelMimeType = preset.mimeType;
    }
  }

  // ۳) ساخت پرامپت با موتور پیشرفته
  const prompt = buildPrompt({
    category: body.category,
    style: body.style,
    hasModel: Boolean(modelImageBase64),
    modelHijab: body.modelHijab,
    hasBackground: Boolean(body.backgroundImageBase64),
    userNotes: body.userNotes,
    quality: body.quality,
  });

  // ۴) ثبت رکورد تصویر (pending)
  const { data: imageRow, error: insErr } = await supabase
    .from("images")
    .insert({
      user_id: user.id,
      product_path: body.productPath,
      model_ref: body.presetModelId ?? "custom",
      style: body.style,
      quality: body.quality,
      prompt,
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  const imageId = imageRow.id as string;

  // ۵) کسر اتمیک کردیت
  const cost = creditCost(body.quality);
  const ok = await deductCredits(user.id, cost, "generation", imageId);
  if (!ok) {
    await supabase.from("images").update({ status: "failed" }).eq("id", imageId);
    return NextResponse.json({ error: "کردیت کافی نیست" }, { status: 402 });
  }

  // ۶) فراخوانی Worker + در صورت خطا بازگرداندن کردیت
  const startedAt = Date.now();
  try {
    const result = await callWorker({
      productImageBase64: productBase64,
      productMimeType: "image/png",
      modelImageBase64,
      modelMimeType,
      backgroundImageBase64: body.backgroundImageBase64,
      backgroundMimeType: body.backgroundMimeType,
      style: body.style,
      quality: body.quality,
      promptOverride: prompt,
    });

    // ذخیره‌ی خروجی
    const outBuffer = Buffer.from(result.images[0].imageBase64, "base64");
    const outPath = `${user.id}/outputs/${imageId}.png`;
    await supabase.storage.from(bucket).upload(outPath, outBuffer, {
      contentType: "image/png",
      upsert: true,
    });

    await supabase
      .from("images")
      .update({ output_path: outPath, status: "done", provider: result.provider })
      .eq("id", imageId);

    await supabase.from("generation_logs").insert({
      image_id: imageId,
      user_id: user.id,
      provider: result.provider,
      model: result.model,
      latency_ms: Date.now() - startedAt,
      success: true,
    });

    return NextResponse.json({
      imageId,
      imageBase64: result.images[0].imageBase64,
      provider: result.provider,
    });
  } catch (err: any) {
    await refundCredits(user.id, cost, imageId);
    await supabase.from("images").update({ status: "failed" }).eq("id", imageId);
    await supabase.from("generation_logs").insert({
      image_id: imageId,
      user_id: user.id,
      success: false,
      error: err.message,
      latency_ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      {
        error: "تولید ناموفق بود؛ کردیت بازگردانده شد",
        detail: err?.message ?? String(err),
      },
      { status: 502 },
    );
  }
}
