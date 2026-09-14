import type { IsoDate, SiteMode } from "@/types";

export const EVENT_TIME_ZONE = "Asia/Tokyo" as const;

export const SITE_CONFIG = {
  eventName: "銀魂暦",
  eventTimeZone: EVENT_TIME_ZONE,

  eventPeriod: {
    start: "2026-10-01",
    end: "2026-12-31",
  },

  /**
   * 這些日期不提供「商店/景點營業狀態」。
   * 地圖 marker 仍存在，但不顯示營業 badge。
   * 清單頁應以 blocking dialog 引導使用者改選日期。
   */
  businessInfoSuppressedDates: ["2026-11-28"] satisfies IsoDate[],

  sourcePolicy: {
    primary: "https://luface.jp/business/event/collabo/hagi_gintama_goyomi/",
    disclaimer: "本網站依活動官方網站刊載資訊整理。臨時休業、不定休及最新營業狀況，仍請以各設施官方公告為準。",
  },

  project: {
    contactLabel: "Threads",
    contactUrl: "https://www.threads.com/@rueeenotrueee",
  },

  mode: {
    type: "live",
  } satisfies SiteMode,
} as const;
