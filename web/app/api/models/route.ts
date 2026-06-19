// لیست مدل‌های آماده‌ی گالری
import { NextResponse } from "next/server";
import { listPresetModels } from "@/lib/models";

export const runtime = "nodejs";

export async function GET() {
  try {
    const models = await listPresetModels();
    return NextResponse.json({ models });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
