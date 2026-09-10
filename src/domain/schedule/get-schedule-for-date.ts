import type { DailySchedule, IsoDate, Place, WeekdayKey } from "@/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS: readonly WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type ScheduleOwner = Pick<Place, "schedule">;

const getWeekdayForIsoDate = (date: IsoDate): WeekdayKey => {
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new RangeError(`Invalid ISO date "${date}"; expected YYYY-MM-DD.`);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError(`Invalid ISO date "${date}"; expected a real calendar date.`);
  }

  return WEEKDAYS[parsed.getUTCDay()];
};

/**
 * Resolves a place's schedule for one calendar date.
 * A date override takes precedence even when its value is null (explicitly closed).
 */
export const getScheduleForDate = (place: ScheduleOwner, date: IsoDate): DailySchedule | undefined => {
  const schedule = place.schedule;

  if (!schedule) {
    return undefined;
  }

  if (schedule.overrides && Object.prototype.hasOwnProperty.call(schedule.overrides, date)) {
    return schedule.overrides[date];
  }

  return schedule.weekly[getWeekdayForIsoDate(date)];
};
