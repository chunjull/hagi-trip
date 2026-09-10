import { PLACE_STATUS_PRESENTATION } from "@/components/map/place-status-presentation";
import type { PlaceStatus } from "@/types";

const LEGEND_STATUSES = [
  "OPEN",
  "CLOSING_SOON",
  "CLOSING_VERY_SOON",
  "NOT_OPEN_YET",
  "OPEN_STATUS_UNCERTAIN",
  "CLOSED",
  "CLOSED_TODAY",
  "HIDDEN",
] satisfies PlaceStatus[];

const MarkerLegend = () => {
  return (
    <section aria-labelledby="marker-legend-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950" id="marker-legend-title">
        地圖狀態圖例
      </h2>
      <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
        {LEGEND_STATUSES.map((status) => {
          const presentation = PLACE_STATUS_PRESENTATION[status];

          return (
            <li className="flex items-center gap-2" key={status}>
              <span
                aria-hidden="true"
                className={`grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${presentation.className}`}
              >
                {presentation.symbol}
              </span>
              <span>{presentation.label}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-5 text-slate-600">中性 marker 代表該地點不提供即時營業狀態，或當日暫停提供一般營業資訊。</p>
    </section>
  );
};

export default MarkerLegend;
