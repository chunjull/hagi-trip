import PlaceListItem from "@/components/list/PlaceListItem";
import { getPlaceDayInfo, type PlaceDayInfo } from "@/domain/schedule/get-place-day-info";
import type { IsoDate, Place } from "@/types";

interface PlaceListProps {
  date: IsoDate;
  places: readonly Place[];
}

interface PlaceWithDayInfo {
  info: PlaceDayInfo;
  place: Place;
}

interface PlaceGroupProps {
  description: string;
  heading: string;
  id: string;
  items: PlaceWithDayInfo[];
}

const PlaceGroup = ({ description, heading, id, items }: PlaceGroupProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={id}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950" id={id}>
          {heading} <span className="text-sm font-medium text-slate-500">{items.length}</span>
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <ul className="mt-3 grid gap-3 lg:grid-cols-2">
        {items.map(({ info, place }) => (
          <li key={place.id}>
            <PlaceListItem info={info} place={place} />
          </li>
        ))}
      </ul>
    </section>
  );
};

const PlaceList = ({ date, places }: PlaceListProps) => {
  const groups = places.reduce(
    (result, place) => {
      const item = { place, info: getPlaceDayInfo(place, date) };

      if (item.info.kind === "OPEN_TODAY") {
        result.open.push(item);
      } else if (item.info.kind === "CLOSED_TODAY") {
        result.closed.push(item);
      } else {
        result.unavailable.push(item);
      }

      return result;
    },
    {
      open: [] as PlaceWithDayInfo[],
      closed: [] as PlaceWithDayInfo[],
      unavailable: [] as PlaceWithDayInfo[],
    },
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-2" aria-label="當日景點統計">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <p className="text-xl font-semibold text-emerald-950">{groups.open.length}</p>
          <p className="mt-1 text-xs text-emerald-900">營業</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-center">
          <p className="text-xl font-semibold text-slate-900">{groups.closed.length}</p>
          <p className="mt-1 text-xs text-slate-700">休息</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
          <p className="text-xl font-semibold text-slate-900">{groups.unavailable.length}</p>
          <p className="mt-1 text-xs text-slate-700">不適用</p>
        </div>
      </div>

      <PlaceGroup description="依官方排程，這些景點在所選日期有可利用時段。" heading="當日營業" id="open-places-title" items={groups.open} />
      <PlaceGroup description="依官方 weekly schedule 或指定日期規則，這些景點當日休息。" heading="當日休息" id="closed-places-title" items={groups.closed} />
      <PlaceGroup description="住宿合作與未提供一般營業時間的地點仍會保留，但不推測營業狀態。" heading="不提供一般營業判斷" id="unavailable-places-title" items={groups.unavailable} />
    </div>
  );
};

export default PlaceList;
