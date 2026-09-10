import { describe, expect, it } from "vitest";

import type { BusinessSchedule, DailySchedule, IsoDate, Place, WeekdayKey, ZonedDateTimeParts } from "@/types";
import { getPlaceStatus } from "./get-place-status";

const allDays = (dailySchedule: DailySchedule): BusinessSchedule => ({
  weekly: {
    sun: dailySchedule,
    mon: dailySchedule,
    tue: dailySchedule,
    wed: dailySchedule,
    thu: dailySchedule,
    fri: dailySchedule,
    sat: dailySchedule,
  },
});

const makePlace = (schedule?: BusinessSchedule, statusMode: Place["statusMode"] = "businessHours"): Place => ({
  id: "test-place",
  name: "Test Place",
  category: "attraction",
  address: "Test Address",
  coordinates: null,
  mapQuery: "Test Place",
  statusMode,
  schedule,
  sources: [{ label: "Test source", url: "https://example.com/place" }],
});

const at = (hours: number, minutes: number, date: IsoDate = "2026-10-05", weekday: WeekdayKey = "mon"): ZonedDateTimeParts => ({
  date,
  weekday,
  hours,
  minutes,
});

describe("getPlaceStatus", () => {
  describe("fixed business hours", () => {
    const place = makePlace(allDays([{ open: "10:00", close: "18:00" }]));

    it.each([
      [9, 59, "NOT_OPEN_YET"],
      [10, 0, "OPEN"],
      [15, 59, "OPEN"],
      [16, 0, "CLOSING_SOON"],
      [17, 0, "CLOSING_VERY_SOON"],
      [17, 59, "CLOSING_VERY_SOON"],
      [18, 0, "CLOSED"],
    ] as const)("returns %s:%s as %s", (hours, minutes, expected) => {
      expect(getPlaceStatus(place, at(hours, minutes))).toBe(expected);
    });
  });

  it("returns CLOSED_TODAY for an explicit weekly null", () => {
    const schedule = allDays([{ open: "10:00", close: "18:00" }]);
    schedule.weekly.tue = null;

    expect(getPlaceStatus(makePlace(schedule), at(12, 0, "2026-10-06", "tue"))).toBe("CLOSED_TODAY");
  });

  it("uses usableUntil as the effective close boundary", () => {
    const place = makePlace(
      allDays([
        {
          open: "11:00",
          close: "14:30",
          usableUntil: "14:00",
          usableUntilLabel: "L.O.",
        },
      ]),
    );

    expect(getPlaceStatus(place, at(13, 59))).toBe("CLOSING_VERY_SOON");
    expect(getPlaceStatus(place, at(14, 0))).toBe("CLOSED");
  });

  it("uses a date override before regular weekly hours", () => {
    const schedule = allDays([{ open: "09:00", close: "17:00" }]);
    schedule.overrides = {
      "2026-12-29": [{ open: "10:00", close: "16:00" }],
    };

    expect(getPlaceStatus(makePlace(schedule), at(9, 30, "2026-12-29", "tue"))).toBe("NOT_OPEN_YET");
  });

  describe("split schedule", () => {
    const place = makePlace(
      allDays([
        { open: "09:50", close: "12:00" },
        { open: "15:00", close: "18:00" },
      ]),
    );

    it.each([
      [9, 55, "OPEN"],
      [13, 0, "NOT_OPEN_YET"],
      [15, 30, "OPEN"],
      [18, 0, "CLOSED"],
    ] as const)("returns %s:%s as %s", (hours, minutes, expected) => {
      expect(getPlaceStatus(place, at(hours, minutes))).toBe(expected);
    });
  });

  describe("open-ended slot", () => {
    const schedule = allDays([{ open: "10:00", close: null, closeLabel: "売り切れ次第閉店" }]);
    const place = makePlace(schedule);

    it("is not open before the start time", () => {
      expect(getPlaceStatus(place, at(9, 59))).toBe("NOT_OPEN_YET");
    });

    it("is uncertain from the start time onward", () => {
      expect(getPlaceStatus(place, at(10, 0))).toBe("OPEN_STATUS_UNCERTAIN");
      expect(getPlaceStatus(place, at(18, 0))).toBe("OPEN_STATUS_UNCERTAIN");
    });

    it("is closed on an explicit closed day", () => {
      const closedDaySchedule = allDays([{ open: "10:00", close: null, closeLabel: "売り切れ次第閉店" }]);
      closedDaySchedule.weekly.tue = null;

      expect(getPlaceStatus(makePlace(closedDaySchedule), at(12, 0, "2026-10-06", "tue"))).toBe("CLOSED_TODAY");
    });
  });

  it("returns HIDDEN when the place does not use business-hour status", () => {
    expect(getPlaceStatus(makePlace(undefined, "none"), at(12, 0))).toBe("HIDDEN");
  });

  it("returns HIDDEN for an ordinary business-hours place on 2026-11-28", () => {
    const place = makePlace(allDays([{ open: "10:00", close: "18:00" }]));

    expect(getPlaceStatus(place, at(12, 0, "2026-11-28", "sat"))).toBe("HIDDEN");
  });

  it("does not crash when a business-hours place has no schedule", () => {
    expect(getPlaceStatus(makePlace(), at(12, 0))).toBe("CLOSED_TODAY");
  });
});
