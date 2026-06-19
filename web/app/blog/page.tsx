import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { listPublishedPosts } from "@/lib/blog";
import { siteAssetUrl } from "@/lib/siteAssets";
import { getSiteContent } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const brand = content.brandName;
  return {
    title: `بلاگ ${brand} | مقاله‌های عکاسی محصول و فروش اینستاگرامی`,
    description: `آموزش، ترفند و نکات عکاسی محصول، عکس ژورنالی و رشد فروش اینستاگرامی در بلاگ ${brand}.`,
    openGraph: {
      title: `بلاگ ${brand}`,
      description: `آموزش و ترفندهای عکاسی محصول و فروش اینستاگرامی`,
      type: "website",
    },
  };
}

function faDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="min-h-screen">
      <SiteHeader active="blog" />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black">بلاگ</h1>
          <p className="mt-3 text-ink-muted">
            آموزش، ترفند و ایده برای عکس محصول حرفه‌ای و رشد فروشتان
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-cream/40 py-16 text-center text-ink-muted">
            هنوز مطلبی منتشر نشده است.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = siteAssetUrl(post.cover_path);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:shadow-soft"
                >
                  <div className="aspect-video w-full overflow-hidden bg-sand">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={post.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-ink-muted">📝</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="mb-2 font-black leading-snug text-ink group-hover:text-gold-dark">{post.title}</h2>
                    <p className="line-clamp-3 flex-1 text-sm text-ink-muted">{post.excerpt}</p>
                    <span className="mt-4 text-xs text-ink-muted">{faDate(post.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
