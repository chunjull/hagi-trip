import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "銀魂暦 × 萩｜合作景點地圖",
    template: "%s｜銀魂暦 × 萩",
  },
  description: "查看銀魂暦 × 萩聯名景點的位置與日本當地營業狀態。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
