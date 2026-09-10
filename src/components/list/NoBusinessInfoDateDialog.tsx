"use client";

import { useEffect, useRef } from "react";

import ScheduledEventCard from "@/components/event/ScheduledEventCard";
import DateSelector from "@/components/list/DateSelector";
import type { IsoDate, ScheduledEvent } from "@/types";

interface NoBusinessInfoDateDialogProps {
  date: IsoDate;
  events: readonly ScheduledEvent[];
  onSelectDate: (value: string) => void;
  open: boolean;
}

const NoBusinessInfoDateDialog = ({ date, events, onSelectDate, open }: NoBusinessInfoDateDialogProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!open) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => dateInputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      aria-describedby="no-business-info-description"
      aria-labelledby="no-business-info-title"
      aria-modal="true"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-3xl bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/60"
      ref={dialogRef}
      role="dialog"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="p-5 sm:p-6">
        <p className="text-sm font-medium text-sky-800">指定日期營業資訊</p>
        <h2 className="mt-1 text-xl font-semibold" id="no-business-info-title">
          11 月 28 日不提供一般營業資訊
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-700" id="no-business-info-description">
          景點位置與列車運行資訊仍然有效，但本日不判斷商店及設施是否營業。請選擇其他日期後繼續查看清單。
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <DateSelector id="replacement-date" inputRef={dateInputRef} label="改選其他日期" value={date} onChange={onSelectDate} />
          <p className="mt-2 text-xs leading-5 text-slate-600">必須選擇 2026/10/01～2026/12/31 之間、且不是 2026/11/28 的日期。</p>
        </div>

        <section aria-labelledby="suppressed-date-events-title" className="mt-6">
          <h3 className="text-base font-semibold" id="suppressed-date-events-title">
            11 月 28 日列車資訊
          </h3>
          <div className="mt-3 space-y-3">
            {events.map((event) => (
              <ScheduledEventCard date={date} event={event} key={event.id} />
            ))}
          </div>
        </section>
      </div>
    </dialog>
  );
};

export default NoBusinessInfoDateDialog;
