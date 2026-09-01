import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getsmartstamp.com";

export const metadata: Metadata = {
  // Gives Open Graph and canonical URLs an absolute base to resolve against.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Smart Stamp — the modern email signature generator",
    template: "%s — Smart Stamp",
  },
  description:
    "Design a beautiful, professional email signature in minutes. Photos, logos, social icons, CTA buttons, banners and QR codes — copy it straight into Gmail, Outlook, Apple Mail and everywhere else.",
  applicationName: "Smart Stamp",
  openGraph: {
    siteName: "Smart Stamp",
    title: "Smart Stamp — the modern email signature generator",
    description:
      "Design a beautiful, professional email signature in minutes, then paste it into Gmail, Outlook or Apple Mail.",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Stamp — the modern email signature generator",
    description:
      "Design a beautiful, professional email signature in minutes, then paste it into Gmail, Outlook or Apple Mail.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
