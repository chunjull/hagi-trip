import type { CollaborationState, FeatureKind, IsoDate } from "@/types";

export const FEATURE_KIND_LABELS = {
  stampRally: "集章活動",
  sales: "商品販售",
  food: "聯名餐飲",
  display: "展示",
  event: "限定活動",
  lodging: "住宿合作",
  transport: "交通合作",
  kimono: "和服體驗",
  voice: "限定語音",
  culturalProperty: "文化財合作",
  photo: "紀念攝影",
  goshuin: "聯名御朱印",
  supportStoreBenefit: "協力店特典",
} satisfies Record<FeatureKind, string>;

export const COLLABORATION_STATE_PRESENTATION = {
  UPCOMING: {
    label: "聯名內容尚未開始",
    symbol: "◇",
    className: "border-sky-300 bg-sky-50 text-sky-950",
  },
  ACTIVE: {
    label: "聯名內容提供中",
    symbol: "●",
    className: "border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  ENDED: {
    label: "聯名內容已結束",
    symbol: "—",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
} satisfies Record<CollaborationState, { className: string; label: string; symbol: string }>;

const toUtcDay = (date: IsoDate): number => Date.parse(`${date}T00:00:00.000Z`) / 86_400_000;

const formatIsoDate = (date: IsoDate): string => date.replaceAll("-", "/");

/** Compacts exact service dates into readable, inclusive consecutive ranges. */
export const formatAvailabilityDateRanges = (dates: readonly IsoDate[]): string => {
  if (dates.length === 0) {
    return "官方未列出指定日期";
  }

  const sortedDates = [...new Set(dates)].sort();
  const ranges: Array<{ end: IsoDate; start: IsoDate }> = [];

  for (const date of sortedDates) {
    const currentRange = ranges.at(-1);

    if (currentRange && toUtcDay(date) === toUtcDay(currentRange.end) + 1) {
      currentRange.end = date;
    } else {
      ranges.push({ start: date, end: date });
    }
  }

  return ranges
    .map(({ end, start }) => (start === end ? formatIsoDate(start) : `${formatIsoDate(start)}～${formatIsoDate(end)}`))
    .join("、");
};
