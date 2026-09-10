import { SITE_CONFIG } from "@/data/site-config";
import type { IsoDate } from "@/types";

/** Returns whether ordinary place business information is suppressed for a date. */
export const isBusinessInfoSuppressedDate = (date: IsoDate): boolean =>
  SITE_CONFIG.businessInfoSuppressedDates.some((suppressedDate) => suppressedDate === date);
