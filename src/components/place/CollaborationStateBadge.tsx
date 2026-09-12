import { COLLABORATION_STATE_PRESENTATION } from "@/components/place/feature-display";
import type { CollaborationState } from "@/types";

interface CollaborationStateBadgeProps {
  state: CollaborationState;
}

const CollaborationStateBadge = ({ state }: CollaborationStateBadgeProps) => {
  const { className, label, symbol: Icon } = COLLABORATION_STATE_PRESENTATION[state];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      {label}
    </span>
  );
};

export default CollaborationStateBadge;
