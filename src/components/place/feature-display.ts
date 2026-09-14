import { OnigiriIcon } from "@phosphor-icons/react/dist/csr/Onigiri";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  AudioLines,
  Bed,
  BookHeart,
  Cake,
  Camera,
  HandFist,
  Heart,
  HeartCrack,
  Landmark,
  Loader,
  PersonStanding,
  Plane,
  Shirt,
  ShoppingBag,
  Stamp,
  MapPin,
  TrainFront,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import type { CollaborationState, FeatureKind, IsoDate, PlaceCategory } from "@/types";

interface CollaborationStatePresentation {
  className: string;
  label: string;
  symbol: LucideIcon;
}

type PlaceCategoryIcon = LucideIcon | PhosphorIcon;

export const FEATURE_KIND_LABELS = {
  stampRally: "集章活動",
  sales: "商品販售",
  food: "聯名餐飲",
  display: "立牌展示",
  event: "指定活動",
  lodging: "住宿合作",
  transport: "交通合作",
  kimono: "和服體驗",
  voice: "限定語音",
  culturalProperty: "文化財合作",
  photo: "紀念攝影",
  goshuin: "聯名御朱印",
  supportStoreBenefit: "協力店特典",
} satisfies Record<FeatureKind, string>;

export const FEATURE_KIND_ICONS: Partial<Record<FeatureKind, LucideIcon>> = {
  stampRally: Stamp,
  sales: ShoppingBag,
  food: Utensils,
  display: PersonStanding,
  event: Cake,
  lodging: Bed,
  transport: TrainFront,
  kimono: Shirt,
  voice: AudioLines,
  culturalProperty: Landmark,
  photo: Camera,
  goshuin: BookHeart,
  supportStoreBenefit: HandFist,
};

export const PLACE_CATEGORY_ICONS: Partial<Record<PlaceCategory, PlaceCategoryIcon>> = {
  transport: TrainFront,
  airport: Plane,
  restaurant: OnigiriIcon,
  attraction: MapPin,
  hotel: Bed,
};

export const COLLABORATION_STATE_PRESENTATION = {
  UPCOMING: {
    label: "聯名內容尚未開始",
    symbol: Loader,
    className: "border-brand-line bg-brand-wash text-brand-dark",
  },
  ACTIVE: {
    label: "聯名內容提供中",
    symbol: Heart,
    className: "border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  ENDED: {
    label: "聯名內容已結束",
    symbol: HeartCrack,
    className: "border-rule-strong bg-paper-muted text-ink-soft",
  },
} satisfies Record<CollaborationState, CollaborationStatePresentation>;

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

  return ranges.map(({ end, start }) => (start === end ? formatIsoDate(start) : `${formatIsoDate(start)}～${formatIsoDate(end)}`)).join("、");
};
