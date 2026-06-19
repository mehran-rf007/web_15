// آپلود تصویر سایت در باکت عمومی site-assets (فقط مدیر)
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "site-assets";

// فقط تصویر مجاز است
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
const MAX_BYTES = 8 * 1024 * 1024; // ۸ مگابایت

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "دسترسی مدیر لازم است" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const slot = (form.get("slot") as string) || "asset";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل ارسال نشد" }, { status: 400 });
  }

  // اعتبارسنجی حجم
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۸ مگابایت باشد" }, { status: 413 });
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");

  // اعتبارسنجی نوع فایل (هم MIME و هم پسوند)
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "فقط فایل تصویر (PNG, JPG, WEBP, GIF, SVG) مجاز است" }, { status: 415 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeSlot = slot.replace(/[^a-z0-9-_]/gi, "").slice(0, 32) || "asset";
  const path = `${safeSlot}/${Date.now()}.${ext || "png"}`;

  const svc = createServiceSupabase();
  const { error } = await svc.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: file.type || "image/png", upsert: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path });
}
