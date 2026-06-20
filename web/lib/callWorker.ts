// فراخوانی امن Worker خارج از ایران با امضای HMAC.
// کلید گوگل/واسط فقط روی Worker است؛ این تابع فقط روی سرور اجرا می‌شود.
import crypto from "node:crypto";

export interface WorkerRequest {
  productImageBase64: string;
  productMimeType: string;
  modelImageBase64?: string;
  modelMimeType?: string;
  backgroundImageBase64?: string;
  backgroundMimeType?: string;
  style: "studio" | "editorial" | "lifestyle";
  quality: "standard" | "pro";
  promptOverride?: string; // پرامپت ساخته‌شده توسط موتور پرامپت پیشرفته
  userNotes?: string;
}

export interface WorkerResponse {
  images: { imageBase64: string; mimeType: string }[];
  provider: string;
  model: string;
}

export async function callWorker(payload: WorkerRequest): Promise<WorkerResponse> {
  const body = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", process.env.WORKER_SHARED_SECRET!)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  // تایم‌اوت مشخص تا در صورت کند بودن Worker، به‌جای آویزان ماندن، خطای خوانا بدهد.
  const controller = new AbortController();
  const timeoutMs = Number(process.env.WORKER_TIMEOUT_MS ?? 170000);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${process.env.WORKER_URL}/generate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-timestamp": timestamp,
        "x-signature": signature,
      },
      body,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        `زمان پاسخ‌گویی Worker بیش از ${Math.round(timeoutMs / 1000)} ثانیه شد (تایم‌اوت). نسخه‌ی پرو زمان‌برتر است؛ دوباره تلاش کن یا پلن Worker را ارتقا بده.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Worker خطا داد (${res.status}): ${text}`);
  }
  return (await res.json()) as WorkerResponse;
}
