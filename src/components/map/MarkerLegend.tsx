import { PLACE_STATUS_PRESENTATION } from "@/components/map/place-status-presentation";
import type { PlaceStatus } from "@/types";
import { ChevronDown } from "lucide-react";

const LEGEND_STATUSES = ["OPEN", "CLOSING_SOON", "CLOSING_VERY_SOON", "NOT_OPEN_YET", "OPEN_STATUS_UNCERTAIN", "CLOSED", "CLOSED_TODAY"] satisfies PlaceStatus[];

const MarkerLegend = () => {
  return (
    <details className="group w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700 [&::-webkit-details-marker]:hidden">
        地圖狀態圖例
        <ChevronDown />
      </summary>
      <ul className="grid max-h-[45dvh] gap-2 overflow-y-auto border-t border-slate-200 px-4 py-3 text-sm text-slate-700 sm:grid-cols-2">
        {LEGEND_STATUSES.map((status) => {
          const presentation = PLACE_STATUS_PRESENTATION[status];
          const Symbol = presentation.symbol;

          return (
            <li className="flex items-center gap-2" key={status}>
              <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border border-slate-600 text-xs font-bold ${presentation.className}`}>
                {typeof Symbol === "string" ? Symbol : <Symbol aria-hidden="true" className="size-4" strokeWidth={2.5} />}
              </span>
              <span>{presentation.label}</span>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-600">中性 marker 代表該地點不提供即時營業狀態，或當日暫停提供一般營業資訊。</p>
    </details>
  );
};

export default MarkerLegend;
