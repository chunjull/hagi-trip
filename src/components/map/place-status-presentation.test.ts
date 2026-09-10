import { describe, expect, it } from "vitest";

import type { PlaceStatus } from "@/types";
import { getPlaceStatusPresentation, PLACE_STATUS_PRESENTATION } from "./place-status-presentation";

const ALL_STATUSES: PlaceStatus[] = [
  "OPEN",
  "CLOSING_SOON",
  "CLOSING_VERY_SOON",
  "NOT_OPEN_YET",
  "OPEN_STATUS_UNCERTAIN",
  "CLOSED",
  "CLOSED_TODAY",
  "HIDDEN",
];

describe("place status presentation", () => {
  it("defines text, a symbol, and color classes for every status", () => {
    expect(Object.keys(PLACE_STATUS_PRESENTATION)).toEqual(ALL_STATUSES);

    for (const status of ALL_STATUSES) {
      const presentation = getPlaceStatusPresentation(status);

      expect(presentation.label).not.toBe("");
      expect(presentation.symbol).not.toBe("");
      expect(presentation.className).not.toBe("");
    }
  });

  it("does not imply a confirmed open state for an uncertain status", () => {
    const presentation = getPlaceStatusPresentation("OPEN_STATUS_UNCERTAIN");

    expect(presentation.label).toBe("狀態需現場／官方確認");
    expect(presentation.className).not.toMatch(/emerald|amber|orange/);
  });
});
