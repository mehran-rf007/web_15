// خواندن/ذخیره‌ی محتوای سایت (ذخیره فقط برای مدیر)
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getSiteContent, saveSiteContent } from "@/lib/siteSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "دسترسی مدیر لازم است" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const content = await saveSiteContent(body.content ?? body);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "خطا در ذخیره" }, { status: 500 });
  }
}
