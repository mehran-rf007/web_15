/** @type {import('next').NextConfig} */

// هدرهای امنیتی که روی همه‌ی صفحات اعمال می‌شوند
const securityHeaders = [
  // جلوگیری از نمایش سایت در iframe (ضد clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // جلوگیری از حدس نوع فایل (MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // کنترل ارسال referrer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // محدودیت دسترسی به سخت‌افزارها
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // اجبار HTTPS در مرورگر (HSTS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // محافظت XSS در مرورگرهای قدیمی
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
  reactStrictMode: true,
  // sharp در سرور برای پردازش تصویر استفاده می‌شود
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  // تا خطاهای سبک‌ی ESLint دیپلوی را متوقف نکنند (خطاهای واقعی TypeScript همچنان بررسی می‌شوند)
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
