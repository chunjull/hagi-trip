import type { Coordinates, DailySchedule, TimeSlot, WeekdayKey, ZonedDateTimeParts } from "@/types";

const WEEKDAY_LABELS = {
  sun: "日",
  mon: "一",
  tue: "二",
  wed: "三",
  thu: "四",
  fri: "五",
  sat: "六",
} satisfies Record<WeekdayKey, string>;

export const formatEventDateTime = (dateTime: ZonedDateTimeParts): string => {
  const date = dateTime.date.replaceAll("-", "/");
  const hours = String(dateTime.hours).padStart(2, "0");
  const minutes = String(dateTime.minutes).padStart(2, "0");

  return `${date}（${WEEKDAY_LABELS[dateTime.weekday]}）${hours}:${minutes} JST（日本時間）`;
};

export const formatTimeSlot = (slot: TimeSlot): string => {
  if (slot.close === null) {
    return `${slot.open}–${slot.closeLabel}`;
  }

  if (slot.usableUntil === undefined) {
    return `${slot.open}–${slot.close}`;
  }

  const usableUntilLabel = slot.usableUntilLabel ?? "最終利用";
  return `${slot.open}–${slot.close}（${usableUntilLabel} ${slot.usableUntil}）`;
};

export const formatDailySchedule = (schedule: DailySchedule | undefined): string => {
  if (schedule === undefined) {
    return "營業資訊未提供";
  }

  if (schedule === null) {
    return "今日休息";
  }

  if (schedule.length === 0) {
    return "營業資訊未提供";
  }

  return schedule.map(formatTimeSlot).join("／");
};

export const buildGoogleMapsUrl = (mapQuery: unknown): string | null => {
  if (typeof mapQuery !== "string") {
    return null;
  }
  const query = mapQuery.trim();

  if (!query) {
    return null;
  }

  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);

  return url.toString();
};

export const isValidCoordinates = (coordinates: unknown): coordinates is Coordinates => {
  if (typeof coordinates !== "object" || coordinates === null || !("lat" in coordinates) || !("lng" in coordinates)) {
    return false;
  }

  const { lat, lng } = coordinates;

  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
};
