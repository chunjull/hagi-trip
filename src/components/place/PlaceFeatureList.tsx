import BusinessHours from "@/components/place/BusinessHours";
import CollaborationStateBadge from "@/components/place/CollaborationStateBadge";
import { FEATURE_KIND_LABELS, FEATURE_KIND_ICONS, formatAvailabilityDateRanges } from "@/components/place/feature-display";
import { SITE_CONFIG } from "@/data/site-config";
import { getCollaborationState } from "@/domain/event/collaboration";
import { getAvailabilityDateState, isFeatureDateApplicable } from "@/domain/event/feature-availability";
import { getScheduleForDate } from "@/domain/schedule/get-schedule-for-date";
import type { DailySchedule, IsoDate, PlaceFeature } from "@/types";

interface PlaceFeatureListProps {
  businessInfoSuppressed?: boolean;
  date: IsoDate;
  features: readonly PlaceFeature[];
  scheduleMode?: "applicableDate" | "always";
}

const getFeatureScheduleSafely = (feature: PlaceFeature, date: IsoDate): DailySchedule | undefined => {
  try {
    return getScheduleForDate(feature, date);
  } catch {
    return undefined;
  }
};

const PlaceFeatureList = ({ businessInfoSuppressed = false, date, features, scheduleMode = "applicableDate" }: PlaceFeatureListProps) => (
  <ul className="space-y-3">
    {features.map((feature) => {
      const collaborationState = getCollaborationState(feature, date);
      const availabilityDateState = getAvailabilityDateState(feature, date);
      const shouldShowSchedule = !businessInfoSuppressed && feature.schedule !== undefined && (scheduleMode === "always" || isFeatureDateApplicable(feature, date));
      const featureSchedule = shouldShowSchedule ? getFeatureScheduleSafely(feature, date) : undefined;
      const activePeriod = feature.activePeriod ?? SITE_CONFIG.eventPeriod;
      const Icon = FEATURE_KIND_ICONS[feature.kind];

      return (
        <li className="rounded-lg border border-rule bg-white p-4" key={feature.id}>
          <div className="pb-1">
            <div className="flex space-x-1">
              {Icon ? <Icon aria-hidden="true" className="size-4 text-ink-muted" /> : null}
              <p className="text-xs font-medium text-ink-muted">{FEATURE_KIND_LABELS[feature.kind]}</p>
            </div>
            <h4 className="mt-1 font-semibold leading-6 text-ink" lang="ja">
              {feature.title}
            </h4>
          </div>
          <CollaborationStateBadge state={collaborationState} />

          {feature.activePeriod ? (
            <p className="mt-3 text-xs leading-5 text-ink-soft">
              提供期間：<time dateTime={activePeriod.start}>{activePeriod.start.replaceAll("-", "/")}</time>
              <span aria-hidden="true">～</span>
              <time dateTime={activePeriod.end}>{activePeriod.end.replaceAll("-", "/")}</time>
            </p>
          ) : null}

          {feature.description ? (
            <p className="mt-2 text-sm leading-6 text-ink-soft" lang="ja">
              {feature.description}
            </p>
          ) : null}

          {feature.availabilityDates !== undefined && (
            <div className="mt-3 rounded-md bg-paper p-3">
              <p className="text-xs font-medium text-ink-muted">官方指定合作日</p>
              <p className="mt-1 text-sm leading-6 text-ink">{formatAvailabilityDateRanges(feature.availabilityDates)}</p>
              {collaborationState === "ACTIVE" ? (
                <p className={`mt-2 text-xs font-semibold ${availabilityDateState === "LISTED" ? "text-emerald-800" : "text-ink-soft"}`}>
                  <span aria-hidden="true">{availabilityDateState === "LISTED" ? "● " : "— "}</span>
                  {availabilityDateState === "LISTED" ? "所選日期有提供" : "所選日期未提供"}
                </p>
              ) : null}
            </div>
          )}

          {shouldShowSchedule ? (
            <dl className="mt-3 rounded-md bg-brand-wash/80 p-3">
              <BusinessHours label={scheduleMode === "always" ? "提供時間" : "本日提供時間"} schedule={featureSchedule} />
            </dl>
          ) : null}

          {collaborationState === "ACTIVE" && availabilityDateState === "NOT_LISTED" ? <p className="mt-3 text-sm leading-6 text-ink-soft">此聯名內容不在所選日期提供。</p> : null}

          {feature.notices && feature.notices.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
              {feature.notices.map((notice) => (
                <li key={notice} lang="ja">
                  {notice}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      );
    })}
  </ul>
);

export default PlaceFeatureList;
