import type { RefObject } from "react";

import { SITE_CONFIG } from "@/data/site-config";
import type { IsoDate } from "@/types";

interface DateSelectorProps {
  id: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  label?: string;
  onChange: (value: string) => void;
  value: IsoDate;
}

const DateSelector = ({ id, inputRef, label = "選擇日期", onChange, value }: DateSelectorProps) => (
  <div>
    <label className="block text-sm font-semibold text-slate-950" htmlFor={id}>
      {label}
    </label>
    <input
      className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      id={id}
      max={SITE_CONFIG.eventPeriod.end}
      min={SITE_CONFIG.eventPeriod.start}
      ref={inputRef}
      type="date"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  </div>
);

export default DateSelector;
