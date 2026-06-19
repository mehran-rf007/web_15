// پاسخ کاربر در گفتگوی تیکت
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "لاگین لازم است" }, { status: 401 });

  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "متن پیام خالی است" }, { status: 400 });

  const svc = createServiceSupabase();

  // اطمینان از مالکیت تیکت
  const { data: ticket } = await svc
    .from("tickets")
    .select("id, user_id, status")
    .eq("id", params.id)
    .single();
  if (!ticket || ticket.user_id !== user.id) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }
  if (ticket.status === "closed") {
    return NextResponse.json({ error: "این تیکت بسته شده است" }, { status: 400 });
  }

  const { error } = await svc.from("ticket_messages").insert({
    ticket_id: params.id,
    user_id: user.id,
    sender: "user",
    body: body.trim().slice(0, 4000),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
