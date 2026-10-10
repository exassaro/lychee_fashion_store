import type { Metadata, Viewport } from "next";
import { Inter, Zilla_Slab } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const zilla = Zilla_Slab({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-zilla",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LYCHEE — Fashion for Kids and Ladies",
    template: "%s | LYCHEE",
  },
  description:
    "LYCHEE is a readymade clothing store for kids and ladies. Browse frocks, kurtis, tops, sets and nightwear online and order easily on WhatsApp.",
  applicationName: "LYCHEE",
  keywords: ["kids clothing", "ladies clothing", "kurtis", "frocks", "readymade garments", "LYCHEE"],
  openGraph: {
    type: "website",
    siteName: "LYCHEE",
    locale: "en_IN",
    url: SITE_URL,
    images: [{ url: "/og", width: 1200, height: 630, alt: "LYCHEE — Fashion for Kids and Ladies" }],
  },
  twitter: { card: "summary_large_image", images: ["/og"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#E8004C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${zilla.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
