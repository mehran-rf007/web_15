// مدیریت اعلان‌ها (ساخت / غیرفعال‌سازی / حذف) — فقط مدیر
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const KINDS = ["info", "success", "warning", "promo"];

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی مجاز نیست" }, { status: 403 });

  const { title, body, kind } = (await req.json()) as {
    title?: string;
    body?: string;
    kind?: string;
  };
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "عنوان و متن الزامی است" }, { status: 400 });
  }
  const k = KINDS.includes(kind ?? "") ? kind : "info";

  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from("notifications")
    .insert({ title: title.trim().slice(0, 200), body: body.trim().slice(0, 4000), kind: k })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی مجاز نیست" }, { status: 403 });

  const { id, active } = (await req.json()) as { id?: string; active?: boolean };
  if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });

  const svc = createServiceSupabase();
  const { error } = await svc.from("notifications").update({ active: Boolean(active) }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی مجاز نیست" }, { status: 403 });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });

  const svc = createServiceSupabase();
  const { error } = await svc.from("notifications").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
