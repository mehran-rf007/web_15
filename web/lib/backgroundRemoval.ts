// حذف / پاک‌سازی پس‌زمینه عکس محصول (سمت سرور با sharp).
//
// یادداشت: حذف سوژه‌ی دقیق (جداسازی پیش‌زمینه) نیاز به مدل segmentation دارد.
// در فاز ۱ دو مسیر داریم:
//   1) normalizeImage: استانداردسازی/ریسایز/trim با sharp (همیشه فعال)
//   2) removeBackgroundExternal: اتصال اختیاری به سرویس حذف پس‌زمینه
//      (مثلاً یک endpoint روی همان Worker خارج از ایران).
import sharp from "sharp";

export interface ProcessedImage {
  base64: string;
  mimeType: string;
}

// استانداردسازی: trim حاشیه، محدودکردن ابعاد، خروجی PNG شفاف
export async function normalizeImage(input: Buffer): Promise<ProcessedImage> {
  const out = await sharp(input)
    .trim({ threshold: 10 })
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return { base64: out.toString("base64"), mimeType: "image/png" };
}

// حذف پس‌زمینه با سرویس خارجی (اختیاری). اگر تنظیم نشده باشد،
// همان تصویر استانداردشده برمی‌گردد (مدل تصویر هنگام ترکیب،
// به لطف پرامپت «قفل محصول»، پس‌زمینه را جایگزین می‌کند).
export async function removeBackground(input: Buffer): Promise<ProcessedImage> {
  const normalized = await normalizeImage(input);

  const endpoint = process.env.BG_REMOVAL_URL;
  const key = process.env.BG_REMOVAL_KEY;
  if (!endpoint) {
    return normalized; // بدون سرویس خارجی: فقط استانداردسازی
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(key ? { authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({ imageBase64: normalized.base64 }),
    });
    if (!res.ok) return normalized;
    const data = (await res.json()) as { imageBase64?: string };
    if (data.imageBase64) return { base64: data.imageBase64, mimeType: "image/png" };
    return normalized;
  } catch {
    return normalized; // در صورت خطا، fallback به تصویر استانداردشده
  }
}
