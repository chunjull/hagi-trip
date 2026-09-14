import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PLACES } from "@/data/places";
import { getPlaceDayInfo } from "@/domain/schedule/get-place-day-info";
import PlaceListItem from "./PlaceListItem";

describe("PlaceListItem without business status", () => {
  it.each(["casa-inn-iseya", "jr-hagi"])("keeps collaboration details accessible for %s", (id) => {
    const place = PLACES.find((candidate) => candidate.id === id)!;
    const markup = renderToStaticMarkup(<PlaceListItem date="2026-10-09" info={getPlaceDayInfo(place, "2026-10-09")} place={place} />);
    expect(markup).toContain(place.features![0].title);
    expect(markup).not.toContain("當日營業");
    expect(markup).not.toContain("所選日期有提供");
  });
});
