import { compareMinutes, parseClockTime, toMinutesSinceMidnight } from "@/domain/datetime/clock-time";
import { isBusinessInfoSuppressedDate } from "@/domain/event/business-info";
import { getEffectiveCloseTime } from "@/domain/schedule/get-effective-close-time";
import { getScheduleForDate } from "@/domain/schedule/get-schedule-for-date";
import type { Place, PlaceStatus, ZonedDateTimeParts } from "@/types";

const CLOSING_SOON_MINUTES = 120;
const CLOSING_VERY_SOON_MINUTES = 60;

const getOpenFixedSlotStatus = (nowMinutes: number, effectiveCloseMinutes: number): PlaceStatus => {
  const remainingMinutes = effectiveCloseMinutes - nowMinutes;

  if (remainingMinutes <= CLOSING_VERY_SOON_MINUTES) {
    return "CLOSING_VERY_SOON";
  }
  if (remainingMinutes <= CLOSING_SOON_MINUTES) {
    return "CLOSING_SOON";
  }
  return "OPEN";
};

/** Returns the marker status for a place at one event-local date and time. */
export const getPlaceStatus = (place: Place, now: ZonedDateTimeParts): PlaceStatus => {
  if (isBusinessInfoSuppressedDate(now.date)) {
    return "HIDDEN";
  }

  if (place.statusMode === "none") {
    return "HIDDEN";
  }

  const dailySchedule = getScheduleForDate(place, now.date);
  if (dailySchedule === null || dailySchedule === undefined) {
    return "CLOSED_TODAY";
  }

  const nowMinutes = toMinutesSinceMidnight(now.hours, now.minutes);

  for (const slot of dailySchedule) {
    const openMinutes = parseClockTime(slot.open);
    const comparedWithOpen = compareMinutes(nowMinutes, openMinutes);

    if (comparedWithOpen < 0) {
      return "NOT_OPEN_YET";
    }

    const effectiveClose = getEffectiveCloseTime(slot);
    if (effectiveClose === null) {
      return "OPEN_STATUS_UNCERTAIN";
    }

    const effectiveCloseMinutes = parseClockTime(effectiveClose);
    if (compareMinutes(nowMinutes, effectiveCloseMinutes) < 0) {
      return getOpenFixedSlotStatus(nowMinutes, effectiveCloseMinutes);
    }
  }

  return "CLOSED";
};

/** UI boundary: missing or invalid business information must not imply a confirmed closure. */
export const getPlaceStatusForDisplay = (place: Place, now: ZonedDateTimeParts): PlaceStatus | null => {
  try {
    if (place.statusMode === "businessHours" && !isBusinessInfoSuppressedDate(now.date)) {
      const schedule = getScheduleForDate(place, now.date);
      if (schedule === undefined || schedule?.length === 0) {
        return null;
      }
    }
    return getPlaceStatus(place, now);
  } catch {
    return null;
  }
};
