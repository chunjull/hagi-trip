import { describe, expect, it } from "vitest";

import type { BusinessSchedule, Place, PlaceFeature } from "@/types";
import { getPlaceDayInfo } from "./get-place-day-info";

const makePlace = (schedule?: BusinessSchedule): Place => ({
  id: "test-place",
  name: "Test Place",
  category: "transport",
  address: "Test Address",
  coordinates: null,
  mapQuery: "Test Place",
  statusMode: "businessHours",
  schedule,
  sources: [],
});

const REGULAR_SCHEDULE: NonNullable<Place["schedule"]> = {
  weekly: {
    sun: null,
    mon: [{ open: "10:00", close: "18:00" }],
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
  },
  overrides: {
    "2026-10-05": [{ open: "11:00", close: "16:00" }],
    "2026-10-12": null,
  },
};

describe("getPlaceDayInfo", () => {
  it("returns the selected date schedule without live marker states", () => {
    expect(getPlaceDayInfo(makePlace(REGULAR_SCHEDULE), "2026-10-19")).toEqual({
      kind: "OPEN_TODAY",
      schedule: [{ open: "10:00", close: "18:00" }],
      isOverride: false,
    });
  });

  it("marks an explicit special-hours override", () => {
    expect(getPlaceDayInfo(makePlace(REGULAR_SCHEDULE), "2026-10-05")).toEqual({
      kind: "OPEN_TODAY",
      schedule: [{ open: "11:00", close: "16:00" }],
      isOverride: true,
    });
  });

  it("preserves an explicit closed override", () => {
    expect(getPlaceDayInfo(makePlace(REGULAR_SCHEDULE), "2026-10-12")).toEqual({
      kind: "CLOSED_TODAY",
      isOverride: true,
    });
  });

  it("reports a weekly closed day", () => {
    expect(getPlaceDayInfo(makePlace(REGULAR_SCHEDULE), "2026-10-06")).toEqual({
      kind: "CLOSED_TODAY",
      isOverride: false,
    });
  });

  it("does not call a statusMode none place closed", () => {
    const place = {
      ...makePlace(REGULAR_SCHEDULE),
      statusMode: "none" as const,
    };

    expect(getPlaceDayInfo(place, "2026-10-05")).toEqual({
      kind: "BUSINESS_INFO_UNAVAILABLE",
      isOverride: false,
    });
  });

  it("fails safely when business schedule data is missing", () => {
    expect(getPlaceDayInfo(makePlace(undefined), "2026-10-05")).toEqual({
      kind: "BUSINESS_INFO_UNAVAILABLE",
      isOverride: false,
    });
  });

  describe("feature availability", () => {
    const makeFeature = (overrides: Partial<PlaceFeature> = {}): PlaceFeature => ({
      id: "test-feature",
      title: "Test Feature",
      kind: "food",
      schedule: REGULAR_SCHEDULE,
      ...overrides,
    });

    const placeWithFeatures = (...features: PlaceFeature[]): Place => ({
      ...makePlace(REGULAR_SCHEDULE),
      features,
    });

    it.each([
      ["a weekly closed day", { schedule: { weekly: { ...REGULAR_SCHEDULE.weekly, mon: null } } }],
      ["a closed date override", { schedule: { ...REGULAR_SCHEDULE, overrides: { "2026-10-19": null } } }],
      ["an empty daily schedule", { schedule: { weekly: { ...REGULAR_SCHEDULE.weekly, mon: [] } } }],
      ["a date outside the listed availability", { availabilityDates: ["2026-10-05"] }],
      ["an upcoming feature", { activePeriod: { start: "2026-10-20", end: "2026-12-31" } }],
      ["an ended feature", { activePeriod: { start: "2026-10-01", end: "2026-10-18" } }],
    ] satisfies [string, Partial<PlaceFeature>][])("reports partial closure for %s", (_, overrides) => {
      const place = placeWithFeatures(makeFeature({ id: "open-feature" }), makeFeature(overrides));

      expect(getPlaceDayInfo(place, "2026-10-19")).toEqual({
        kind: "PARTIALLY_CLOSED_TODAY",
        schedule: [{ open: "10:00", close: "18:00" }],
        isOverride: false,
      });
    });

    it("keeps open status when all features are available", () => {
      const place = placeWithFeatures(makeFeature(), makeFeature({ availabilityDates: ["2026-10-19"] }));

      expect(getPlaceDayInfo(place, "2026-10-19").kind).toBe("OPEN_TODAY");
    });

    it("does not infer closure from missing feature schedules", () => {
      const place = placeWithFeatures(makeFeature({ schedule: undefined }), makeFeature({ schedule: undefined }));

      expect(getPlaceDayInfo(place, "2026-10-19").kind).toBe("OPEN_TODAY");
    });

    it("only applies partial closure to places with multiple features", () => {
      const place = placeWithFeatures(makeFeature({ availabilityDates: [] }));

      expect(getPlaceDayInfo(place, "2026-10-19").kind).toBe("OPEN_TODAY");
    });

    it("keeps the facility closed status when features are unavailable", () => {
      const place = placeWithFeatures(makeFeature(), makeFeature());

      expect(getPlaceDayInfo(place, "2026-10-12")).toEqual({ kind: "CLOSED_TODAY", isOverride: true });
    });

    it("preserves the facility special-hours override during partial closure", () => {
      const place = placeWithFeatures(makeFeature(), makeFeature({ availabilityDates: [] }));

      expect(getPlaceDayInfo(place, "2026-10-05")).toEqual({
        kind: "PARTIALLY_CLOSED_TODAY",
        schedule: [{ open: "11:00", close: "16:00" }],
        isOverride: true,
      });
    });

    it("keeps statusMode none places outside business status judgments", () => {
      const place = { ...placeWithFeatures(makeFeature(), makeFeature({ availabilityDates: [] })), statusMode: "none" as const };

      expect(getPlaceDayInfo(place, "2026-10-19").kind).toBe("BUSINESS_INFO_UNAVAILABLE");
    });
  });
});
