import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#A8B5A0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Tomblr | Nigeria's First Localized Cloud Storage",
  description: "Affordable, fast, and secure document storage tailored for the African market. Store Word, Excel, PDF, and images securely.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Tomblr | Localized Cloud Storage",
    description: "Securely store and share your documents from anywhere in Nigeria.",
    url: "https://tomblr.com.ng",
    siteName: "Tomblr",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomblr | Localized Cloud Storage",
    description: "Securely store and share your documents from anywhere in Nigeria.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
