"use client";

import type { LatLngTuple } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MapErrorBoundary from "@/components/map/MapErrorBoundary";
import type { MapPlaceItem, MapViewProps } from "@/components/map/MapView";
import MarkerLegend from "@/components/map/MarkerLegend";
import { formatEventDateTime, isValidCoordinates } from "@/components/place/place-display";
import PlaceDetailSheet from "@/components/place/PlaceDetailSheet";
import { PLACES } from "@/data/places";
import { getEventLocalNow } from "@/domain/datetime/event-time";
import { isBusinessInfoSuppressedDate } from "@/domain/event/business-info";
import { getPlaceStatus } from "@/domain/schedule/get-place-status";
import type { Place, PlaceStatus, ZonedDateTimeParts } from "@/types";

const MapView = dynamic<MapViewProps>(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 items-center justify-center bg-paper-muted text-sm text-ink-soft" role="status">
      地圖載入中…
    </div>
  ),
});

const MAP_EXCLUDED_PLACE_IDS: ReadonlySet<Place["id"]> = new Set(["restaurant-matsuoka", "hagi-iwami-airport", "michi-no-eki-hagi-sansan-sanmi"]);

const MAP_PLACES = PLACES.filter((place) => !MAP_EXCLUDED_PLACE_IDS.has(place.id));

const getPlaceStatusSafely = (place: Place, now: ZonedDateTimeParts): PlaceStatus | null => {
  try {
    return getPlaceStatus(place, now);
  } catch {
    return null;
  }
};

interface PlaceButtonListProps {
  heading: string;
  places: readonly Place[];
  onSelectPlace: (place: Place, trigger: HTMLElement | null) => void;
}

const PlaceButtonList = ({ heading, places, onSelectPlace }: PlaceButtonListProps) => {
  if (places.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-rule bg-white p-4" aria-labelledby={`${heading}-title`}>
      <h2 className="text-sm font-semibold text-ink" id={`${heading}-title`}>
        {heading}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {places.map((place) => (
          <li key={place.id}>
            <button
              className="min-h-11 w-full rounded-md border border-rule-strong px-3 py-2 text-left text-sm font-medium text-ink hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
              lang="ja"
              type="button"
              onClick={(event) => onSelectPlace(place, event.currentTarget)}
            >
              {place.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

const MapHomeClient = () => {
  const [now, setNow] = useState<ZonedDateTimeParts | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [timeError, setTimeError] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateNow = () => {
      try {
        setNow(getEventLocalNow());
        setTimeError(false);
      } catch {
        setNow(null);
        setTimeError(true);
      }
    };

    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const placeStatuses = useMemo(() => {
    const statuses = new Map<string, PlaceStatus | null>();

    for (const place of MAP_PLACES) {
      statuses.set(place.id, now ? getPlaceStatusSafely(place, now) : null);
    }

    return statuses;
  }, [now]);

  const { mapItems, unmappedPlaces } = useMemo(() => {
    const items: MapPlaceItem[] = [];
    const unmapped: Place[] = [];

    for (const place of MAP_PLACES) {
      if (!isValidCoordinates(place.coordinates)) {
        unmapped.push(place);
        continue;
      }

      items.push({
        place,
        position: [place.coordinates.lat, place.coordinates.lng] satisfies LatLngTuple,
        status: placeStatuses.get(place.id) ?? null,
      });
    }

    return { mapItems: items, unmappedPlaces: unmapped };
  }, [placeStatuses]);

  const handleSelectPlace = useCallback((place: Place, trigger: HTMLElement | null) => {
    returnFocusRef.current = trigger;
    setSelectedPlace(place);
  }, []);

  const handleDetailClosed = useCallback(() => {
    setSelectedPlace(null);

    window.requestAnimationFrame(() => {
      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus();
      }
      returnFocusRef.current = null;
    });
  }, []);

  const businessInfoSuppressed = now ? isBusinessInfoSuppressedDate(now.date) : false;
  const selectedStatus = selectedPlace ? (placeStatuses.get(selectedPlace.id) ?? null) : null;

  return (
    <section aria-label="銀魂暦合作景點地圖" className="absolute inset-0 overflow-hidden">
      <MapErrorBoundary
        fallback={
          <div className="h-full space-y-4 overflow-y-auto bg-red-50 p-4 pt-48 sm:pt-36">
            <p className="text-sm font-semibold text-red-900" role="alert">
              地圖暫時無法顯示，仍可從下方清單查看景點詳細資訊。
            </p>
            <PlaceButtonList heading="合作景點" places={MAP_PLACES} onSelectPlace={handleSelectPlace} />
          </div>
        }
      >
        <MapView items={mapItems} onSelectPlace={handleSelectPlace} />
      </MapErrorBoundary>

      <div className="pointer-events-none absolute inset-0 z-900 flex flex-col justify-between p-3 pb-7 sm:p-5 sm:pb-7">
        <div className="space-y-2 pr-12">
          <header className="pointer-events-auto w-full max-w-sm rounded-lg border border-brand-line border-t-2 border-t-brand bg-paper/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand">活動所在地現在時間</p>
                {now ? (
                  <time className="mt-0.5 block text-sm font-semibold text-ink" dateTime={`${now.date}T${String(now.hours).padStart(2, "0")}:${String(now.minutes).padStart(2, "0")}:00+09:00`}>
                    {formatEventDateTime(now)}
                  </time>
                ) : timeError ? (
                  <p className="mt-0.5 text-sm font-semibold text-red-800" role="alert">
                    無法取得日本當地時間，暫不顯示營業狀態。
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-ink-soft" role="status">
                    正在取得日本當地時間…
                  </p>
                )}
              </div>
            </div>
          </header>

          {businessInfoSuppressed ? (
            <p className="pointer-events-auto max-w-sm rounded-lg border border-brand-line bg-brand-wash/95 px-4 py-3 text-sm leading-6 text-brand-dark shadow-lg backdrop-blur" role="status">
              11 月 28 日不提供一般營業資訊。地圖上的景點位置仍可查看，實際營業狀況請向各設施官方確認。
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="pointer-events-auto w-full max-w-md space-y-2">
            <MarkerLegend />
          </div>
        </div>
      </div>

      <PlaceDetailSheet businessInfoSuppressed={businessInfoSuppressed} now={now} place={selectedPlace} status={selectedStatus} onClosed={handleDetailClosed} />
    </section>
  );
};

export default MapHomeClient;
