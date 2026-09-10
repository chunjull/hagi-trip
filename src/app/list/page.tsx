import type { Metadata } from "next";
import { Suspense } from "react";

import DateListClient from "@/components/list/DateListClient";

export const metadata: Metadata = {
  title: "日期清單",
  description: "依指定日期查看銀魂暦 × 萩合作景點的營業日、休息日與可利用時間。",
};

const DateListFallback = () => (
  <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-700" role="status">
    日期清單載入中…
  </div>
);

export default function ListPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-slate-50 px-4 py-6 sm:px-6">
      <header className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-slate-600">銀魂暦 × 萩</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">指定日期景點清單</h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">選擇活動期間內的一天，查看各景點是否營業及當日可利用時間。</p>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<DateListFallback />}>
          <DateListClient />
        </Suspense>
      </div>
    </main>
  );
}
