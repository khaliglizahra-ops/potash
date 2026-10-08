import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Potash | Laboratuvar Teknolojisinde Yeni Nesil Çözümler", template: "%s | Potash" },
  description:
    "Yerli üretim laboratuvar cihazları: inkübatör, etüv, çeker ocak, güvenlik kabini, su banyosu ve daha fazlası. 360° 3D ürün inceleme, teknik uzmanlık ve satış sonrası destek.",
  openGraph: { type: "website", locale: "tr_TR", siteName: "Potash" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
