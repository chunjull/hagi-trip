import type { ClockTime, TimeSlot } from "@/types";

/**
 * Returns the last time a visitor can begin using a collaboration feature.
 * Open-ended slots do not have a calculable effective close time.
 */
export const getEffectiveCloseTime = (slot: TimeSlot): ClockTime | null => {
  if (slot.close === null) {
    return null;
  }

  return slot.usableUntil ?? slot.close;
};
