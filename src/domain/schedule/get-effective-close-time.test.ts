import { describe, expect, it } from "vitest";

import type { TimeSlot } from "@/types";
import { getEffectiveCloseTime } from "./get-effective-close-time";

describe("getEffectiveCloseTime", () => {
  it("returns close for a fixed slot without usableUntil", () => {
    const slot: TimeSlot = {
      open: "10:00",
      close: "18:00",
    };

    expect(getEffectiveCloseTime(slot)).toBe("18:00");
  });

  it("prefers usableUntil over the facility close time", () => {
    const slot: TimeSlot = {
      open: "11:00",
      close: "14:30",
      usableUntil: "14:00",
      usableUntilLabel: "L.O.",
    };

    expect(getEffectiveCloseTime(slot)).toBe("14:00");
  });

  it("returns null for an open-ended slot", () => {
    const slot: TimeSlot = {
      open: "10:00",
      close: null,
      closeLabel: "売り切れ次第閉店",
    };

    expect(getEffectiveCloseTime(slot)).toBeNull();
  });
});
