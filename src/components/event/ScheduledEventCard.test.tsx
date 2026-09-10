import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SCHEDULED_EVENTS } from "@/data/scheduled-events";
import ScheduledEventCard from "./ScheduledEventCard";

const TRAIN_EVENT = SCHEDULED_EVENTS[0];

describe("ScheduledEventCard", () => {
  it("keeps the explicitly listed 11/28 train service visible", () => {
    const markup = renderToStaticMarkup(<ScheduledEventCard date="2026-11-28" event={TRAIN_EVENT} />);

    expect(markup).toContain("本日運行");
    expect(markup).toContain("12:51");
    expect(markup).toContain("14:16");
  });

  it("states that the train does not run instead of silently hiding it", () => {
    const markup = renderToStaticMarkup(<ScheduledEventCard date="2026-10-05" event={TRAIN_EVENT} />);

    expect(markup).toContain("本日無運行");
    expect(markup).not.toContain("12:51");
  });
});
