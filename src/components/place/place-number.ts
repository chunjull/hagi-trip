import { PLACES } from "@/data/places";
import type { Place } from "@/types";

// Keep the same handbook number across map, details and date groups.
const placeNumbers = new Map(PLACES.map((place, index) => [place.id, String(index + 1).padStart(2, "0")]));

export const getPlaceNumber = (placeId: Place["id"]): string | undefined => placeNumbers.get(placeId);
