// ثبت تیکت جدید توسط کاربر
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const CATEGORIES = ["general", "payment", "technical", "other"];

export async function POST(req: NextRequest) {
  const auth = createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "لاگین لازم است" }, { status: 401 });

  const { subject, category, body } = (await req.json()) as {
    subject?: string;
    category?: string;
    body?: string;
  };

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "عنوان و متن پیام الزامی است" }, { status: 400 });
  }

  const cat = CATEGORIES.includes(category ?? "") ? category : "general";
  const svc = createServiceSupabase();

  const { data: ticket, error } = await svc
    .from("tickets")
    .insert({
      user_id: user.id,
      subject: subject.trim().slice(0, 200),
      category: cat,
      status: "open",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: msgErr } = await svc.from("ticket_messages").insert({
    ticket_id: ticket.id,
    user_id: user.id,
    sender: "user",
    body: body.trim().slice(0, 4000),
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ id: ticket.id });
}
