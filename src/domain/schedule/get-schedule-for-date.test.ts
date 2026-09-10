import { describe, expect, it } from "vitest";

import type { BusinessSchedule, ClockTime, DailySchedule, IsoDate } from "@/types";
import { getScheduleForDate } from "./get-schedule-for-date";

const slot = (open: ClockTime, close: ClockTime) => [{ open, close }];

const REGULAR_MONDAY = slot("09:00", "17:00");
const OVERRIDE_MONDAY = slot("10:00", "16:00");

const makeSchedule = (overrides?: Partial<Record<IsoDate, DailySchedule>>): BusinessSchedule => ({
  weekly: {
    sun: null,
    mon: REGULAR_MONDAY,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
  },
  overrides,
});

describe("getScheduleForDate", () => {
  it("returns a date override before the weekly schedule", () => {
    const place = {
      schedule: makeSchedule({
        "2026-10-05": OVERRIDE_MONDAY,
      }),
    };

    expect(getScheduleForDate(place, "2026-10-05")).toBe(OVERRIDE_MONDAY);
  });

  it("preserves a null override instead of falling back to weekly hours", () => {
    const place = {
      schedule: makeSchedule({
        "2026-10-05": null,
      }),
    };

    expect(getScheduleForDate(place, "2026-10-05")).toBeNull();
  });

  it("returns the weekly schedule when no override exists", () => {
    const place = { schedule: makeSchedule() };

    expect(getScheduleForDate(place, "2026-10-05")).toBe(REGULAR_MONDAY);
  });

  it("preserves a null weekly schedule for a closed day", () => {
    const place = { schedule: makeSchedule() };

    expect(getScheduleForDate(place, "2026-10-06")).toBeNull();
  });

  it("returns undefined when the place has no business schedule", () => {
    expect(getScheduleForDate({}, "2026-10-05")).toBeUndefined();
  });

  it.each(["2026-2-03", "2026-02-30", "invalid"])("rejects invalid ISO date %s", (date) => {
    expect(() => getScheduleForDate({ schedule: makeSchedule() }, date as IsoDate)).toThrow(RangeError);
  });
});
