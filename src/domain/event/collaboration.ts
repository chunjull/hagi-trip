import { SITE_CONFIG } from "@/data/site-config";
import type { CollaborationState, IsoDate, PlaceFeature } from "@/types";

type Collaboration = Pick<PlaceFeature, "activePeriod">;

/** Returns a collaboration feature's state for one normalized ISO date. */
export const getCollaborationState = (collaboration: Collaboration, date: IsoDate): CollaborationState => {
  const activePeriod = collaboration.activePeriod ?? SITE_CONFIG.eventPeriod;

  if (date < activePeriod.start) {
    return "UPCOMING";
  }
  if (date > activePeriod.end) {
    return "ENDED";
  }
  return "ACTIVE";
};
