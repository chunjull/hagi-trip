import { describe, expect, it } from "vitest";

import type { BusinessSchedule, Place } from "@/types";
import { getPlaceDayInfo } from "./get-place-day-info";

const makePlace = (schedule?: BusinessSchedule): Place => ({
  id: "test-place",
  name: "Test Place",
  category: "shop",
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
});
