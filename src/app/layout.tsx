import type { Metadata, Viewport } from "next";
import "./globals.css";

// metadataBase lets the file-based `opengraph-image.jpg` / `twitter-image.jpg`
// conventions in this same segment resolve to absolute URLs under
// made4madison.vercel.app. We intentionally don't set `openGraph.images` /
// `twitter.images` here — Next.js auto-injects those meta tags from the files.
export const metadata: Metadata = {
  metadataBase: new URL("https://made4madison.vercel.app"),
  title: "Build-A-Date",
  description: "Madison — tap in. Your night is already waiting.",
  openGraph: {
    title: "Build-A-Date",
    description: "Madison — tap in. Your night is already waiting.",
    url: "https://made4madison.vercel.app",
    siteName: "Build-A-Date",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build-A-Date",
    description: "Madison — tap in. Your night is already waiting.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%", background: "#000", color: "#fff", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
