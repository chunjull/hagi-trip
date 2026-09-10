import { describe, expect, it } from "vitest";

import type { BusinessSchedule, Place, ScheduledEvent } from "@/types";
import { validateProjectData, validateStaticData } from "./validate-data";

const OPEN_EVERY_DAY: BusinessSchedule = {
  weekly: {
    sun: [{ open: "10:00", close: "18:00" }],
    mon: [{ open: "10:00", close: "18:00" }],
    tue: [{ open: "10:00", close: "18:00" }],
    wed: [{ open: "10:00", close: "18:00" }],
    thu: [{ open: "10:00", close: "18:00" }],
    fri: [{ open: "10:00", close: "18:00" }],
    sat: [{ open: "10:00", close: "18:00" }],
  },
};

const makePlace = (overrides: Partial<Place> = {}): Place => ({
  id: "test-place",
  name: "Test Place",
  category: "attraction",
  address: "Test Address",
  coordinates: null,
  mapQuery: "Test Place",
  statusMode: "businessHours",
  schedule: OPEN_EVERY_DAY,
  sources: [{ label: "Test source", url: "https://example.com/place" }],
  ...overrides,
});

const makeEvent = (overrides: Partial<ScheduledEvent> = {}): ScheduledEvent => ({
  id: "test-event",
  name: "Test Event",
  activePeriod: { start: "2026-10-01", end: "2026-10-31" },
  relatedPlaceIds: ["test-place"],
  serviceDates: ["2026-10-10"],
  segments: [
    {
      id: "test-segment",
      label: "Test segment",
      startPlaceId: "test-place",
      endPlaceId: "test-place",
      start: "12:00",
      end: "12:10",
    },
  ],
  sources: [{ label: "Test source", url: "https://example.com/event" }],
  ...overrides,
});

const makeData = (places: Place[] = [makePlace()], scheduledEvents: ScheduledEvent[] = [makeEvent()]) => ({
  places,
  scheduledEvents,
  siteConfig: {
    eventPeriod: { start: "2026-10-01", end: "2026-12-31" } as const,
    businessInfoSuppressedDates: ["2026-11-28"] as const,
  },
});

describe("validateProjectData", () => {
  it("accepts the current project data", () => {
    expect(() => validateProjectData()).not.toThrow();
  });
});

describe("validateStaticData", () => {
  it("rejects duplicate place ids", () => {
    const place = makePlace();
    expect(() => validateStaticData(makeData([place, { ...place }], []))).toThrow(/duplicate place id/);
  });

  it("rejects invalid business hours", () => {
    const invalidSchedule: BusinessSchedule = {
      ...OPEN_EVERY_DAY,
      weekly: {
        ...OPEN_EVERY_DAY.weekly,
        mon: [{ open: "10:00", close: "25:00" as never }],
      },
    };

    expect(() => validateStaticData(makeData([makePlace({ schedule: invalidSchedule })], []))).toThrow(/invalid clock time/);
  });

  it("rejects out-of-range coordinates", () => {
    expect(() => validateStaticData(makeData([makePlace({ coordinates: { lat: 91, lng: 181 } })], []))).toThrow(/latitude must be between/);
  });

  it("allows coordinates to remain null", () => {
    expect(() => validateStaticData(makeData([makePlace({ coordinates: null })], []))).not.toThrow();
  });

  it("rejects service dates outside an event active period", () => {
    const event = makeEvent({ serviceDates: ["2026-11-01"] });
    expect(() => validateStaticData(makeData([makePlace()], [event]))).toThrow(/service date must stay within/);
  });

  it("rejects scheduled-event references to unknown places", () => {
    const event = makeEvent({ relatedPlaceIds: ["missing-place"] });
    expect(() => validateStaticData(makeData([makePlace()], [event]))).toThrow(/unknown place id/);
  });
});
