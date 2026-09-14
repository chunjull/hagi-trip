"use client";

import { useEffect, useState } from "react";

import { getSiteLocalNow, getSiteMode } from "@/domain/datetime/site-time";
import type { SiteMode, ZonedDateTimeParts } from "@/types";

interface SiteTimeState {
  now: ZonedDateTimeParts | null;
  mode: SiteMode | null;
  timeError: boolean;
}

export const useSiteTime = (): SiteTimeState => {
  const [state, setState] = useState<SiteTimeState>({ now: null, mode: null, timeError: false });

  useEffect(() => {
    const updateNow = () => {
      try {
        const referenceTime = new Date();
        const mode = getSiteMode(referenceTime);
        setState({ now: getSiteLocalNow(referenceTime, mode), mode, timeError: false });
      } catch {
        setState({ now: null, mode: null, timeError: true });
      }
    };

    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") updateNow();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return state;
};
