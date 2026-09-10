import { describe, expect, it } from "vitest";

import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import { isBusinessInfoSuppressedDate } from "./business-info";
import { isScheduledEventServiceDate } from "./scheduled-event";

describe("isBusinessInfoSuppressedDate", () => {
  it("suppresses ordinary business information on 2026-11-28", () => {
    expect(isBusinessInfoSuppressedDate("2026-11-28")).toBe(true);
  });

  it("does not suppress adjacent dates", () => {
    expect(isBusinessInfoSuppressedDate("2026-11-27")).toBe(false);
    expect(isBusinessInfoSuppressedDate("2026-11-29")).toBe(false);
  });

  it("leaves the scheduled train service data available on the suppressed date", () => {
    const hasService = SCHEDULED_EVENTS.some((event) => isScheduledEventServiceDate(event, "2026-11-28"));

    expect(hasService).toBe(true);
  });
});
