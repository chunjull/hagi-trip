import { describe, expect, it } from "vitest";

import { PLACES } from "@/data/places";
import { buildGoogleMapsUrl, formatDailySchedule, formatEventDateTime, formatTimeSlot, isValidCoordinates } from "./place-display";

describe("formatEventDateTime", () => {
  it("formats event-local parts with an explicit Japan time label", () => {
    expect(
      formatEventDateTime({
        date: "2026-10-01",
        weekday: "thu",
        hours: 9,
        minutes: 5,
      }),
    ).toBe("2026/10/01（四）09:05 JST（日本時間）");
  });
});

describe("formatTimeSlot", () => {
  it("formats a fixed time slot", () => {
    expect(formatTimeSlot({ open: "10:00", close: "18:00" })).toBe("10:00–18:00");
  });

  it("includes a labelled usable-until time", () => {
    expect(formatTimeSlot({ open: "11:00", close: "14:30", usableUntil: "14:00", usableUntilLabel: "L.O." })).toBe(
      "11:00–14:30（L.O. 14:00）",
    );
  });

  it("uses a neutral fallback when a usable-until label is absent", () => {
    expect(formatTimeSlot({ open: "09:00", close: "17:00", usableUntil: "16:30" })).toBe("09:00–17:00（最終利用 16:30）");
  });

  it("formats an open-ended time slot without inventing a close time", () => {
    expect(formatTimeSlot({ open: "10:00", close: null, closeLabel: "売り切れ次第閉店" })).toBe("10:00–売り切れ次第閉店");
  });
});

describe("formatDailySchedule", () => {
  it("distinguishes unavailable information from an explicitly closed day", () => {
    expect(formatDailySchedule(undefined)).toBe("營業資訊未提供");
    expect(formatDailySchedule(null)).toBe("今日休息");
  });

  it("formats split business hours", () => {
    expect(
      formatDailySchedule([
        { open: "09:50", close: "12:00" },
        { open: "15:00", close: "18:00" },
      ]),
    ).toBe("09:50–12:00／15:00–18:00");
  });

  it("fails safely for an invalid empty schedule", () => {
    expect(formatDailySchedule([])).toBe("營業資訊未提供");
  });
});

describe("buildGoogleMapsUrl", () => {
  it("encodes a place query in a Google Maps search URL", () => {
    const url = buildGoogleMapsUrl("萩・明倫学舎 山口県萩市");

    expect(url).not.toBeNull();
    expect(new URL(url as string).searchParams.get("query")).toBe("萩・明倫学舎 山口県萩市");
  });

  it("returns null for an empty query", () => {
    expect(buildGoogleMapsUrl("   ")).toBeNull();
  });
});

describe("isValidCoordinates", () => {
  it("accepts the coordinates of every current map place", () => {
    expect(PLACES).toHaveLength(31);
    expect(PLACES.every((place) => isValidCoordinates(place.coordinates))).toBe(true);
  });

  it("accepts finite coordinates within latitude and longitude bounds", () => {
    expect(isValidCoordinates({ lat: 34.409223, lng: 131.3972106 })).toBe(true);
  });

  it("rejects missing, non-finite, and out-of-range coordinates", () => {
    expect(isValidCoordinates(null)).toBe(false);
    expect(isValidCoordinates({ lat: Number.NaN, lng: 131 })).toBe(false);
    expect(isValidCoordinates({ lat: 91, lng: 131 })).toBe(false);
    expect(isValidCoordinates({ lat: 34, lng: -181 })).toBe(false);
  });
});
