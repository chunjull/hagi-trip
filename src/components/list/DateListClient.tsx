"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import ScheduledEventCard from "@/components/event/ScheduledEventCard";
import DateSelector from "@/components/list/DateSelector";
import NoBusinessInfoDateDialog from "@/components/list/NoBusinessInfoDateDialog";
import PlaceList from "@/components/list/PlaceList";
import { PLACES } from "@/data/places";
import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import { SITE_CONFIG } from "@/data/site-config";
import { isBusinessInfoSuppressedDate } from "@/domain/event/business-info";
import { getInitialListDate, isDateInEventPeriod, isSelectableBusinessDate, parseIsoDate } from "@/domain/event/list-date";
import type { IsoDate } from "@/types";

const selectedDateFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const formatSelectedDate = (date: IsoDate): string => selectedDateFormatter.format(new Date(`${date}T00:00:00.000Z`));

const DateListClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDate = searchParams.get("date");
  const selectedDate = getInitialListDate(queryDate);
  const mainDateInputRef = useRef<HTMLInputElement>(null);
  const wasSuppressedRef = useRef(isBusinessInfoSuppressedDate(selectedDate));

  const businessInfoSuppressed = isBusinessInfoSuppressedDate(selectedDate);

  useEffect(() => {
    if (wasSuppressedRef.current && !businessInfoSuppressed) {
      const focusFrame = window.requestAnimationFrame(() => mainDateInputRef.current?.focus());
      wasSuppressedRef.current = businessInfoSuppressed;
      return () => window.cancelAnimationFrame(focusFrame);
    }

    wasSuppressedRef.current = businessInfoSuppressed;
  }, [businessInfoSuppressed]);

  const handleSelectDate = useCallback(
    (value: string) => {
      const parsedDate = parseIsoDate(value);

      if (!parsedDate || !isDateInEventPeriod(parsedDate)) {
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set("date", parsedDate);
      router.replace(`/list?${nextSearchParams.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSelectReplacementDate = useCallback(
    (value: string) => {
      const parsedDate = parseIsoDate(value);

      if (parsedDate && isSelectableBusinessDate(parsedDate)) {
        handleSelectDate(value);
      }
    },
    [handleSelectDate],
  );

  return (
    <section aria-label="指定日期景點清單" className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DateSelector id="list-date" inputRef={mainDateInputRef} value={selectedDate} onChange={handleSelectDate} />
        <p className="mt-3 text-sm font-semibold text-slate-950">
          目前查看：<time dateTime={selectedDate}>{formatSelectedDate(selectedDate)}</time>
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">日期判斷以活動所在地的日本日期為準。</p>
      </div>

      <div aria-hidden={businessInfoSuppressed || undefined} className="space-y-8" inert={businessInfoSuppressed}>
        <section aria-labelledby="scheduled-events-title">
          <h2 className="text-lg font-semibold text-slate-950" id="scheduled-events-title">
            指定日期活動
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">列車運行日依官方逐日公告判斷，與一般景點營業資訊分開。</p>
          <div className="mt-3 space-y-3">
            {SCHEDULED_EVENTS.map((event) => (
              <ScheduledEventCard date={selectedDate} event={event} key={event.id} />
            ))}
          </div>
        </section>

        <PlaceList date={selectedDate} places={PLACES} />

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
          {SITE_CONFIG.sourcePolicy.disclaimer}
        </p>
      </div>

      <NoBusinessInfoDateDialog
        date={selectedDate}
        events={SCHEDULED_EVENTS}
        open={businessInfoSuppressed}
        onSelectDate={handleSelectReplacementDate}
      />
    </section>
  );
};

export default DateListClient;
