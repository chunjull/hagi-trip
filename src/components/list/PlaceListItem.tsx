import { formatDailySchedule } from "@/components/place/place-display";
import PlaceFeatureList from "@/components/place/PlaceFeatureList";
import SupportStoreBadge from "@/components/place/SupportStoreBadge";
import { getPlaceNumber } from "@/components/place/place-number";
import type { PlaceDayInfo } from "@/domain/schedule/get-place-day-info";
import type { IsoDate, Place, PlaceCategory } from "@/types";
import { ChevronDown, Circle, CircleDashed, CircleX } from "lucide-react";

const CATEGORY_LABELS = {
  transport: "交通",
  airport: "機場",
  attraction: "景點",
  restaurant: "餐飲",
  hotel: "住宿",
} satisfies Record<PlaceCategory, string>;

interface PlaceListItemProps {
  date: IsoDate;
  info: PlaceDayInfo;
  place: Place;
}

const PlaceListItem = ({ date, info, place }: PlaceListItemProps) => (
  <article className="h-full rounded-lg border border-rule border-t-2 border-t-brand bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex w-full min-w-0 items-start gap-3 sm:w-auto sm:flex-1">
        <span className="place-number" aria-label={`景點編號 ${getPlaceNumber(place.id)}`}>
          {getPlaceNumber(place.id)}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wider text-brand">{CATEGORY_LABELS[place.category]}</p>
          <h3 className="mt-1 font-semibold leading-6 text-ink" lang="ja">
            {place.name}
          </h3>
          {place.isCollabSupportStore ? (
            <div className="mt-2">
              <SupportStoreBadge />
            </div>
          ) : null}
        </div>
      </div>

      {info.kind === "OPEN_TODAY" ? (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-950">
          <Circle aria-hidden="true" className="size-4 shrink-0" />
          當日營業
        </span>
      ) : info.kind === "CLOSED_TODAY" ? (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-rule-strong bg-paper-muted px-3 py-1 text-sm font-semibold text-ink">
          <CircleX aria-hidden="true" className="size-4 shrink-0" />
          當日休息
        </span>
      ) : info.kind === "PARTIALLY_CLOSED_TODAY" ? (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-950">
          <CircleDashed aria-hidden="true" className="size-4 shrink-0" />
          部分活動未營業
        </span>
      ) : null}
    </div>

    {info.kind === "OPEN_TODAY" || info.kind === "PARTIALLY_CLOSED_TODAY" ? (
      <dl className="mt-4 rounded-md bg-brand-wash p-3">
        <div>
          <dt className="text-xs font-medium text-ink-muted">當日可利用時間</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{formatDailySchedule(info.schedule)}</dd>
        </div>
      </dl>
    ) : info.kind === "CLOSED_TODAY" ? (
      <p className="mt-4 rounded-md bg-brand-wash p-3 text-sm text-ink-soft">官方排程顯示本日休息。</p>
    ) : null}

    {info.isOverride ? (
      <p className="mt-3 inline-flex min-h-8 items-center rounded-full border border-paper-line bg-wash px-3 py-1 text-xs font-semibold text-brand-dark">
        {info.kind === "CLOSED_TODAY" ? "官方指定日期休息" : "官方指定日期時段"}
      </p>
    ) : null}

    {place.notices && place.notices.length > 0 ? (
      <details className="group mt-3 rounded-md text-sm text-ink-soft">
        <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 font-medium text-ink [&::-webkit-details-marker]:hidden">
          特殊資訊與注意事項
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
          {place.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </details>
    ) : null}

    {place.features && place.features.length > 0 ? (
      <details className="group mt-4 rounded-md" open={place.category === "hotel"}>
        <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 py-1 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          聯名內容與指定日期資訊（{place.features.length}）
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        <div className="mt-3">
          <PlaceFeatureList date={date} features={place.features} />
        </div>
      </details>
    ) : null}
  </article>
);

export default PlaceListItem;
