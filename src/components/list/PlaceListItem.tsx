import { formatDailySchedule } from "@/components/place/place-display";
import PlaceFeatureList from "@/components/place/PlaceFeatureList";
import SupportStoreBadge from "@/components/place/SupportStoreBadge";
import type { PlaceDayInfo } from "@/domain/schedule/get-place-day-info";
import type { IsoDate, Place, PlaceCategory } from "@/types";

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
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{CATEGORY_LABELS[place.category]}</p>
        <h3 className="mt-1 font-semibold leading-6 text-slate-950" lang="ja">
          {place.name}
        </h3>
        {place.isCollabSupportStore ? (
          <div className="mt-2">
            <SupportStoreBadge />
          </div>
        ) : null}
      </div>

      {info.kind === "OPEN_TODAY" ? (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-950">
          <span aria-hidden="true">○</span>當日營業
        </span>
      ) : info.kind === "CLOSED_TODAY" ? (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-slate-400 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
          <span aria-hidden="true">×</span>當日休息
        </span>
      ) : (
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
          <span aria-hidden="true">—</span>不提供營業判斷
        </span>
      )}
    </div>

    {info.kind === "OPEN_TODAY" ? (
      <dl className="mt-4 rounded-xl bg-slate-50 p-3">
        <div>
          <dt className="text-xs font-medium text-slate-500">當日可利用時間</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{formatDailySchedule(info.schedule)}</dd>
        </div>
      </dl>
    ) : info.kind === "CLOSED_TODAY" ? (
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">官方排程顯示本日休息。</p>
    ) : (
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">此地點不以一般營業時間判斷可用狀態；請查看合作內容或設施官方公告。</p>
    )}

    {info.isOverride ? (
      <p className="mt-3 inline-flex min-h-8 items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950">
        {info.kind === "CLOSED_TODAY" ? "官方指定日期休息" : "官方指定日期時段"}
      </p>
    ) : null}

    {place.statusBasisLabel ? (
      <p className="mt-3 text-xs leading-5 text-slate-600">
        判斷基準：<span lang="ja">{place.statusBasisLabel}</span>
      </p>
    ) : null}

    {place.notices && place.notices.length > 0 ? (
      <details className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
        <summary className="min-h-8 cursor-pointer font-medium text-slate-900">特殊資訊與注意事項</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
          {place.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </details>
    ) : null}

    {place.features && place.features.length > 0 ? (
      <details className="mt-4 rounded-xl border border-slate-200 px-3 py-2" open={place.category === "hotel"}>
        <summary className="min-h-9 cursor-pointer py-1 text-sm font-semibold text-slate-900">聯名內容與指定日期資訊（{place.features.length}）</summary>
        <div className="mt-3">
          <PlaceFeatureList date={date} features={place.features} />
        </div>
      </details>
    ) : null}
  </article>
);

export default PlaceListItem;
