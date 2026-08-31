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

export const metadata: Metadata = {
  title: {
    default: "Signaturely — the modern email signature generator",
    template: "%s — Signaturely",
  },
  description:
    "Design a beautiful, professional email signature in minutes. Photos, logos, social icons, CTA buttons, banners and QR codes — copy it straight into Gmail, Outlook, Apple Mail and everywhere else.",
  openGraph: {
    title: "Signaturely — the modern email signature generator",
    description:
      "Design a beautiful, professional email signature in minutes, then paste it into Gmail, Outlook or Apple Mail.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
