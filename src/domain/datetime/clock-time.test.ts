import { describe, expect, it } from "vitest";

import { compareMinutes, parseClockTime, toMinutesSinceMidnight } from "./clock-time";

describe("parseClockTime", () => {
  it.each([
    ["00:00", 0],
    ["09:50", 590],
    ["23:59", 1439],
  ])("converts %s to minutes since midnight", (value, expected) => {
    expect(parseClockTime(value)).toBe(expected);
  });

  it.each(["9:00", "09:0", "24:00", "12:60", " 09:00", "09:00 ", "invalid"])("rejects invalid input %s", (value) => {
    expect(() => parseClockTime(value)).toThrow(RangeError);
  });
});

describe("toMinutesSinceMidnight", () => {
  it("converts event-local time parts without reading the device time zone", () => {
    expect(toMinutesSinceMidnight(16, 30)).toBe(990);
  });

  it.each([
    [-1, 0],
    [24, 0],
    [10, -1],
    [10, 60],
    [10.5, 0],
  ])("rejects invalid parts %s:%s", (hours, minutes) => {
    expect(() => toMinutesSinceMidnight(hours, minutes)).toThrow(RangeError);
  });
});

describe("compareMinutes", () => {
  it("returns -1, 0, or 1 for earlier, equal, or later values", () => {
    expect(compareMinutes(599, 600)).toBe(-1);
    expect(compareMinutes(600, 600)).toBe(0);
    expect(compareMinutes(601, 600)).toBe(1);
  });

  it.each([
    [-1, 0],
    [1440, 0],
    [0, Number.NaN],
  ])("rejects invalid minute values %s and %s", (left, right) => {
    expect(() => compareMinutes(left, right)).toThrow(RangeError);
  });
});
