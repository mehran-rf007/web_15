import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ژورینو | استودیوی عکس ژورنالی محصول",
  description:
    "ژورینو — عکس محصول حرفه‌ای با هوش مصنوعی، ویژه‌ی فروشنده‌های اینستاگرام",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
