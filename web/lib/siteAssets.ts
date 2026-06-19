// ساخت آدرس عمومی تصویر از باکت site-assets (قابل استفاده در کلاینت و سرور)
export function siteAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/site-assets/${path}`;
}
