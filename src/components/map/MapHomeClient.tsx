"use client";

import type { LatLngTuple } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MapErrorBoundary from "@/components/map/MapErrorBoundary";
import type { MapPlaceItem, MapViewProps } from "@/components/map/MapView";
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
    <div className="flex min-h-80 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-700" role="status">
      地圖載入中…
    </div>
  ),
});

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
    <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby={`${heading}-title`}>
      <h2 className="text-sm font-semibold text-slate-950" id={`${heading}-title`}>
        {heading}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {places.map((place) => (
          <li key={place.id}>
            <button
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
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

    for (const place of PLACES) {
      statuses.set(place.id, now ? getPlaceStatusSafely(place, now) : null);
    }

    return statuses;
  }, [now]);

  const { mapItems, unmappedPlaces } = useMemo(() => {
    const items: MapPlaceItem[] = [];
    const unmapped: Place[] = [];

    for (const place of PLACES) {
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
    <section aria-label="銀魂暦合作景點地圖" className="space-y-4">
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-medium text-slate-500">活動所在地現在時間</p>
          {now ? (
            <time className="mt-1 block text-sm font-semibold text-slate-950" dateTime={`${now.date}T${String(now.hours).padStart(2, "0")}:${String(now.minutes).padStart(2, "0")}:00+09:00`}>
              {formatEventDateTime(now)}
            </time>
          ) : timeError ? (
            <p className="mt-1 text-sm font-semibold text-red-800" role="alert">
              無法取得日本當地時間，暫不顯示營業狀態。
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-700" role="status">
              正在取得日本當地時間…
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">JST</span>
      </div>

      {businessInfoSuppressed ? (
        <p className="rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950" role="status">
          11 月 28 日不提供一般營業資訊。所有景點位置仍可查看，實際營業狀況請向各設施官方確認。
        </p>
      ) : null}

      <MapErrorBoundary
        fallback={
          <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900" role="alert">
              地圖暫時無法顯示，仍可從下方清單查看景點詳細資訊。
            </p>
            <PlaceButtonList heading="合作景點" places={PLACES} onSelectPlace={handleSelectPlace} />
          </div>
        }
      >
        <MapView items={mapItems} onSelectPlace={handleSelectPlace} />
      </MapErrorBoundary>

      <PlaceButtonList heading="尚未顯示於地圖的景點" places={unmappedPlaces} onSelectPlace={handleSelectPlace} />

      <PlaceDetailSheet
        businessInfoSuppressed={businessInfoSuppressed}
        now={now}
        place={selectedPlace}
        status={selectedStatus}
        onClosed={handleDetailClosed}
      />
    </section>
  );
};

export default MapHomeClient;
