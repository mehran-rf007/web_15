// مدیریت پست‌های بلاگ (سمت سرور)
import { createServiceSupabase } from "./supabaseServer";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const TABLE = "blog_posts";

// پست‌های منتشرشده (برای صفحه‌ی عمومی بلاگ)
export async function listPublishedPosts(): Promise<BlogPost[]> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from(TABLE)
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as BlogPost[]) ?? [];
}

// دریافت یک پست منتشرشده با اسلاگ
export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) return null;
  return (data as BlogPost) ?? null;
}

// همه‌ی پست‌ها (فقط برای مدیر)
export async function listAllPosts(): Promise<BlogPost[]> {
  const svc = createServiceSupabase();
  const { data, error } = await svc
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as BlogPost[]) ?? [];
}

// ساخت اسلاگ تمیز از عنوان (فارسی/انگلیسی)
export function slugify(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c]+/g, "-")          // فاصله و نیم‌فاصله → خط تیره
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "") // حذف کاراکترهای غیرمجاز
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `post-${Date.now()}`;
}

export interface UpsertPostInput {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover_path?: string | null;
  published?: boolean;
}

// درج یا ویرایش پست (مدیر)
export async function upsertPost(input: UpsertPostInput): Promise<BlogPost> {
  const svc = createServiceSupabase();
  const row = {
    ...(input.id ? { id: input.id } : {}),
    slug: slugify(input.slug || input.title),
    title: input.title,
    excerpt: input.excerpt ?? "",
    content: input.content ?? "",
    cover_path: input.cover_path ?? null,
    published: Boolean(input.published),
  };
  const { data, error } = await svc
    .from(TABLE)
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BlogPost;
}

// حذف پست (مدیر)
export async function deletePost(id: string): Promise<void> {
  const svc = createServiceSupabase();
  const { error } = await svc.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
