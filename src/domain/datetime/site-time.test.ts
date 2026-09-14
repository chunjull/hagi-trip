import { describe, expect, it } from "vitest";
import { getSiteLocalNow } from "./site-time";

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
