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

  const res = await fetch(`${process.env.WORKER_URL}/generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-timestamp": timestamp,
      "x-signature": signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Worker خطا داد (${res.status}): ${text}`);
  }
  return (await res.json()) as WorkerResponse;
}
