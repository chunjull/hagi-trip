import { describe, expect, it } from "vitest";

import {
  clampDateToEventPeriod,
  getDefaultListDate,
  getInitialListDate,
  isDateInEventPeriod,
  isSelectableBusinessDate,
  parseIsoDate,
} from "./list-date";

describe("parseIsoDate", () => {
  it("accepts normalized real calendar dates", () => {
    expect(parseIsoDate("2026-10-01")).toBe("2026-10-01");
  });

  it.each([null, undefined, "", "2026-2-01", "2026-02-30", "invalid"])("rejects invalid input %s", (value) => {
    expect(parseIsoDate(value)).toBeNull();
  });
});

describe("event list date range", () => {
  it("recognizes both event boundaries", () => {
    expect(isDateInEventPeriod("2026-10-01")).toBe(true);
    expect(isDateInEventPeriod("2026-12-31")).toBe(true);
    expect(isDateInEventPeriod("2027-01-01")).toBe(false);
  });

  it("clamps dates before and after the event", () => {
    expect(clampDateToEventPeriod("2026-09-30")).toBe("2026-10-01");
    expect(clampDateToEventPeriod("2027-01-01")).toBe("2026-12-31");
  });
});

describe("getDefaultListDate", () => {
  it("uses the first event date before the event", () => {
    expect(getDefaultListDate(new Date("2026-09-30T14:59:00.000Z"))).toBe("2026-10-01");
  });

  it("uses the current event-local date during the event", () => {
    expect(getDefaultListDate(new Date("2026-10-17T15:30:00.000Z"))).toBe("2026-10-18");
  });

  it("uses the frozen date after the Taiwan cutoff", () => {
    expect(getDefaultListDate(new Date("2027-01-01T00:00:00.000Z"))).toBe("2026-10-10");
  });
});

describe("getInitialListDate", () => {
  const beforeEvent = new Date("2026-09-01T00:00:00.000Z");

  it("uses a valid in-range query date", () => {
    expect(getInitialListDate("2026-11-28", beforeEvent)).toBe("2026-11-28");
  });

  it("falls back for invalid and out-of-range query dates", () => {
    expect(getInitialListDate("invalid", beforeEvent)).toBe("2026-10-01");
    expect(getInitialListDate("2027-01-01", beforeEvent)).toBe("2026-10-01");
  });

  it("still accepts a selected date immediately before the Taiwan cutoff", () => {
    expect(getInitialListDate("2026-11-28", new Date("2026-12-31T23:59:59.999+08:00"))).toBe("2026-11-28");
  });

  it.each([null, "2026-10-18", "2026-11-28", "invalid"])("locks the archive date regardless of query %s", (queryDate) => {
    expect(getInitialListDate(queryDate, new Date("2027-01-01T00:00:00+08:00"))).toBe("2026-10-10");
  });
});

describe("isSelectableBusinessDate", () => {
  it("excludes the suppressed date while accepting adjacent event dates", () => {
    expect(isSelectableBusinessDate("2026-11-27")).toBe(true);
    expect(isSelectableBusinessDate("2026-11-28")).toBe(false);
    expect(isSelectableBusinessDate("2026-11-29")).toBe(true);
  });
});
