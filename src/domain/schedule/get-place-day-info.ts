import { isFeatureDateApplicable } from "@/domain/event/feature-availability";
import { getScheduleForDate } from "@/domain/schedule/get-schedule-for-date";
import type { IsoDate, Place, TimeSlot } from "@/types";

export type PlaceDayInfo =
  | {
      kind: "OPEN_TODAY" | "PARTIALLY_CLOSED_TODAY";
      schedule: TimeSlot[];
      isOverride: boolean;
    }
  | {
      kind: "CLOSED_TODAY";
      isOverride: boolean;
    }
  | {
      kind: "BUSINESS_INFO_UNAVAILABLE";
      isOverride: false;
    };

/** Returns date-only availability for the list page; it intentionally has no live closing-soon states. */
export const getPlaceDayInfo = (place: Place, date: IsoDate): PlaceDayInfo => {
  if (place.statusMode === "none" || !place.schedule) {
    return {
      kind: "BUSINESS_INFO_UNAVAILABLE",
      isOverride: false,
    };
  }

  const isOverride = Boolean(place.schedule.overrides && Object.prototype.hasOwnProperty.call(place.schedule.overrides, date));
  const dailySchedule = getScheduleForDate(place, date);

  if (dailySchedule === null) {
    return {
      kind: "CLOSED_TODAY",
      isOverride,
    };
  }

  if (dailySchedule === undefined || dailySchedule.length === 0) {
    return {
      kind: "BUSINESS_INFO_UNAVAILABLE",
      isOverride: false,
    };
  }

  const hasUnavailableFeature = Boolean(
    place.features &&
      place.features.length > 1 &&
      place.features.some((feature) => {
        if (!isFeatureDateApplicable(feature, date)) {
          return true;
        }

        const featureSchedule = getScheduleForDate(feature, date);
        return featureSchedule === null || featureSchedule?.length === 0;
      }),
  );

  return {
    kind: hasUnavailableFeature ? "PARTIALLY_CLOSED_TODAY" : "OPEN_TODAY",
    schedule: dailySchedule,
    isOverride,
  };
};
