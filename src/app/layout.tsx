import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Pemesanan Seragam ASBD - SD Islam Al Azhar 62 Summarecon Bandung",
  description:
    "Form pemesanan seragam ASBD (Alat Seragam Daerah Berbeda) SD Islam Al Azhar 62 Summarecon Bandung Tahun Ajaran 2026/2027.",
  keywords: [
    "seragam",
    "ASBD",
    "Al Azhar 62",
    "Summarecon Bandung",
    "pemesanan seragam",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B3A5C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
