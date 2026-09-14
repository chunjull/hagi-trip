"use client";

import { divIcon, type LatLngTuple, type Marker as LeafletMarker } from "leaflet";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker } from "react-leaflet";

import { getPlaceStatusPresentation } from "@/components/map/place-status-presentation";
import { PLACE_CATEGORY_ICONS } from "@/components/place/feature-display";
import { getPlaceNumber } from "@/components/place/place-number";
import type { Place, PlaceStatus } from "@/types";

interface PlaceMarkerProps {
  place: Place;
  position: LatLngTuple;
  status: PlaceStatus | null;
  onSelect: (place: Place, trigger: HTMLElement | null) => void;
}

const PLACE_MARKER_ICON_SIZE = 48;
const PLACE_MARKER_ICON_CENTER = PLACE_MARKER_ICON_SIZE / 2;

const PlaceMarker = ({ place, position, status, onSelect }: PlaceMarkerProps) => {
  const markerRef = useRef<LeafletMarker>(null);
  const presentation = getPlaceStatusPresentation(status ?? "HIDDEN");
  const statusLabel = status === null ? "營業狀態暫時無法判斷" : presentation.label;
  const placeNumber = getPlaceNumber(place.id);
  const accessibleLabel = `${placeNumber ? `景點 ${placeNumber}，` : ""}${place.name}，${statusLabel}，開啟詳細資訊`;

  const icon = useMemo(() => {
    const CategoryIcon = PLACE_CATEGORY_ICONS[place.category] ?? MapPin;
    const categoryIconMarkup = renderToStaticMarkup(
      <CategoryIcon aria-hidden="true" className="place-marker-category-glyph" size={24} strokeWidth={2} weight={place.category === "restaurant" ? "fill" : undefined} />,
    );
    const StatusIcon = presentation.symbol;
    const statusSymbolMarkup = typeof StatusIcon === "string" ? StatusIcon : renderToStaticMarkup(<StatusIcon aria-hidden="true" size={12} strokeWidth={3} />);
    const statusMarkup = status === null || status === "HIDDEN" ? "" : `<span class="place-marker-status ${presentation.className}">${statusSymbolMarkup}</span>`;

    return divIcon({
      className: "place-marker-icon",
      html: `<span aria-hidden="true" class="place-marker-composite"><span class="place-marker-category">${categoryIconMarkup}</span>${statusMarkup}</span>`,
      // The marker is a circular badge rather than a pin, so its visual center
      // must be placed on the geographic coordinate.
      iconAnchor: [PLACE_MARKER_ICON_CENTER, PLACE_MARKER_ICON_CENTER],
      iconSize: [PLACE_MARKER_ICON_SIZE, PLACE_MARKER_ICON_SIZE],
    });
  }, [place.category, placeNumber, presentation.className, presentation.symbol, status]);

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
