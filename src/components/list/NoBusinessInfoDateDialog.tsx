"use client";

import { useEffect, useRef } from "react";

import DateSelector from "@/components/list/DateSelector";
import ScheduledEventCard from "@/components/event/ScheduledEventCard";
import { trapDialogFocus } from "@/components/layout/dialog-focus";
import type { IsoDate, ScheduledEvent } from "@/types";
import Image from "next/image";

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
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-xl border-t-4 border-brand bg-paper p-0 text-ink shadow-2xl backdrop:bg-slate-950/60"
      ref={dialogRef}
      role="dialog"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
        } else {
          trapDialogFocus(event);
        }
      }}
      onCancel={(event) => event.preventDefault()}
    >
      <div className="p-5 sm:p-6">
        <p className="text-sm font-medium text-brand">指定日期營業資訊</p>
        <h2 className="mt-1 text-xl font-semibold" id="no-business-info-title">
          11 月 28 日不提供一般營業資訊
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft" id="no-business-info-description">
          請選擇其他日期後繼續查看清單。
        </p>

        <div className="mt-5 rounded-lg border border-rule bg-paper p-4">
          <DateSelector id="replacement-date" inputRef={dateInputRef} label="改選其他日期" value={date} onChange={onSelectDate} />
          <p className="mt-2 text-xs leading-5 text-ink-soft">必須選擇 2026/10/01～2026/12/31 之間、且不是 2026/11/28 的日期。</p>
        </div>

        <section aria-labelledby="suppressed-date-events-title" className="mt-5 space-y-3">
          <h3 className="font-semibold" id="suppressed-date-events-title">本日列車運行資訊</h3>
          <p className="text-sm leading-6 text-ink-soft">列車運行不受一般營業資訊限制，仍可查看。</p>
          {events.map((event) => <ScheduledEventCard date={date} event={event} key={event.id} />)}
        </section>

        <Image
          alt="銀魂漫畫：我是來地獄掀起革命的。"
          className="mt-5 h-auto w-full rounded-md"
          height={640}
          src="/1128.jpg"
          unoptimized
          width={913}
        />
      </div>
    </dialog>
  );
};

export default NoBusinessInfoDateDialog;
