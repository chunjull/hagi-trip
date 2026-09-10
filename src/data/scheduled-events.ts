import type { ScheduledEvent } from "@/types";

export const SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: "marumaru-no-hanashi",
    name: "観光列車「〇〇のはなし」× 銀魂",
    activePeriod: {
      start: "2026-10-03",
      end: "2026-12-20",
    },
    relatedPlaceIds: ["jr-hagi", "jr-higashi-hagi"],

    /**
     * JR西日本 2026/5/29 公布之實際運行日。
     * 不使用「週末/國定假日」公式推算，避免一部祝日不運行造成誤判。
     */
    serviceDates: [
      "2026-10-03",
      "2026-10-04",
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
      "2026-10-17",
      "2026-10-18",
      "2026-10-24",
      "2026-10-25",
      "2026-10-31",

      "2026-11-01",
      "2026-11-07",
      "2026-11-08",
      "2026-11-14",
      "2026-11-15",
      "2026-11-21",
      "2026-11-22",
      "2026-11-23",
      "2026-11-28",
      "2026-11-29",

      "2026-12-05",
      "2026-12-06",
      "2026-12-12",
      "2026-12-13",
      "2026-12-19",
      "2026-12-20",
    ],

    segments: [
      {
        id: "hagi-to-higashi-hagi",
        label: "萩 → 東萩",
        startPlaceId: "jr-hagi",
        endPlaceId: "jr-higashi-hagi",
        start: "12:51",
        end: "12:56",
        description: "往路：吉田松陽の録り下ろしボイス。",
      },
      {
        id: "higashi-hagi-to-hagi",
        label: "東萩 → 萩",
        startPlaceId: "jr-higashi-hagi",
        endPlaceId: "jr-hagi",
        start: "14:09",
        end: "14:16",
        description: "復路：坂田銀時の録り下ろしボイス。",
      },
    ],

    notices: [
      "全席指定席。乗車券のほか座席指定券が必要。",
      "運行時刻は変更となる場合があるため、乗車前はJR西日本公式情報も確認する。",
      "11/28 は網站的「營業資訊 suppression」対象日だが、列車運行資訊は營業資訊ではないため表示を維持する。",
    ],

    sources: [
      {
        label: "銀魂暦 公式",
        url: "https://luface.jp/business/event/collabo/hagi_gintama_goyomi/",
      },
      {
        label: "JR西日本「〇〇のはなし」運転計画 2026年10月～2027年2月",
        url: "https://www.westjr.co.jp/press/article/2026/05/29/items/260526_00_press_marumarunohanashi_unten.pdf",
      },
      {
        label: "JRおでかけネット「〇〇のはなし」",
        url: "https://www.jr-odekake.net/railroad/kankoutrain/marumaru_no_hanashi/",
      },
    ],
  },
];
