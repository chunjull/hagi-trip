import type { PlaceStatus } from "@/types";

export interface PlaceStatusPresentation {
  label: string;
  symbol: string;
  className: string;
}

/**
 * UI-only presentation metadata for marker and legend statuses.
 * Business decisions remain in getPlaceStatus().
 */
export const PLACE_STATUS_PRESENTATION = {
  OPEN: {
    label: "營業中",
    symbol: "●",
    className: "border-emerald-950 bg-emerald-700 text-white",
  },
  CLOSING_SOON: {
    label: "2 小時內結束營業",
    symbol: "2h",
    className: "border-amber-800 bg-amber-300 text-amber-950",
  },
  CLOSING_VERY_SOON: {
    label: "1 小時內結束營業",
    symbol: "1h",
    className: "border-orange-950 bg-orange-700 text-white",
  },
  NOT_OPEN_YET: {
    label: "今日尚未開始營業",
    symbol: "◷",
    className: "border-sky-800 bg-sky-100 text-sky-950",
  },
  OPEN_STATUS_UNCERTAIN: {
    label: "狀態需現場／官方確認",
    symbol: "?",
    className: "border-slate-700 bg-slate-100 text-slate-950",
  },
  CLOSED: {
    label: "今日營業已結束",
    symbol: "×",
    className: "border-zinc-800 bg-zinc-700 text-white",
  },
  CLOSED_TODAY: {
    label: "今日休息",
    symbol: "休",
    className: "border-zinc-900 bg-zinc-900 text-white",
  },
  HIDDEN: {
    label: "不顯示營業狀態",
    symbol: "•",
    className: "border-slate-600 bg-white text-slate-900",
  },
} satisfies Record<PlaceStatus, PlaceStatusPresentation>;

export const getPlaceStatusPresentation = (status: PlaceStatus): PlaceStatusPresentation => PLACE_STATUS_PRESENTATION[status];
