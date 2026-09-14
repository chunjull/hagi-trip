import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans_TC } from "next/font/google";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  display: "swap",
  preload: false,
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
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
    <html lang="zh-Hant" className={`${notoSansTC.variable} ${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-dvh flex-col">
          <Header />
          <div className="flex min-h-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</div>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
