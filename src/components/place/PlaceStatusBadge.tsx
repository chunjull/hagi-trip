import { getPlaceStatusPresentation } from "@/components/map/place-status-presentation";
import type { PlaceStatus } from "@/types";

interface PlaceStatusBadgeProps {
  status: PlaceStatus;
}

const PlaceStatusBadge = ({ status }: PlaceStatusBadgeProps) => {
  if (status === "HIDDEN") {
    return null;
  }

  const presentation = getPlaceStatusPresentation(status);

  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-semibold ${presentation.className}`}>
      <span aria-hidden="true">{presentation.symbol}</span>
      {presentation.label}
    </span>
  );
};

export default PlaceStatusBadge;
