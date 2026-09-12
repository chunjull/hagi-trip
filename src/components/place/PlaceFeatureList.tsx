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
      const shouldShowSchedule =
        !businessInfoSuppressed &&
        feature.schedule !== undefined &&
        (scheduleMode === "always" || isFeatureDateApplicable(feature, date));
      const featureSchedule = shouldShowSchedule ? getFeatureScheduleSafely(feature, date) : undefined;
      const activePeriod = feature.activePeriod ?? SITE_CONFIG.eventPeriod;
      const Icon = FEATURE_KIND_ICONS[feature.kind];

      return (
        <li className="rounded-2xl border border-slate-200 bg-white p-4" key={feature.id}>
          <div className="pb-1">
            <div className="flex space-x-1">
              {Icon ? <Icon aria-hidden="true" className="size-4 text-slate-500" /> : null}
              <p className="text-xs font-medium text-slate-500">{FEATURE_KIND_LABELS[feature.kind]}</p>
            </div>
            <h4 className="mt-1 font-semibold leading-6 text-slate-950" lang="ja">
              {feature.title}
            </h4>
          </div>
          <CollaborationStateBadge state={collaborationState} />

          {feature.activePeriod ? (
            <p className="mt-3 text-xs leading-5 text-slate-600">
              提供期間：<time dateTime={activePeriod.start}>{activePeriod.start.replaceAll("-", "/")}</time>
              <span aria-hidden="true">～</span>
              <time dateTime={activePeriod.end}>{activePeriod.end.replaceAll("-", "/")}</time>
            </p>
          ) : null}

          {feature.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-700" lang="ja">
              {feature.description}
            </p>
          ) : null}

          {feature.availabilityDates !== undefined ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">官方指定合作日</p>
              <p className="mt-1 text-sm leading-6 text-slate-800">{formatAvailabilityDateRanges(feature.availabilityDates)}</p>
              {collaborationState === "ACTIVE" ? (
                <p className={`mt-2 text-xs font-semibold ${availabilityDateState === "LISTED" ? "text-emerald-800" : "text-slate-700"}`}>
                  <span aria-hidden="true">{availabilityDateState === "LISTED" ? "● " : "— "}</span>
                  {availabilityDateState === "LISTED" ? "所選日期有提供" : "所選日期未提供"}
                </p>
              ) : null}
            </div>
          ) : feature.kind === "lodging" ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">官方活動資料未列出此方案的指定住宿日，預訂前請向住宿設施確認。</p>
          ) : null}

          {shouldShowSchedule ? (
            <dl className="mt-3 rounded-xl bg-slate-50 p-3">
              <BusinessHours label={scheduleMode === "always" ? "提供時間" : "本日提供時間"} schedule={featureSchedule} />
            </dl>
          ) : null}

          {collaborationState === "ACTIVE" && availabilityDateState === "NOT_LISTED" ? <p className="mt-3 text-sm leading-6 text-slate-600">此聯名內容不在所選日期提供。</p> : null}

          {feature.notices && feature.notices.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
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
