"use client";

import { useState, type ChangeEvent, type RefObject } from "react";

import { SITE_CONFIG } from "@/data/site-config";
import { isDateInEventPeriod, parseIsoDate } from "@/domain/event/list-date";
import type { IsoDate } from "@/types";

interface DateSelectorProps {
  disabled?: boolean;
  id: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  label?: string;
  onChange: (value: string) => void;
  value: IsoDate;
}

const formatDate = (date: IsoDate): string => date.replaceAll("-", "/");

const eventPeriodLabel = `${formatDate(SITE_CONFIG.eventPeriod.start)}～${formatDate(SITE_CONFIG.eventPeriod.end)}`;

const DateSelector = ({ disabled = false, id, inputRef, label = "選擇日期", onChange, value }: DateSelectorProps) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDate = parseIsoDate(event.currentTarget.value);

    if (!nextDate) {
      setValidationMessage("請選擇有效日期。");
      return;
    }

    if (!isDateInEventPeriod(nextDate)) {
      setValidationMessage(`日期超出活動期間，請選擇 ${eventPeriodLabel} 之間的日期。`);
      return;
    }

    setValidationMessage(null);
    onChange(nextDate);
  };

  return (
    <div className="min-w-0">
      <label className="block text-sm font-semibold text-ink" htmlFor={id}>
        {label}
      </label>
      {/* Keep padding outside the date input to avoid iOS WebKit's 100% width overflow. */}
      <div
        className={`mt-2 flex min-h-12 min-w-0 items-center rounded-md border bg-white px-3 py-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-brand ${
          validationMessage ? "border-red-700" : "border-brand-line"
        }`}
      >
        <input
          aria-describedby={`${hintId}${validationMessage ? ` ${errorId}` : ""}`}
          aria-invalid={validationMessage ? "true" : undefined}
          className="block min-h-8 w-full min-w-0 max-w-full appearance-none border-0 bg-transparent p-0 text-base font-semibold text-brand focus:outline-none"
          id={id}
          disabled={disabled}
          max={SITE_CONFIG.eventPeriod.end}
          min={SITE_CONFIG.eventPeriod.start}
          ref={inputRef}
          type="date"
          value={value}
          onChange={handleChange}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-ink-soft" id={hintId}>
        可選日期：{eventPeriodLabel}
      </p>
      {validationMessage ? (
        <p className="mt-1 text-sm font-semibold text-red-800" id={errorId} role="alert">
          {validationMessage}
        </p>
      ) : null}
    </div>
  );
};

export default DateSelector;
