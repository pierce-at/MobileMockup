import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";

import { MobileRuntime } from "@/components/mobile-runtime";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const montserrat = Montserrat({
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
  themeColor: "#0c495a"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-body antialiased`}>
        <MobileRuntime />
        {children}
      </body>
    </html>
  );
}
