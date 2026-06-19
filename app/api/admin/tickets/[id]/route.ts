// پاسخ مدیر به تیکت + تغییر وضعیت
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// ارسال پاسخ مدیر
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی مجاز نیست" }, { status: 403 });

  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "متن پاسخ خالی است" }, { status: 400 });

  const svc = createServiceSupabase();
  const { data: ticket } = await svc.from("tickets").select("id").eq("id", params.id).single();
  if (!ticket) return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });

  const { error } = await svc.from("ticket_messages").insert({
    ticket_id: params.id,
    user_id: admin.id,
    sender: "admin",
    body: body.trim().slice(0, 4000),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// تغییر وضعیت (بستن / بازگشایی)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "دسترسی مجاز نیست" }, { status: 403 });

  const { status } = (await req.json()) as { status?: string };
  if (!status || !["open", "answered", "closed"].includes(status)) {
    return NextResponse.json({ error: "وضعیت نامعتبر" }, { status: 400 });
  }

  const svc = createServiceSupabase();
  const { error } = await svc
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
