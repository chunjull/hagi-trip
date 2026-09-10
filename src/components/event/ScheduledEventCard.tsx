import { isScheduledEventServiceDate } from "@/domain/event/scheduled-event";
import type { IsoDate, ScheduledEvent } from "@/types";

interface ScheduledEventCardProps {
  date: IsoDate;
  event: ScheduledEvent;
}

const ScheduledEventCard = ({ date, event }: ScheduledEventCardProps) => {
  const isRunning = isScheduledEventServiceDate(event, date);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold leading-6 text-slate-950" lang="ja">
          {event.name}
        </h3>
        <span
          className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
            isRunning ? "border-sky-300 bg-sky-50 text-sky-950" : "border-slate-300 bg-slate-100 text-slate-700"
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
              <li className="rounded-xl bg-slate-50 p-3" key={segment.id}>
                <p className="text-sm font-semibold text-slate-950" lang="ja">
                  {segment.label}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <time dateTime={`${date}T${segment.start}:00+09:00`}>{segment.start}</time>
                  <span aria-hidden="true">–</span>
                  <time dateTime={`${date}T${segment.end}:00+09:00`}>{segment.end}</time>
                </p>
                {segment.description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600" lang="ja">
                    {segment.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>

          {event.notices && event.notices.length > 0 ? (
            <details className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <summary className="min-h-8 cursor-pointer font-medium text-slate-900">列車注意事項</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
                {event.notices.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">運行日只依官方逐日公告判斷，不以週末或國定假日推算。</p>
      )}
    </article>
  );
};

export default ScheduledEventCard;
