import { describe, expect, it } from "vitest";

import type { PlaceFeature } from "@/types";
import { getAvailabilityDateState, isFeatureDateApplicable } from "./feature-availability";

describe("getAvailabilityDateState", () => {
  const feature = {
    availabilityDates: ["2026-10-09", "2026-10-10"],
  } as const;

  it("returns LISTED only for an explicitly listed date", () => {
    expect(getAvailabilityDateState(feature, "2026-10-09")).toBe("LISTED");
    expect(getAvailabilityDateState(feature, "2026-10-11")).toBe("NOT_LISTED");
  });

  it("does not infer availability when official dates are absent", () => {
    expect(getAvailabilityDateState({}, "2026-10-09")).toBe("NOT_SPECIFIED");
  });
});

describe("isFeatureDateApplicable", () => {
  const feature: PlaceFeature = {
    id: "limited-feature",
    title: "Limited feature",
    kind: "event",
    activePeriod: {
      start: "2026-10-01",
      end: "2026-10-18",
    },
    availabilityDates: ["2026-10-05"],
  };

  it("requires both an active collaboration period and a listed date", () => {
    expect(isFeatureDateApplicable(feature, "2026-09-30")).toBe(false);
    expect(isFeatureDateApplicable(feature, "2026-10-05")).toBe(true);
    expect(isFeatureDateApplicable(feature, "2026-10-06")).toBe(false);
    expect(isFeatureDateApplicable(feature, "2026-10-19")).toBe(false);
  });

  it("uses the collaboration period when no exact date list exists", () => {
    expect(isFeatureDateApplicable({ ...feature, availabilityDates: undefined }, "2026-10-05")).toBe(true);
  });
});
