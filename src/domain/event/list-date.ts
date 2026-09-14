import { SITE_CONFIG } from "@/data/site-config";
import { getSiteLocalNow, getSiteMode } from "@/domain/datetime/site-time";
import { isBusinessInfoSuppressedDate } from "@/domain/event/business-info";
import type { IsoDate } from "@/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a real YYYY-MM-DD calendar date without falling back to local time. */
export const parseIsoDate = (value: string | null | undefined): IsoDate | null => {
  if (!value || !ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return value as IsoDate;
};

export const isDateInEventPeriod = (date: IsoDate): boolean =>
  date >= SITE_CONFIG.eventPeriod.start && date <= SITE_CONFIG.eventPeriod.end;

export const clampDateToEventPeriod = (date: IsoDate): IsoDate => {
  if (date < SITE_CONFIG.eventPeriod.start) {
    return SITE_CONFIG.eventPeriod.start;
  }

  if (date > SITE_CONFIG.eventPeriod.end) {
    return SITE_CONFIG.eventPeriod.end;
  }

  return date;
};

/** Uses the event-local date and keeps the initial selection inside the event period. */
export const getDefaultListDate = (referenceTime: Date = new Date()): IsoDate =>
  clampDateToEventPeriod(getSiteLocalNow(referenceTime).date);

export const getInitialListDate = (queryDate: string | null | undefined, referenceTime: Date = new Date()): IsoDate => {
  if (getSiteMode(referenceTime).type === "archive") {
    return getDefaultListDate(referenceTime);
  }

  const parsedQueryDate = parseIsoDate(queryDate);

  if (parsedQueryDate && isDateInEventPeriod(parsedQueryDate)) {
    return parsedQueryDate;
  }

  return getDefaultListDate(referenceTime);
};

export const isSelectableBusinessDate = (date: IsoDate): boolean =>
  isDateInEventPeriod(date) && !isBusinessInfoSuppressedDate(date);
