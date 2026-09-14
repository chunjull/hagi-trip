import { SITE_CONFIG } from "@/data/site-config";
import { getEventLocalNow } from "@/domain/datetime/event-time";
import { parseClockTime } from "@/domain/datetime/clock-time";
import type { SiteMode, ZonedDateTimeParts } from "@/types";

/** Resolve the mode at runtime so static exports can automatically enter archive mode. */
export const getSiteMode = (referenceTime: Date = new Date(), configuredMode: SiteMode = SITE_CONFIG.mode): SiteMode => {
  if (!Number.isFinite(referenceTime.getTime())) {
    throw new RangeError("Site time requires a valid reference instant.");
  }

  if (configuredMode.type === "archive") {
    return configuredMode;
  }

  if (referenceTime.getTime() >= new Date(SITE_CONFIG.archive.startsAt).getTime()) {
    return { type: "archive", frozenDateTime: SITE_CONFIG.archive.frozenDateTime };
  }

  return configuredMode;
};

/** Archive timestamps must identify an instant, including an explicit timezone. */
export const getSiteLocalNow = (referenceTime: Date = new Date(), mode: SiteMode = getSiteMode(referenceTime)): ZonedDateTimeParts => {
  if (mode.type === "live") {
    return getEventLocalNow(referenceTime);
  }

  const timestamp = mode.frozenDateTime;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp)) {
    throw new RangeError("Archive frozenDateTime requires an ISO timestamp with an explicit timezone.");
  }

  const calendarDate = new Date(`${timestamp.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== timestamp.slice(0, 10)) {
    throw new RangeError("Archive frozenDateTime requires a real calendar date.");
  }

  parseClockTime(timestamp.slice(11, 16));
  if (Number(timestamp.slice(17, 19)) > 59) {
    throw new RangeError("Archive frozenDateTime requires valid seconds.");
  }

  return getEventLocalNow(new Date(timestamp));
};
