import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build-A-Date",
  description: "Phase 1 of a guided Kansas City virtual date-night journey."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
