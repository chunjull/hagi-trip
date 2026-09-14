import type { RefObject } from "react";

import { SITE_CONFIG } from "@/data/site-config";
import type { IsoDate } from "@/types";

interface DateSelectorProps {
  disabled?: boolean;
  id: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  label?: string;
  onChange: (value: string) => void;
  value: IsoDate;
}

const DateSelector = ({ disabled = false, id, inputRef, label = "選擇日期", onChange, value }: DateSelectorProps) => (
  <div className="min-w-0">
    <label className="block text-sm font-semibold text-ink" htmlFor={id}>
      {label}
    </label>
    {/* Keep padding outside the date input to avoid iOS WebKit's 100% width overflow. */}
    <div className="mt-2 flex min-h-12 min-w-0 items-center rounded-md border border-brand-line bg-white px-3 py-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-brand">
      <input
        className="block min-h-8 w-full min-w-0 max-w-full appearance-none border-0 bg-transparent p-0 text-base font-semibold text-brand focus:outline-none"
        id={id}
        disabled={disabled}
        max={SITE_CONFIG.eventPeriod.end}
        min={SITE_CONFIG.eventPeriod.start}
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  </div>
);

export default DateSelector;
