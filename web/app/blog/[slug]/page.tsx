import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getPublishedPostBySlug } from "@/lib/blog";
import { siteAssetUrl } from "@/lib/siteAssets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return { title: "مطلب پیدا نشد" };
  const cover = siteAssetUrl(post.cover_path) ?? undefined;
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      images: cover ? [{ url: cover }] : undefined,
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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) notFound();
  const cover = siteAssetUrl(post.cover_path);

  // JSON-LD برای سئو
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    image: cover ?? undefined,
  };

  return (
    <div className="min-h-screen">
      <SiteHeader active="blog" />
      <article className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-6 text-sm text-ink-muted">
          <Link href="/blog" className="hover:text-gold-dark">‹ بازگشت به بلاگ</Link>
        </nav>
        <h1 className="text-3xl font-black leading-tight md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">{faDate(post.created_at)}</p>
        {cover ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={post.title} className="w-full object-cover" />
          </div>
        ) : null}
        {post.excerpt ? (
          <p className="mt-6 text-lg font-medium text-ink-soft">{post.excerpt}</p>
        ) : null}
        <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-ink">{post.content}</div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ { __html: JSON.stringify(jsonLd) } }
      />
    </div>
  );
}
