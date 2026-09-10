import { describe, expect, it } from "vitest";

import { formatAvailabilityDateRanges } from "./feature-display";

describe("formatAvailabilityDateRanges", () => {
  it("compacts consecutive dates while preserving isolated dates", () => {
    expect(formatAvailabilityDateRanges(["2026-10-11", "2026-10-09", "2026-10-10", "2026-10-18"])).toBe(
      "2026/10/09～2026/10/11、2026/10/18",
    );
  });

  it("deduplicates dates and handles an empty official list", () => {
    expect(formatAvailabilityDateRanges(["2026-10-09", "2026-10-09"])).toBe("2026/10/09");
    expect(formatAvailabilityDateRanges([])).toBe("官方未列出指定日期");
  });
});
