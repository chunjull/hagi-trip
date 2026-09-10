import { describe, expect, it } from "vitest";
import { getEventLocalNow } from "./event-time";

describe("validateFunction", () => {
  it("converts an instant to Japan local time", () => {
    expect(getEventLocalNow(new Date("2026-10-01T07:30:00Z"))).toEqual({
      date: "2026-10-01",
      weekday: "thu",
      hours: 16,
      minutes: 30,
    });
  });

  it("handles the Japan midnight boundary", () => {
    expect(getEventLocalNow(new Date("2026-10-01T15:00:00Z"))).toEqual({
      date: "2026-10-02",
      weekday: "fri",
      hours: 0,
      minutes: 0,
    });
  });

  it("keeps the previous date before Japan midnight", () => {
    expect(getEventLocalNow(new Date("2026-10-01T14:59:00Z"))).toEqual({
      date: "2026-10-01",
      weekday: "thu",
      hours: 23,
      minutes: 59,
    });
  });

  it("throws for an invalid Date", () => {
    expect(() => getEventLocalNow(new Date("invalid"))).toThrow();
  });
});
