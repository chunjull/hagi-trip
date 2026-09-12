export type IsoDate = `${number}-${number}-${number}`;
export type ClockTime = `${number}:${number}`;

export type WeekdayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type PlaceCategory = "transport" | "airport" | "attraction" | "restaurant" | "hotel";

export type PlaceStatusMode = "businessHours" | "none";

export type PlaceStatus = "OPEN" | "CLOSING_SOON" | "CLOSING_VERY_SOON" | "NOT_OPEN_YET" | "OPEN_STATUS_UNCERTAIN" | "CLOSED" | "CLOSED_TODAY" | "HIDDEN";

export type FeatureKind = "stampRally" | "sales" | "food" | "display" | "event" | "lodging" | "transport" | "kimono" | "voice" | "culturalProperty" | "photo" | "goshuin" | "supportStoreBenefit";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DateRange {
  start: IsoDate;
  end: IsoDate;
}

export type CollaborationState = "UPCOMING" | "ACTIVE" | "ENDED";

export interface FixedTimeSlot {
  open: ClockTime;
  close: ClockTime;

  /**
   * L.O. / 最終入場等，marker 狀態以此時間作為可實際利用的截止時間。
   * 若未提供，則以 close 為準。
   */
  usableUntil?: ClockTime;
  usableUntilLabel?: string;
}

export interface OpenEndedTimeSlot {
  open: ClockTime;
  close: null;
  closeLabel: string;
}

export type TimeSlot = FixedTimeSlot | OpenEndedTimeSlot;

export type DailySchedule = TimeSlot[] | null;

export interface BusinessSchedule {
  weekly: Record<WeekdayKey, DailySchedule>;

  /**
   * 指定日期優先於 weekly。
   * null 代表該日休息。
   */
  overrides?: Partial<Record<IsoDate, DailySchedule>>;
}

export interface PlaceFeature {
  id: string;
  title: string;
  kind: FeatureKind;
  description?: string;
  activePeriod?: DateRange;
  schedule?: BusinessSchedule;
  availabilityDates?: IsoDate[];
  notices?: string[];
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;

  /**
   * Leaflet marker 所需座標。
   * 本草案不自行猜測座標，待以地址進行一次性人工核對後補入。
   */
  coordinates: Coordinates | null;

  /**
   * 用來產生 Google Maps search URL。
   * 不需要在資料層硬編碼 Google place id。
   */
  mapQuery: string;

  statusMode: PlaceStatusMode;

  /**
   * 官方列為「コラボ協力店舗」，不取代實際的 category。
   */
  isCollabSupportStore?: boolean;

  /**
   * 說明 marker 狀態是以哪個設施/時間為基準。
   */
  statusBasisLabel?: string;

  /**
   * 只有 statusMode === 'businessHours' 時使用。
   */
  schedule?: BusinessSchedule;

  description?: string;
  features?: PlaceFeature[];
  notices?: string[];
  sources: SourceRef[];
}

export interface ScheduledEventSegment {
  id: string;
  label: string;
  startPlaceId: string;
  endPlaceId: string;
  start: ClockTime;
  end: ClockTime;
  description?: string;
}

export interface ScheduledEvent {
  id: string;
  name: string;
  activePeriod: DateRange;
  relatedPlaceIds: string[];
  serviceDates: IsoDate[];
  segments: ScheduledEventSegment[];
  notices?: string[];
  sources: SourceRef[];
}

export type SiteMode =
  | {
      type: "live";
    }
  | {
      type: "archive";
      frozenDateTime: string;
    };

export interface ZonedDateTimeParts {
  date: IsoDate;
  weekday: WeekdayKey;
  hours: number;
  minutes: number;
}
