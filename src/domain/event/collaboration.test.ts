import { describe, expect, it } from "vitest";

import { getCollaborationState } from "./collaboration";

describe("getCollaborationState", () => {
  const collaboration = {
    activePeriod: {
      start: "2026-10-01",
      end: "2026-10-18",
    },
  } as const;

  it("returns UPCOMING before the active period", () => {
    expect(getCollaborationState(collaboration, "2026-09-30")).toBe("UPCOMING");
  });

  it("includes both active-period boundaries", () => {
    expect(getCollaborationState(collaboration, "2026-10-01")).toBe("ACTIVE");
    expect(getCollaborationState(collaboration, "2026-10-18")).toBe("ACTIVE");
  });

  it("returns ENDED after the active period", () => {
    expect(getCollaborationState(collaboration, "2026-10-19")).toBe("ENDED");
  });

  it("uses the site event period when activePeriod is omitted", () => {
    expect(getCollaborationState({}, "2026-09-30")).toBe("UPCOMING");
    expect(getCollaborationState({}, "2026-10-01")).toBe("ACTIVE");
    expect(getCollaborationState({}, "2026-12-31")).toBe("ACTIVE");
    expect(getCollaborationState({}, "2027-01-01")).toBe("ENDED");
  });
});
