import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PLACES } from "@/data/places";
import type { Place, PlaceFeature } from "@/types";
import PlaceFeatureList from "./PlaceFeatureList";

const getPlace = (id: string): Place => {
  const place = PLACES.find((candidate) => candidate.id === id);

  if (!place) {
    throw new Error(`Missing test place: ${id}`);
  }

  return place;
};

const renderFeatures = (placeId: string, date: "2026-09-13" | "2026-10-01" | "2026-10-02" | "2026-10-09"): string => {
  const place = getPlace(placeId);
  return renderToStaticMarkup(<PlaceFeatureList date={date} features={place.features ?? []} />);
};

describe("PlaceFeatureList", () => {
  it("renders the airport shop split schedule from feature data", () => {
    expect(renderFeatures("hagi-iwami-airport", "2026-10-01")).toContain("09:50–12:00／15:00–18:00");
  });

  it("can render a feature schedule on the home page before the collaboration starts", () => {
    const place = getPlace("hagi-iwami-airport");
    const defaultMarkup = renderFeatures("hagi-iwami-airport", "2026-09-13");
    const homeMarkup = renderToStaticMarkup(
      <PlaceFeatureList date="2026-09-13" features={place.features ?? []} scheduleMode="always" />,
    );

    expect(defaultMarkup).not.toContain("09:50–12:00／15:00–18:00");
    expect(homeMarkup).toContain("聯名內容尚未開始");
    expect(homeMarkup).toMatch(/<dt\b[^>]*>提供時間<\/dt>/);
    expect(homeMarkup).toContain("09:50–12:00／15:00–18:00");
  });

  it("renders the shrine final admission and kimono return details", () => {
    expect(renderFeatures("shoin-jinja", "2026-10-01")).toContain("最終入館 16:30");

    const kimonoMarkup = renderFeatures("former-kubota-family-residence", "2026-10-01");
    expect(kimonoMarkup).toContain("所選日期有提供");
    expect(kimonoMarkup).toContain("着物の返却は16:30まで");
  });

  it("does not present a feature schedule on an unlisted availability date", () => {
    const markup = renderFeatures("former-kubota-family-residence", "2026-10-02");
    expect(markup).toContain("所選日期未提供");
    expect(markup).not.toContain("本日提供時間");
  });

  it("shows listed lodging dates and omits date information when unspecified", () => {
    const listedFeature: PlaceFeature = { id: "test-lodging", title: "Test lodging", kind: "lodging", availabilityDates: ["2026-10-09"] };
    expect(renderToStaticMarkup(<PlaceFeatureList date="2026-10-09" features={[listedFeature]} />)).toContain("所選日期有提供");
    const unspecifiedMarkup = renderFeatures("hagi-honjin", "2026-10-09");
    expect(unspecifiedMarkup).toContain("コラボ宿泊プラン");
    expect(unspecifiedMarkup).not.toContain("官方活動資料未列出此方案的指定住宿日");
    expect(unspecifiedMarkup).not.toContain("官方指定合作日");
    expect(unspecifiedMarkup).not.toContain("所選日期有提供");
    expect(unspecifiedMarkup).not.toContain("所選日期未提供");
    const casaMarkup = renderFeatures("casa-inn-iseya", "2026-10-09");
    expect(casaMarkup).not.toContain("官方指定合作日");
    expect(casaMarkup).toContain("完売");
  });

  it("renders the support-store common benefit from static feature data", () => {
    const markup = renderFeatures("restaurant-matsuoka", "2026-10-01");
    expect(markup).toContain("コラボ協力店舗 共通購入特典");
    expect(markup).toContain("会計2,000円（税込）ごとに");
  });
});
