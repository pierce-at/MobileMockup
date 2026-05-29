import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { MobileRuntime } from "@/components/mobile-runtime";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "TCSW 2026",
  description: "Twin Cities Startup Week attendee app prototype",
  applicationName: "TCSW 2026",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TCSW 2026"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08142f"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <MobileRuntime />
        {children}
      </body>
    </html>
  );
}
