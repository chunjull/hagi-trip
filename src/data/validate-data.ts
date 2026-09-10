import { PLACES } from "@/data/places";
import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import { SITE_CONFIG } from "@/data/site-config";
import type { BusinessSchedule, DateRange, IsoDate, Place, ScheduledEvent, SourceRef, TimeSlot, WeekdayKey } from "@/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAYS: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

interface ValidationSiteConfig {
  eventPeriod: DateRange;
  businessInfoSuppressedDates: readonly IsoDate[];
}

export interface StaticDataInput {
  places: readonly Place[];
  scheduledEvents: readonly ScheduledEvent[];
  siteConfig: ValidationSiteConfig;
}

export class StaticDataValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Static data validation failed:\n- ${issues.join("\n- ")}`);
    this.name = "StaticDataValidationError";
    this.issues = issues;
  }
}

const isValidIsoDate = (value: string): value is IsoDate => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};

const parseClockTime = (value: string, path: string, issues: string[]): number | null => {
  if (!CLOCK_TIME_PATTERN.test(value)) {
    issues.push(`${path}: invalid clock time "${value}"; expected HH:mm.`);
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const isDateWithin = (date: IsoDate, range: DateRange): boolean => date >= range.start && date <= range.end;

const validateDate = (value: string, path: string, issues: string[]): value is IsoDate => {
  if (!isValidIsoDate(value)) {
    issues.push(`${path}: invalid ISO date "${value}"; expected a real YYYY-MM-DD date.`);
    return false;
  }

  return true;
};

const validateDateRange = (range: DateRange, path: string, issues: string[], containingRange?: DateRange): void => {
  const startIsValid = validateDate(range.start, `${path}.start`, issues);
  const endIsValid = validateDate(range.end, `${path}.end`, issues);

  if (!startIsValid || !endIsValid) {
    return;
  }

  if (range.start > range.end) {
    issues.push(`${path}: start must not be later than end.`);
  }

  if (containingRange && (!isDateWithin(range.start, containingRange) || !isDateWithin(range.end, containingRange))) {
    issues.push(`${path}: range must stay within the site event period.`);
  }
};

const validateUniqueValues = (values: readonly string[], path: string, issues: string[]): void => {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      issues.push(`${path}: duplicate value "${value}".`);
    }
    seen.add(value);
  }
};

const validateSources = (sources: readonly SourceRef[], path: string, issues: string[]): void => {
  if (sources.length === 0) {
    issues.push(`${path}: at least one source is required.`);
  }

  sources.forEach((source, index) => {
    const sourcePath = `${path}[${index}]`;

    if (!source.label.trim()) {
      issues.push(`${sourcePath}.label: source label must not be empty.`);
    }

    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        issues.push(`${sourcePath}.url: source URL must use HTTP or HTTPS.`);
      }
    } catch {
      issues.push(`${sourcePath}.url: invalid URL "${source.url}".`);
    }
  });
};

const validateTimeSlots = (slots: readonly TimeSlot[], path: string, issues: string[]): void => {
  if (slots.length === 0) {
    issues.push(`${path}: use null for a closed day instead of an empty slot array.`);
    return;
  }

  let previousClose: number | null = null;

  slots.forEach((timeSlot, index) => {
    const slotPath = `${path}[${index}]`;
    const open = parseClockTime(timeSlot.open, `${slotPath}.open`, issues);

    if (open !== null && previousClose !== null && open < previousClose) {
      issues.push(`${slotPath}: time slots must be ordered and must not overlap.`);
    }

    if (timeSlot.close === null) {
      if (!timeSlot.closeLabel.trim()) {
        issues.push(`${slotPath}.closeLabel: an open-ended slot requires a label.`);
      }
      if (index !== slots.length - 1) {
        issues.push(`${slotPath}: an open-ended slot must be the final slot of the day.`);
      }
      previousClose = 24 * 60;
      return;
    }

    const close = parseClockTime(timeSlot.close, `${slotPath}.close`, issues);

    if (open !== null && close !== null && open >= close) {
      issues.push(`${slotPath}: open time must be earlier than close time.`);
    }

    if (timeSlot.usableUntil !== undefined) {
      const usableUntil = parseClockTime(timeSlot.usableUntil, `${slotPath}.usableUntil`, issues);
      if (open !== null && close !== null && usableUntil !== null && (usableUntil < open || usableUntil > close)) {
        issues.push(`${slotPath}.usableUntil: value must be between open and close.`);
      }
    }

    previousClose = close;
  });
};

const validateSchedule = (schedule: BusinessSchedule, path: string, eventPeriod: DateRange, issues: string[]): void => {
  for (const weekday of WEEKDAYS) {
    if (!Object.prototype.hasOwnProperty.call(schedule.weekly, weekday)) {
      issues.push(`${path}.weekly: missing weekday "${weekday}".`);
      continue;
    }

    const dailySchedule = schedule.weekly[weekday];
    if (dailySchedule !== null) {
      validateTimeSlots(dailySchedule, `${path}.weekly.${weekday}`, issues);
    }
  }

  for (const [date, dailySchedule] of Object.entries(schedule.overrides ?? {})) {
    if (validateDate(date, `${path}.overrides`, issues) && !isDateWithin(date, eventPeriod)) {
      issues.push(`${path}.overrides.${date}: override date must stay within the site event period.`);
    }
    if (dailySchedule !== null && dailySchedule !== undefined) {
      validateTimeSlots(dailySchedule, `${path}.overrides.${date}`, issues);
    }
  }
};

const validatePlaces = (places: readonly Place[], eventPeriod: DateRange, issues: string[]): Set<string> => {
  const placeIds = new Set<string>();

  places.forEach((place, placeIndex) => {
    const path = `places[${placeIndex}](${place.id || "missing-id"})`;

    if (!place.id.trim()) {
      issues.push(`${path}.id: place id must not be empty.`);
    } else if (placeIds.has(place.id)) {
      issues.push(`${path}.id: duplicate place id "${place.id}".`);
    }
    placeIds.add(place.id);

    if (place.statusMode === "businessHours" && !place.schedule) {
      issues.push(`${path}.schedule: businessHours places require a schedule.`);
    }
    if (place.statusMode === "none" && place.schedule) {
      issues.push(`${path}.schedule: statusMode "none" must not define a marker schedule.`);
    }
    if (place.schedule) {
      validateSchedule(place.schedule, `${path}.schedule`, eventPeriod, issues);
    }

    if (place.coordinates !== null) {
      const { lat, lng } = place.coordinates;
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        issues.push(`${path}.coordinates.lat: latitude must be between -90 and 90.`);
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        issues.push(`${path}.coordinates.lng: longitude must be between -180 and 180.`);
      }
    }

    validateSources(place.sources, `${path}.sources`, issues);

    const featureIds = new Set<string>();
    for (const feature of place.features ?? []) {
      const featurePath = `${path}.features(${feature.id || "missing-id"})`;

      if (!feature.id.trim()) {
        issues.push(`${featurePath}.id: feature id must not be empty.`);
      } else if (featureIds.has(feature.id)) {
        issues.push(`${featurePath}.id: duplicate feature id "${feature.id}" within place "${place.id}".`);
      }
      featureIds.add(feature.id);

      if (feature.activePeriod) {
        validateDateRange(feature.activePeriod, `${featurePath}.activePeriod`, issues, eventPeriod);
      }
      if (feature.schedule) {
        validateSchedule(feature.schedule, `${featurePath}.schedule`, eventPeriod, issues);
      }
      if (feature.availabilityDates) {
        validateUniqueValues(feature.availabilityDates, `${featurePath}.availabilityDates`, issues);
        feature.availabilityDates.forEach((date, dateIndex) => {
          if (!validateDate(date, `${featurePath}.availabilityDates[${dateIndex}]`, issues)) {
            return;
          }
          if (!isDateWithin(date, eventPeriod)) {
            issues.push(`${featurePath}.availabilityDates[${dateIndex}]: date must stay within the site event period.`);
          }
          if (feature.activePeriod && !isDateWithin(date, feature.activePeriod)) {
            issues.push(`${featurePath}.availabilityDates[${dateIndex}]: date must stay within the feature active period.`);
          }
        });
      }
    }
  });

  return placeIds;
};

const validateScheduledEvents = (events: readonly ScheduledEvent[], placeIds: ReadonlySet<string>, eventPeriod: DateRange, issues: string[]): void => {
  const eventIds = new Set<string>();

  events.forEach((event, eventIndex) => {
    const path = `scheduledEvents[${eventIndex}](${event.id || "missing-id"})`;

    if (!event.id.trim()) {
      issues.push(`${path}.id: scheduled event id must not be empty.`);
    } else if (eventIds.has(event.id)) {
      issues.push(`${path}.id: duplicate scheduled event id "${event.id}".`);
    }
    eventIds.add(event.id);

    validateDateRange(event.activePeriod, `${path}.activePeriod`, issues, eventPeriod);
    validateUniqueValues(event.relatedPlaceIds, `${path}.relatedPlaceIds`, issues);
    validateUniqueValues(event.serviceDates, `${path}.serviceDates`, issues);
    validateSources(event.sources, `${path}.sources`, issues);

    for (const placeId of event.relatedPlaceIds) {
      if (!placeIds.has(placeId)) {
        issues.push(`${path}.relatedPlaceIds: unknown place id "${placeId}".`);
      }
    }

    event.serviceDates.forEach((date, dateIndex) => {
      if (validateDate(date, `${path}.serviceDates[${dateIndex}]`, issues) && !isDateWithin(date, event.activePeriod)) {
        issues.push(`${path}.serviceDates[${dateIndex}]: service date must stay within the scheduled event active period.`);
      }
      if (dateIndex > 0 && date < event.serviceDates[dateIndex - 1]) {
        issues.push(`${path}.serviceDates: dates must be sorted in ascending order.`);
      }
    });

    const segmentIds = new Set<string>();
    event.segments.forEach((segment, segmentIndex) => {
      const segmentPath = `${path}.segments[${segmentIndex}](${segment.id || "missing-id"})`;

      if (!segment.id.trim()) {
        issues.push(`${segmentPath}.id: segment id must not be empty.`);
      } else if (segmentIds.has(segment.id)) {
        issues.push(`${segmentPath}.id: duplicate segment id "${segment.id}" within event "${event.id}".`);
      }
      segmentIds.add(segment.id);

      for (const [field, placeId] of [
        ["startPlaceId", segment.startPlaceId],
        ["endPlaceId", segment.endPlaceId],
      ] as const) {
        if (!placeIds.has(placeId)) {
          issues.push(`${segmentPath}.${field}: unknown place id "${placeId}".`);
        } else if (!event.relatedPlaceIds.includes(placeId)) {
          issues.push(`${segmentPath}.${field}: place id "${placeId}" must also appear in relatedPlaceIds.`);
        }
      }

      const start = parseClockTime(segment.start, `${segmentPath}.start`, issues);
      const end = parseClockTime(segment.end, `${segmentPath}.end`, issues);
      if (start !== null && end !== null && start >= end) {
        issues.push(`${segmentPath}: start time must be earlier than end time.`);
      }
    });
  });
};

export const validateStaticData = ({ places, scheduledEvents, siteConfig }: StaticDataInput): void => {
  const issues: string[] = [];

  validateDateRange(siteConfig.eventPeriod, "siteConfig.eventPeriod", issues);
  validateUniqueValues(siteConfig.businessInfoSuppressedDates, "siteConfig.businessInfoSuppressedDates", issues);

  siteConfig.businessInfoSuppressedDates.forEach((date, index) => {
    if (validateDate(date, `siteConfig.businessInfoSuppressedDates[${index}]`, issues) && !isDateWithin(date, siteConfig.eventPeriod)) {
      issues.push(`siteConfig.businessInfoSuppressedDates[${index}]: date must stay within the site event period.`);
    }
  });

  const placeIds = validatePlaces(places, siteConfig.eventPeriod, issues);
  validateScheduledEvents(scheduledEvents, placeIds, siteConfig.eventPeriod, issues);

  if (issues.length > 0) {
    throw new StaticDataValidationError(issues);
  }
};

export const validateProjectData = (): void => {
  validateStaticData({
    places: PLACES,
    scheduledEvents: SCHEDULED_EVENTS,
    siteConfig: SITE_CONFIG,
  });
};
