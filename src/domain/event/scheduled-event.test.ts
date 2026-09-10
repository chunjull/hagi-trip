import { describe, expect, it } from "vitest";

import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import type { ScheduledEvent } from "@/types";
import {
  getScheduledEventsForDate,
  getScheduledEventsForPlace,
  getScheduledEventsRelatedToPlace,
  isScheduledEventServiceDate,
} from "./scheduled-event";

const TRAIN_EVENT = SCHEDULED_EVENTS[0];

describe("isScheduledEventServiceDate", () => {
  it("returns true only for an explicitly listed service date", () => {
    expect(isScheduledEventServiceDate(TRAIN_EVENT, "2026-10-03")).toBe(true);
    expect(isScheduledEventServiceDate(TRAIN_EVENT, "2026-11-28")).toBe(true);
  });

  it("returns false for a date inside activePeriod that is not listed", () => {
    expect(isScheduledEventServiceDate(TRAIN_EVENT, "2026-10-05")).toBe(false);
  });

  it("does not infer service from a weekend rule", () => {
    const eventWithoutWeekendService: ScheduledEvent = {
      ...TRAIN_EVENT,
      serviceDates: ["2026-10-05"],
    };

    expect(isScheduledEventServiceDate(eventWithoutWeekendService, "2026-10-03")).toBe(false);
  });
});

describe("getScheduledEventsForDate", () => {
  it("returns events that explicitly run on the selected date", () => {
    expect(getScheduledEventsForDate("2026-10-03")).toEqual([TRAIN_EVENT]);
    expect(getScheduledEventsForDate("2026-11-28")).toEqual([TRAIN_EVENT]);
  });

  it("returns an empty list on a non-service date", () => {
    expect(getScheduledEventsForDate("2026-10-05")).toEqual([]);
  });
});

describe("getScheduledEventsForPlace", () => {
  it("returns a running event related to the selected place", () => {
    expect(getScheduledEventsForPlace("jr-hagi", "2026-10-03")).toEqual([TRAIN_EVENT]);
    expect(getScheduledEventsForPlace("jr-higashi-hagi", "2026-11-28")).toEqual([TRAIN_EVENT]);
  });

  it("returns an empty list for an unrelated place or non-service date", () => {
    expect(getScheduledEventsForPlace("hagi-meirin-gakusha", "2026-10-03")).toEqual([]);
    expect(getScheduledEventsForPlace("jr-hagi", "2026-10-05")).toEqual([]);
  });
});

describe("getScheduledEventsRelatedToPlace", () => {
  it("returns related definitions without requiring a service date", () => {
    expect(getScheduledEventsRelatedToPlace("jr-hagi")).toEqual([TRAIN_EVENT]);
    expect(getScheduledEventsRelatedToPlace("jr-higashi-hagi")).toEqual([TRAIN_EVENT]);
    expect(getScheduledEventsRelatedToPlace("hagi-meirin-gakusha")).toEqual([]);
  });
});
