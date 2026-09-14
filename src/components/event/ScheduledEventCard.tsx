import { isScheduledEventServiceDate } from "@/domain/event/scheduled-event";
import type { IsoDate, ScheduledEvent } from "@/types";
import { ChevronDown } from "lucide-react";

interface ScheduledEventCardProps {
  date: IsoDate;
  event: ScheduledEvent;
}

const ScheduledEventCard = ({ date, event }: ScheduledEventCardProps) => {
  const isRunning = isScheduledEventServiceDate(event, date);

  return (
    <article className="rounded-lg border border-brand-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold leading-6 text-ink" lang="ja">
          {event.name}
        </h3>
        <span
          className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
            isRunning ? "border-brand-line bg-brand-wash text-brand-dark" : "border-rule-strong bg-paper-muted text-ink-soft"
          }`}
        >
          <span aria-hidden="true">{isRunning ? "●" : "—"}</span>
          {isRunning ? "本日運行" : "本日無運行"}
        </span>
      </div>

      {isRunning ? (
        <>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {event.segments.map((segment) => (
              <li className="rounded-md border-l-2 border-brand bg-brand-wash p-3" key={segment.id}>
                <p className="text-sm font-semibold text-ink" lang="ja">
                  {segment.label}
                </p>
                <p className="mt-1 text-base font-semibold text-ink">
                  <time dateTime={`${date}T${segment.start}:00+09:00`}>{segment.start}</time>
                  <span aria-hidden="true">–</span>
                  <time dateTime={`${date}T${segment.end}:00+09:00`}>{segment.end}</time>
                </p>
                {segment.description ? (
                  <p className="mt-2 text-sm leading-6 text-ink-soft" lang="ja">
                    {segment.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>

          {event.notices && event.notices.length > 0 ? (
            <details className="group mt-4 rounded-md text-sm text-ink-soft">
              <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 font-medium text-ink [&::-webkit-details-marker]:hidden">
                列車注意事項
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
                {event.notices.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-ink-soft">運行日只依官方逐日公告判斷，不以週末或國定假日推算。</p>
      )}
    </article>
  );
};

export default ScheduledEventCard;
