"use client";

import { useEffect, useRef } from "react";

import ScheduledEventCard from "@/components/event/ScheduledEventCard";
import { trapDialogFocus } from "@/components/layout/dialog-focus";
import BusinessHours from "@/components/place/BusinessHours";
import PlaceFeatureList from "@/components/place/PlaceFeatureList";
import { buildGoogleMapsUrl } from "@/components/place/place-display";
import PlaceStatusBadge from "@/components/place/PlaceStatusBadge";
import SupportStoreBadge from "@/components/place/SupportStoreBadge";
import { getPlaceNumber } from "@/components/place/place-number";
import { getScheduledEventsRelatedToPlace } from "@/domain/event/scheduled-event";
import { getScheduleForDate } from "@/domain/schedule/get-schedule-for-date";
import type { BusinessSchedule, DailySchedule, IsoDate, Place, PlaceStatus, ZonedDateTimeParts } from "@/types";
import { Navigation, X } from "lucide-react";

interface PlaceDetailSheetProps {
  businessInfoSuppressed: boolean;
  now: ZonedDateTimeParts | null;
  onClosed: () => void;
  place: Place | null;
  status: PlaceStatus | null;
}

interface ScheduleOwner {
  schedule?: BusinessSchedule;
}

const getScheduleSafely = (owner: ScheduleOwner, date: IsoDate): DailySchedule | undefined => {
  try {
    return getScheduleForDate(owner, date);
  } catch {
    return undefined;
  }
};

const PlaceDetailSheet = ({ businessInfoSuppressed, now, onClosed, place, status }: PlaceDetailSheetProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!place) {
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
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [place]);

  const mapUrl = place ? buildGoogleMapsUrl(place.mapQuery) : null;
  const placeSchedule = place && now && !businessInfoSuppressed ? getScheduleSafely(place, now.date) : undefined;
  const relatedEvents = place ? getScheduledEventsRelatedToPlace(place.id) : [];

  return (
    <dialog
      aria-labelledby="place-detail-title"
      aria-modal="true"
      className="fixed inset-x-0 bottom-0 top-auto m-0 h-[85dvh] max-h-[85dvh] w-full max-w-none overflow-hidden rounded-t-xl border-t-2 border-t-brand bg-paper p-0 text-ink shadow-2xl backdrop:bg-slate-950/55 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-full sm:w-[min(30rem,100vw)] sm:rounded-none"
      ref={dialogRef}
      onKeyDown={trapDialogFocus}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
      onClose={onClosed}
    >
      {place ? (
        <article className="flex h-full min-h-0 flex-col">
          <header className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-brand-line bg-paper px-5 py-4">
            <div>
              <p className="handbook-eyebrow">銀魂曆 · 景點 {getPlaceNumber(place.id)}</p>
              <h2 className="mt-1 text-xl font-semibold leading-tight" id="place-detail-title" lang="ja">
                {place.name}
              </h2>
              {place.isCollabSupportStore ? (
                <div className="mt-2">
                  <SupportStoreBadge />
                </div>
              ) : null}
            </div>
            <button
              aria-label={`關閉 ${place.name} 詳細資訊`}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-line bg-white text-xl font-medium text-brand hover:bg-brand-wash focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
              ref={closeButtonRef}
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {businessInfoSuppressed ? (
                <p className="rounded-md border border-brand-line bg-brand-wash px-4 py-3 text-sm leading-6 text-brand-dark">本日不提供一般營業狀態與當日營業時間，請向各設施官方確認。</p>
              ) : place.statusMode === "none" ? (
                <p className="rounded-md bg-paper-muted px-4 py-3 text-sm leading-6 text-ink-soft">此地點不提供即時營業狀態。</p>
              ) : status === null ? (
                <p className="rounded-md bg-paper-muted px-4 py-3 text-sm leading-6 text-ink-soft">營業狀態暫時無法判斷。</p>
              ) : (
                <PlaceStatusBadge status={status} />
              )}

              <dl className="grid gap-4 rounded-lg border border-rule bg-paper p-4">
                <div>
                  <dt className="text-xs font-medium text-ink-muted">地址</dt>
                  <dd className="mt-1 text-sm leading-6" lang="ja">
                    {place.address}
                  </dd>
                </div>

                {!businessInfoSuppressed && place.statusMode === "businessHours" && now ? <BusinessHours schedule={placeSchedule} /> : null}
              </dl>

              {place.description ? <p className="text-sm leading-7 text-ink-soft">{place.description}</p> : null}
            </div>

            {relatedEvents.length > 0 ? (
              <section aria-labelledby="place-events-title" className="mt-7">
                <h3 className="text-base font-semibold" id="place-events-title">
                  指定日期活動
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">列車運行資訊與一般營業狀態分開判斷。</p>
                {now ? (
                  <div className="mt-3 space-y-3">
                    {relatedEvents.map((event) => (
                      <ScheduledEventCard date={now.date} event={event} key={event.id} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-md bg-paper-muted px-3 py-2 text-sm text-ink-soft">無法取得日本當地日期，暫時不能判斷本日是否運行。</p>
                )}
              </section>
            ) : null}

            {place.features && place.features.length > 0 ? (
              <section aria-labelledby="place-features-title" className="mt-7">
                <h3 className="text-base font-semibold" id="place-features-title">
                  聯名內容
                </h3>
                {now ? (
                  <div className="mt-3">
                    <PlaceFeatureList businessInfoSuppressed={businessInfoSuppressed} date={now.date} features={place.features} scheduleMode="always" />
                  </div>
                ) : (
                  <p className="mt-3 rounded-md bg-paper-muted px-3 py-2 text-sm text-ink-soft">無法取得日本當地日期，暫時不能判斷聯名內容狀態。</p>
                )}
              </section>
            ) : null}

            {place.notices && place.notices.length > 0 ? (
              <section aria-labelledby="place-notices-title" className="mt-7 rounded-lg bg-amber-50 p-4 text-amber-950">
                <h3 className="text-sm font-semibold" id="place-notices-title">
                  注意事項
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                  {place.notices.map((notice) => (
                    <li key={notice}>{notice}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="place-sources-title" className="mt-7">
              <h3 className="text-sm font-semibold" id="place-sources-title">
                資料來源
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {place.sources.map((source) => (
                  <li key={`${source.label}-${source.url}`}>
                    <a
                      className="inline-flex min-h-11 items-center text-brand underline decoration-brand-line underline-offset-4 hover:text-brand-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      href={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {source.label}
                      <span className="sr-only">（新分頁）</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <footer className="shrink-0 border-t border-brand-line bg-paper px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {mapUrl ? (
              <a
                className="flex min-h-12 w-full items-center justify-center rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
                href={mapUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                在 Google Maps 開啟<span className="sr-only">{place.name}（新分頁）</span>
                <Navigation className="size-4 ml-2" />
              </a>
            ) : (
              <p className="rounded-md bg-paper-muted px-4 py-3 text-center text-sm text-ink-soft">地圖連結暫時無法使用。</p>
            )}
          </footer>
        </article>
      ) : null}
    </dialog>
  );
};

export default PlaceDetailSheet;
