import { PLACE_STATUS_PRESENTATION } from "@/components/map/place-status-presentation";
import type { PlaceStatus } from "@/types";
import { ChevronDown } from "lucide-react";
import { SITE_CONFIG } from "@/data/site-config";

const LEGEND_STATUSES = ["OPEN", "CLOSING_SOON", "CLOSING_VERY_SOON", "NOT_OPEN_YET", "OPEN_STATUS_UNCERTAIN", "CLOSED", "CLOSED_TODAY"] satisfies PlaceStatus[];

const MarkerLegend = () => {
  return (
    <details className="group w-full max-w-md rounded-lg border border-brand-line bg-paper/95 shadow-lg backdrop-blur">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm font-semibold text-brand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
        地圖狀態與注意事項
        <ChevronDown aria-hidden="true" className="shrink-0 group-open:rotate-180" />
      </summary>
      <ul className="grid max-h-[45dvh] gap-2 overflow-y-auto border-t border-rule px-4 py-3 text-sm text-ink-soft sm:grid-cols-2">
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
      <p className="border-t border-rule px-4 py-3 text-xs leading-5 text-ink-soft">{SITE_CONFIG.sourcePolicy.disclaimer}</p>
    </details>
  );
};

export default MarkerLegend;
