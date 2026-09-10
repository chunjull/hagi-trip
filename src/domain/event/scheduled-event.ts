import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import type { IsoDate, ScheduledEvent } from "@/types";

/**
 * Returns whether an event runs on an explicitly listed service date.
 * Weekdays, weekends, holidays, and activePeriod are intentionally not inferred.
 */
export const isScheduledEventServiceDate = (event: ScheduledEvent, date: IsoDate): boolean => event.serviceDates.includes(date);

/** Returns all scheduled events that explicitly run on a date. */
export const getScheduledEventsForDate = (date: IsoDate): ScheduledEvent[] =>
  SCHEDULED_EVENTS.filter((event) => isScheduledEventServiceDate(event, date));

/** Returns explicitly running events related to a place on a date. */
export const getScheduledEventsForPlace = (placeId: string, date: IsoDate): ScheduledEvent[] =>
  getScheduledEventsForDate(date).filter((event) => event.relatedPlaceIds.includes(placeId));
