import { Circle, ClockFading, MessageCircleQuestionMark, Moon, Slash, X, type LucideIcon } from "lucide-react";

import type { PlaceStatus } from "@/types";

type PlaceStatusSymbol = LucideIcon | "" | "1h" | "2h";

export interface PlaceStatusPresentation {
  label: string;
  symbol: PlaceStatusSymbol;
  className: string;
}

/**
 * UI-only presentation metadata for marker and legend statuses.
 * Business decisions remain in getPlaceStatus().
 */
export const PLACE_STATUS_PRESENTATION = {
  OPEN: {
    label: "營業中",
    symbol: Circle,
    className: "bg-emerald-700 text-white",
  },
  CLOSING_SOON: {
    label: "2 小時內結束營業",
    symbol: "2h",
    className: "bg-amber-300 text-amber-950",
  },
  CLOSING_VERY_SOON: {
    label: "1 小時內結束營業",
    symbol: "1h",
    className: "bg-orange-700 text-white",
  },
  NOT_OPEN_YET: {
    label: "今日尚未開始營業",
    symbol: ClockFading,
    className: "bg-brand-light text-brand-dark",
  },
  OPEN_STATUS_UNCERTAIN: {
    label: "狀態需現場／官方確認",
    symbol: MessageCircleQuestionMark,
    className: "bg-paper-muted text-ink",
  },
  CLOSED: {
    label: "今日營業已結束",
    symbol: X,
    className: "bg-zinc-700 text-white",
  },
  CLOSED_TODAY: {
    label: "今日休息",
    symbol: Moon,
    className: "bg-zinc-900 text-white",
  },
  HIDDEN: {
    label: "不顯示營業狀態",
    symbol: Slash,
    className: "bg-white text-ink",
  },
} satisfies Record<PlaceStatus, PlaceStatusPresentation>;

export const getPlaceStatusPresentation = (status: PlaceStatus): PlaceStatusPresentation => PLACE_STATUS_PRESENTATION[status];
