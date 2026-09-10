import { EVENT_TIME_ZONE } from "@/data/site-config";
import type { IsoDate, WeekdayKey, ZonedDateTimeParts } from "@/types";

const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const toWeekdayKey = (weekday: string): WeekdayKey => {
  switch (weekday) {
    case "Sun":
      return "sun";
    case "Mon":
      return "mon";
    case "Tue":
      return "tue";
    case "Wed":
      return "wed";
    case "Thu":
      return "thu";
    case "Fri":
      return "fri";
    case "Sat":
      return "sat";
    default:
      throw new Error(`Unknown weekday returned by Intl: ${weekday}`);
  }
};

const readPart = (parts: Intl.DateTimeFormatPart[], type: "year" | "month" | "day" | "weekday" | "hour" | "minute"): string => {
  const value = parts.find((part) => part.type === type)?.value;

  if (value === undefined) {
    throw new Error(`Missing "${type}" while formatting event time.`);
  }

  return value;
};

export const getEventLocalNow = (referenceTime: Date = new Date()): ZonedDateTimeParts => {
  if (Number.isNaN(referenceTime.getTime())) {
    throw new RangeError("Cannot convert an invalid Date to event time.");
  }

  const parts = formatter.formatToParts(referenceTime);

  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");
  const weekday = toWeekdayKey(readPart(parts, "weekday"));
  const hours = Number(readPart(parts, "hour"));
  const minutes = Number(readPart(parts, "minute"));

  if (!Number.isInteger(hours) || hours < 0 || hours > 23 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new Error("Intl returned an invalid event-local time.");
  }

  return {
    date: `${year}-${month}-${day}` as IsoDate,
    weekday,
    hours,
    minutes,
  };
};
