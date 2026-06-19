// مدیریت پست‌های بلاگ (فقط مدیر)
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { listAllPosts, upsertPost, deletePost } from "@/lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// لیست همه‌ی پست‌ها (منتشرشده و پیش‌نویس)
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "دسترسی مدیر لازم است" }, { status: 403 });
  }
  const posts = await listAllPosts();
  return NextResponse.json({ posts });
}

// درج یا ویرایش پست
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "دسترسی مدیر لازم است" }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body?.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
    }
    const post = await upsertPost({
      id: body.id,
      slug: body.slug ?? "",
      title: body.title,
      excerpt: body.excerpt ?? "",
      content: body.content ?? "",
      cover_path: body.cover_path ?? null,
      published: Boolean(body.published),
    });
    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "خطا در ذخیره" }, { status: 500 });
  }
}

// حذف پست
export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "دسترسی مدیر لازم است" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
    }
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "خطا در حذف" }, { status: 500 });
  }
}
