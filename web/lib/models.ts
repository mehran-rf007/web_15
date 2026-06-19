// گالری مدل‌های آماده — خواندن از جدول preset_models
import { createServiceSupabase } from "./supabaseServer";

export interface PresetModel {
  id: string;
  title: string;
  gender: "female" | "male" | "neutral" | null;
  hijab: boolean;
  thumbnailUrl: string;
  imagePath: string;
}

const BUCKET = "models";

export async function listPresetModels(): Promise<PresetModel[]> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("preset_models")
    .select("id, title, gender, hijab, thumbnail_path, image_path")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    gender: m.gender,
    hijab: m.hijab,
    thumbnailUrl: supabase.storage.from(BUCKET).getPublicUrl(
      m.thumbnail_path.replace(`${BUCKET}/`, ""),
    ).data.publicUrl,
    imagePath: m.image_path,
  }));
}

// دریافت بایت‌های عکس اصلی یک مدل آماده (برای ارسال به Worker)
export async function fetchPresetModelImage(
  modelId: string,
): Promise<{ base64: string; mimeType: string } | null> {
  const supabase = createServiceSupabase();
  const { data: row } = await supabase
    .from("preset_models")
    .select("image_path")
    .eq("id", modelId)
    .single();
  if (!row) return null;

  const path = row.image_path.replace(`${BUCKET}/`, "");
  const { data: file, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !file) return null;

  const buf = Buffer.from(await file.arrayBuffer());
  return { base64: buf.toString("base64"), mimeType: file.type || "image/jpeg" };
}
