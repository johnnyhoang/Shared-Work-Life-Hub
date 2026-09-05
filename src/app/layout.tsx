import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HubProvider } from "@/context/HubContext";
import { I18nProvider } from "@/lib/i18n";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
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
      lang="vi"
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
        <I18nProvider>
          <HubProvider>{children}</HubProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
