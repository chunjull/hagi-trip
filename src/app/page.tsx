import Link from "next/link";

import MapHomeClient from "@/components/map/MapHomeClient";
import MarkerLegend from "@/components/map/MarkerLegend";
import { SITE_CONFIG } from "@/data/site-config";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-slate-50 px-4 py-6 sm:px-6">
      <header className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">銀魂暦 × 萩</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">合作景點地圖</h1>
            <p className="mt-2 text-sm leading-6 text-slate-700">依日本當地時間查看所有聯名景點，以及目前是否仍可前往。</p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href="/list"
          >
            依日期查看
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-4">
        <MapHomeClient />
        <MarkerLegend />
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">{SITE_CONFIG.sourcePolicy.disclaimer}</p>
      </div>
    </main>
  );
}
