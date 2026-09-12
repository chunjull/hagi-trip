"use client";

import type { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";

import PlaceMarker from "@/components/map/PlaceMarker";
import type { Place, PlaceStatus } from "@/types";

export interface MapPlaceItem {
  place: Place;
  position: LatLngTuple;
  status: PlaceStatus | null;
}

export interface MapViewProps {
  items: readonly MapPlaceItem[];
  onSelectPlace: (place: Place, trigger: HTMLElement | null) => void;
}

const MapView = ({ items, onSelectPlace }: MapViewProps) => {
  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-700" role="status">
        目前沒有可顯示於地圖的景點。
      </div>
    );
  }

  const mapBounds = items.map((item) => item.position);

  return (
    <MapContainer
      bounds={mapBounds}
      boundsOptions={{ padding: [48, 48] }}
      className="h-full min-h-0 w-full"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      {items.map((item) => (
        <PlaceMarker
          key={item.place.id}
          place={item.place}
          position={item.position}
          status={item.status}
          onSelect={onSelectPlace}
        />
      ))}
    </MapContainer>
  );
};

export default MapView;
