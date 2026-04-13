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
  // We intentionally don't list `images` here. Next.js auto-injects the
  // og:image / twitter:image meta tags from the `opengraph-image.jpg`,
  // `twitter-image.jpg`, and `*.alt.txt` files placed alongside this layout.
  // Listing them explicitly would emit duplicate tags.
  openGraph: {
    title: "Build-A-Date",
    description: "A romantic guided Kansas City date-night journey for Madison.",
    type: "website",
    siteName: "Build-A-Date",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Build-A-Date",
    description: "A romantic guided Kansas City date-night journey for Madison."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
