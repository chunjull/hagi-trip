import { describe, expect, it } from "vitest";
import { getSiteLocalNow, getSiteMode } from "./site-time";

describe("automatic archive mode", () => {
  it("stays live through the final millisecond of December 31 in Taiwan", () => {
    const referenceTime = new Date("2026-12-31T23:59:59.999+08:00");
    expect(getSiteMode(referenceTime)).toEqual({ type: "live" });
    expect(getSiteLocalNow(referenceTime)).toMatchObject({ date: "2027-01-01", hours: 0, minutes: 59 });
  });

  it.each(["2027-01-01T00:00:00+08:00", "2026-12-31T16:00:00Z", "2030-06-01T00:00:00Z"])("freezes the map after the Taiwan cutoff: %s", (timestamp) => {
    const referenceTime = new Date(timestamp);
    expect(getSiteMode(referenceTime)).toEqual({ type: "archive", frozenDateTime: "2026-10-10T10:10:00+09:00" });
    expect(getSiteLocalNow(referenceTime)).toEqual({ date: "2026-10-10", weekday: "sat", hours: 10, minutes: 10 });
  });

  it("preserves a manually configured archive time", () => {
    const mode = { type: "archive", frozenDateTime: "2026-10-05T17:00:00+09:00" } as const;
    expect(getSiteMode(new Date("2030-01-01T00:00:00Z"), mode)).toEqual(mode);
  });

  it("rejects an invalid reference instant", () => {
    expect(() => getSiteMode(new Date("invalid"))).toThrow();
  });
});

describe("getSiteLocalNow", () => {
  it("uses the supplied instant in live mode", () => {
    expect(getSiteLocalNow(new Date("2026-10-01T15:00:00Z"), { type: "live" })).toMatchObject({ date: "2026-10-02", hours: 0, minutes: 0 });
  });

  it("freezes Japan local time regardless of the current instant", () => {
    const mode = { type: "archive", frozenDateTime: "2026-10-05T17:00:00+09:00" } as const;
    const expected = { date: "2026-10-05", weekday: "mon", hours: 17, minutes: 0 };
    expect(getSiteLocalNow(new Date("2027-01-01T00:00:00Z"), mode)).toEqual(expected);
    expect(getSiteLocalNow(new Date("2030-06-01T00:00:00Z"), mode)).toEqual(expected);
  });

  it("converts UTC archive timestamps using JST", () => {
    expect(getSiteLocalNow(new Date(), { type: "archive", frozenDateTime: "2026-10-01T15:00:00Z" })).toMatchObject({ date: "2026-10-02", hours: 0 });
  });

  it.each(["invalid", "2026-10-01T17:00:00", "2026-02-30T17:00:00+09:00", "2026-10-01T99:00:00Z"])("rejects invalid archive time %s without a live fallback", (frozenDateTime) => {
    expect(() => getSiteLocalNow(new Date(), { type: "archive", frozenDateTime })).toThrow();
  });
});
