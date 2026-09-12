import type { Metadata } from "next";

import { SITE_CONFIG } from "@/data/site-config";

export const metadata: Metadata = {
  title: "關於本站",
  description: "了解銀魂暦 × 萩巡禮資訊網站的用途、資料來源、時區與免責聲明。",
};

const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">{children}</div>
  </section>
);

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">關於本站</h1>
          <p className="mt-2 text-sm leading-6 text-slate-700">旅行途中與行前規劃都能快速查找聯名景點與官方活動資訊。</p>
        </header>

        <div className="mt-6 space-y-4">
          <Section title="網站用途">
            <p>本站整理「銀魂暦 × 萩」聯名城市活動資訊，協助使用者查看景點位置、當下可利用狀態，以及指定日期的營業時段與活動內容。</p>
            <p>本站只提供資訊，不會自動安排路線、估算交通時間或替使用者產生行程。</p>
          </Section>

          <Section title="使用方式">
            <ul className="list-disc space-y-2 pl-5">
              <li>「景點地圖」依日本當地現在時間顯示 marker 狀態，點選 marker 可查看詳細內容並交由 Google Maps 導航。</li>
              <li>「日期清單」可選擇活動期間內的一天，查看各地點當日營業、休息、合作內容與列車運行資訊。</li>
              <li>住宿、JR 萩駅等不以一般營業時間判斷的地點，會保留位置與合作資訊，但不顯示即時營業 badge。</li>
            </ul>
          </Section>

          <Section title="時間與日期">
            <p>
              所有即時狀態與日期判斷固定使用 <strong>JST（日本標準時間）</strong>，時區為
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-900">{SITE_CONFIG.eventTimeZone}</code>。 即使使用者身處台灣或其他國家，也不會使用裝置所在地時間代替。
            </p>
            <p>
              活動期間為 <time dateTime={SITE_CONFIG.eventPeriod.start}>{SITE_CONFIG.eventPeriod.start}</time> 至
              <time className="ml-1" dateTime={SITE_CONFIG.eventPeriod.end}>
                {SITE_CONFIG.eventPeriod.end}
              </time>
              。
            </p>
          </Section>

          <Section title="資料來源與更新原則">
            <p>
              活動資訊以
              <a
                className="mx-1 font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                href={SITE_CONFIG.sourcePolicy.primary}
                rel="noopener noreferrer"
                target="_blank"
              >
                銀魂暦官方活動網站<span className="sr-only">（新分頁）</span>
              </a>
              為主要依據；活動頁資訊不足時，才使用 JR 等相關單位的官方資料補充。
            </p>
            <p>本站不以第三方部落格、評論或 Google 使用者內容覆蓋官方資料，也不自行推測營業日、地址、座標或列車運行日期。</p>
            <p>SNS 才公布的臨時休業與不定休實際狀況，不會納入自動判斷。</p>
          </Section>

          <Section title="重要聲明">
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-medium text-amber-950">{SITE_CONFIG.sourcePolicy.disclaimer}</p>
            <p>本站為個人製作的非官方網站，與作品權利方、活動主辦單位及各合作設施皆無隸屬或代理關係。</p>
          </Section>

          <Section title="開發背景與聯絡方式">
            <p>這個 side project 希望把分散在官方活動頁中的地點、營業時間與限定日期，整理成旅途中可用手機快速判斷的資訊，同時保留活動結束後的紀念查閱用途。</p>
            <p>
              若發現資料錯誤或網站問題，請透過
              <a
                className="mx-1 font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                href={SITE_CONFIG.project.contactUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {SITE_CONFIG.project.contactLabel}
                <span className="sr-only">（新分頁）</span>
              </a>
              聯絡開發者；回報前仍請先以活動或設施官方公告確認最新狀況。
            </p>
            <p>
              本站原始碼可於
              <a
                className="mx-1 font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                href={SITE_CONFIG.project.repositoryUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub repository<span className="sr-only">（新分頁）</span>
              </a>
              查看。
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
