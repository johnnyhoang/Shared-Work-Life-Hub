import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HubProvider } from "@/context/HubContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "Shared Work & Life Hub",
  description: "Shared command center for remote collaboration across time zones",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hub",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <HubProvider>{children}</HubProvider>
      </body>
    </html>
  );
}
