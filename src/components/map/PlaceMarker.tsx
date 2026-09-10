"use client";

import { divIcon, type LatLngTuple, type Marker as LeafletMarker } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { Marker } from "react-leaflet";

import { getPlaceStatusPresentation } from "@/components/map/place-status-presentation";
import type { Place, PlaceStatus } from "@/types";

interface PlaceMarkerProps {
  place: Place;
  position: LatLngTuple;
  status: PlaceStatus | null;
  onSelect: (place: Place, trigger: HTMLElement | null) => void;
}

const PlaceMarker = ({ place, position, status, onSelect }: PlaceMarkerProps) => {
  const markerRef = useRef<LeafletMarker>(null);
  const presentation = getPlaceStatusPresentation(status ?? "HIDDEN");
  const statusLabel = status === null ? "營業狀態暫時無法判斷" : presentation.label;
  const accessibleLabel = `${place.name}，${statusLabel}，開啟詳細資訊`;

  const icon = useMemo(
    () =>
      divIcon({
        className: "place-marker-icon",
        html: `<span aria-hidden="true" class="place-marker-symbol ${presentation.className}">${presentation.symbol}</span>`,
        iconAnchor: [22, 44],
        iconSize: [44, 44],
      }),
    [presentation.className, presentation.symbol],
  );

  useEffect(() => {
    const markerElement = markerRef.current?.getElement();
    markerElement?.setAttribute("aria-label", accessibleLabel);
    markerElement?.setAttribute("title", accessibleLabel);
  }, [accessibleLabel]);

  return (
    <Marker
      ref={markerRef}
      alt={accessibleLabel}
      icon={icon}
      keyboard
      position={position}
      title={accessibleLabel}
      eventHandlers={{
        click: () => onSelect(place, markerRef.current?.getElement() ?? null),
      }}
    />
  );
};

export default PlaceMarker;
