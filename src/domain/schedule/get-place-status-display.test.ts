import { describe, expect, it } from "vitest";
import { PLACES } from "@/data/places";
import { getPlaceStatusForDisplay } from "./get-place-status";
import type { Place, ZonedDateTimeParts } from "@/types";

const now: ZonedDateTimeParts = { date: "2026-10-05", weekday: "mon", hours: 12, minutes: 0 };
const place = PLACES.find((candidate) => candidate.id === "jr-higashi-hagi")!;

describe("getPlaceStatusForDisplay", () => {
  it("preserves confirmed business and suppressed-date statuses", () => {
    expect(getPlaceStatusForDisplay(place, now)).toBe("OPEN");
    expect(getPlaceStatusForDisplay(place, { ...now, date: "2026-11-28", weekday: "sat" })).toBe("HIDDEN");
  });

  it("does not declare a closure for missing business information", () => {
    expect(getPlaceStatusForDisplay({ ...place, schedule: undefined }, now)).toBeNull();
    const emptySchedule: Place = { ...place, schedule: { weekly: { ...place.schedule!.weekly, mon: [] } } };
    expect(getPlaceStatusForDisplay(emptySchedule, now)).toBeNull();
  });

  it("still reports an explicit closed day", () => {
    const closed: Place = { ...place, schedule: { weekly: { ...place.schedule!.weekly, mon: null } } };
    expect(getPlaceStatusForDisplay(closed, now)).toBe("CLOSED_TODAY");
  });

  it("contains invalid schedules instead of crashing the UI", () => {
    const invalid: Place = { ...place, schedule: { weekly: { ...place.schedule!.weekly, mon: [{ open: "99:00", close: "17:00" }] } } };
    expect(getPlaceStatusForDisplay(invalid, now)).toBeNull();
  });

  it("does not require a schedule for accommodation or stations without status", () => {
    expect(getPlaceStatusForDisplay({ ...place, statusMode: "none", schedule: undefined }, now)).toBe("HIDDEN");
  });
});
