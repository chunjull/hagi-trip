import type { IsoDate } from "@/types";
import type { PlaceFeature } from "@/types";
import { getCollaborationState } from "./collaboration";

export type AvailabilityDateState = "LISTED" | "NOT_LISTED" | "NOT_SPECIFIED";

/**
 * Reports only whether a date is explicitly listed by the official data.
 * Collaboration periods and business schedules remain separate concerns.
 */
export const getAvailabilityDateState = (feature: { availabilityDates?: readonly IsoDate[] }, date: IsoDate): AvailabilityDateState => {
  if (feature.availabilityDates === undefined) {
    return "NOT_SPECIFIED";
  }

  return feature.availabilityDates.includes(date) ? "LISTED" : "NOT_LISTED";
};

/** Whether date-specific schedule information can apply to this feature. */
export const isFeatureDateApplicable = (feature: PlaceFeature, date: IsoDate): boolean =>
  getCollaborationState(feature, date) === "ACTIVE" && getAvailabilityDateState(feature, date) !== "NOT_LISTED";
