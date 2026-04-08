import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://made4madison.vercel.app";

export const metadata: Metadata = {
  title: "Build-A-Date",
  description: "A romantic guided Kansas City date-night journey for Madison.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl
  },
  icons: {
    apple: "/apple-icon",
    icon: "/icon"
  },
  openGraph: {
    title: "Build-A-Date",
    description: "A romantic guided Kansas City date-night journey for Madison.",
    images: [
      {
        alt: "Build-A-Date preview",
        height: 630,
        url: "/opengraph-image",
        width: 1200
      }
    ],
    type: "website",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Build-A-Date",
    description: "A romantic guided Kansas City date-night journey for Madison.",
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
