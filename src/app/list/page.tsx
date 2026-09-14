import type { Metadata } from "next";
import { Suspense } from "react";

import DateListClient from "@/components/list/DateListClient";

export const metadata: Metadata = {
  title: "日期清單",
  description: "依指定日期查看銀魂暦 × 萩合作景點的營業日、休息日與可利用時間。",
};

const DateListFallback = () => (
  <div className="flex min-h-40 items-center justify-center rounded-lg border border-rule bg-white text-sm text-ink-soft" role="status">
    日期清單載入中…
  </div>
);

export default function ListPage() {
  return (
    <main className="handbook-background flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="mx-auto w-full max-w-5xl border-b border-brand-line pb-5">
        <h1 className="handbook-title text-2xl text-ink">指定日期景點清單</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">選擇活動期間內的一天，查看各景點是否營業及當日可利用時間。</p>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<DateListFallback />}>
          <DateListClient />
        </Suspense>
      </div>
    </main>
  );
}
